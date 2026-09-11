"use client";

import { useState } from "react";

// An illustrative pool, priced with the AMM's own curve (contracts/amm/amm/src/curve.rs,
// Pendle V2's): p = PT / (PT + V), rate_scalar = scalar_root / years,
// exchange_rate = ln(p / (1 − p)) / rate_scalar + anchor, PT price = 1 / exchange_rate,
// with the post-trade PT over the pre-trade total. Before the pool's fee.
const POOL = { pt: 1000, v: 1000, apy: 0.08, days: 90, band: [0, 0.2] as const };
const LN9 = Math.log(9);
const years = POOL.days / 365;
const scalarRoot = (2 * LN9) / (POOL.band[1] - POOL.band[0]);
const rateScalar = scalarRoot / years;
const logit = (p: number) => Math.log(p / (1 - p));
const exchangeRateAt = (apy: number) => Math.exp(Math.log(1 + apy) * years);
const anchor = exchangeRateAt(POOL.apy) - logit(POOL.pt / (POOL.pt + POOL.v)) / rateScalar;
const apyFromExchangeRate = (er: number) => Math.exp(Math.log(er) / years) - 1;

// size > 0 buys PT from the pool, size < 0 sells PT into it. null past the curve's bounds.
function trade(size: number) {
  const total = POOL.pt + POOL.v;
  const p = (POOL.pt - size) / total;
  if (p < 0.01 || p > 0.96) return null; // MIN_PROPORTION / MAX_PROPORTION
  const er = logit(p) / rateScalar + anchor;
  if (er <= 1) return null; // PT above face value: the pool refuses
  const v = Math.abs(size) / er; // V paid in (buy) or out (sell)
  const pt2 = POOL.pt - size, v2 = POOL.v + (size > 0 ? v : -v);
  const erAfter = logit(pt2 / (pt2 + v2)) / rateScalar + anchor;
  return { price: 1 / er, v, apyAfter: apyFromExchangeRate(erAfter), locked: apyFromExchangeRate(er) };
}

const SPOT = 1 / exchangeRateAt(POOL.apy);
// the biggest trade the pool will fill on each side (past it, PT would price above face
// value or the pool's PT share would leave its bounds), so the slider stops there
const maxSize = (sign: 1 | -1) => { let s = 0; while (s < 2000 && trade(sign * (s + 10))) s += 10; return s; };
const MAX = { buy: maxSize(1), sell: maxSize(-1) };
const W = 320, H = 140, L = 44, R = 12, T = 12, B = 24;

// Drag the trade size and watch the price move: a bigger trade walks further along the
// curve, so its average price is worse and the pool's implied APY shifts.
export function TradeImpact() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [size, setSize] = useState(100);
  const sign = side === "buy" ? 1 : -1;
  const max = MAX[side];
  const shown = Math.min(size, max);
  const r = trade(sign * shown)!;

  // price curve over the slider's range, scaled to what it actually spans
  const pts = Array.from({ length: 41 }, (_, i) => (i / 40) * max).map((s) => ({ s, t: trade(sign * s) })).filter((d) => d.t);
  const prices = pts.map((d) => d.t!.price);
  const lo = Math.min(...prices, SPOT), hi = Math.max(...prices, SPOT);
  const x = (s: number) => Math.round((L + (s / max) * (W - L - R)) * 100) / 100;
  const y = (v: number) => Math.round((T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B)) * 100) / 100;
  const impact = (r.price / SPOT - 1) * 100;

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-line p-0.5 text-sm" role="tablist" aria-label="Side">
          {(["buy", "sell"] as const).map((s) => (
            <button key={s} role="tab" aria-selected={side === s} onClick={() => setSide(s)}
              className={`rounded-md px-3 py-1 transition-colors ${side === s ? "bg-lime text-lime-ink font-medium" : "text-soft hover:text-ink"}`}>
              {s === "buy" ? "Buy PT" : "Sell PT"}
            </button>
          ))}
        </div>
        <span className="text-xs text-soft">Illustrative pool, before fees</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={`${side === "buy" ? "Buying" : "Selling"} ${shown} PT: average price ${r.price.toFixed(4)}`}>
        <text x={L - 6} y={y(hi) + 3} fontSize="9" textAnchor="end" className="fill-soft">{hi.toFixed(3)}</text>
        <text x={L - 6} y={y(lo) + 3} fontSize="9" textAnchor="end" className="fill-soft">{lo.toFixed(3)}</text>
        <line x1={L} x2={W - R} y1={y(SPOT)} y2={y(SPOT)} strokeDasharray="3 4" className="stroke-line-strong" />
        <text x={W - R} y={y(SPOT) - 4} fontSize="9" textAnchor="end" className="fill-soft">spot {SPOT.toFixed(4)}</text>
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="stroke-line" />
        <text x={L} y={H - 8} fontSize="9" className="fill-soft">0 PT</text>
        <text x={W - R} y={H - 8} fontSize="9" textAnchor="end" className="fill-soft">{max} PT (pool limit)</text>
        <path d={pts.map((d, i) => `${i ? "L" : "M"}${x(d.s)} ${y(d.t!.price)}`).join(" ")} fill="none" strokeWidth="2.5" className="stroke-lime" />
        <circle cx={x(shown)} cy={y(r.price)} r="5" className="fill-lime" />
      </svg>

      <label className="mt-2 flex items-center gap-3 text-sm text-soft">
        <span className="w-28 shrink-0">Trade size {shown} PT</span>
        <input type="range" min={0} max={max} step={10} value={shown} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-(--ybc-lime)" />
      </label>

      <figcaption className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Average price per PT</div>
          <div className="font-semibold text-ink tabular-nums">{r.price.toFixed(4)} <span className="text-xs font-normal text-soft">({impact >= 0 ? "+" : ""}{impact.toFixed(2)}% vs spot)</span></div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">{side === "buy" ? "Fixed APY you lock" : "Implied APY you sell at"}</div>
          <div className="font-semibold text-lime tabular-nums">{(r.locked * 100).toFixed(2)}% <span className="text-xs font-normal text-soft">(spot {(POOL.apy * 100).toFixed(0)}%)</span></div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Pool&apos;s implied APY after</div>
          <div className="font-semibold text-ink tabular-nums">{(r.apyAfter * 100).toFixed(2)}%</div>
        </div>
      </figcaption>
      <p className="mt-3 text-xs text-soft">
        Pool: {POOL.pt.toLocaleString("en-US")} PT and {POOL.v.toLocaleString("en-US")} of V (in the base asset), {(POOL.apy * 100).toFixed(0)}% implied APY, {POOL.days} days to maturity, APY band {POOL.band[0] * 100}–{POOL.band[1] * 100}%.
        Your slippage bound (<code>max_v_in</code> / <code>min_v_out</code>) is what stops a trade filling at a worse point than you accepted.
      </p>
    </figure>
  );
}
