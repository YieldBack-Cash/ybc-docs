"use client";

import { useState } from "react";

// Put 100 of the base asset into PT, YT, or just hold the vault, then pick what the vault
// actually earns until maturity. PT's return is fixed at purchase; YT's swings with the
// realised rate, levered, and breaks even where realised = implied.
//   PT price = (1 + implied)^−t; 1 PT pays 1 at maturity.
//   YT price = 1 − PT price; 1 YT earns the vault's growth on 1 unit: (1 + realised)^t − 1.
const T_DAYS = 180, STAKE = 100, MAX_APY = 0.2;
const t = T_DAYS / 365;
const W = 320, H = 170, L = 54, R = 12, TOP = 12, B = 26;

function returns(implied: number, realised: number) {
  const pt = Math.pow(1 + implied, -t);
  const ytEarn = Math.pow(1 + realised, t) - 1;
  return {
    pt: (STAKE / pt) * 1 - STAKE,
    yt: (STAKE / (1 - pt)) * ytEarn - STAKE,
    hold: STAKE * ytEarn,
    leverage: 1 / (1 - pt),
  };
}

export function PayoffChart() {
  const [implied, setImplied] = useState(0.08);
  const [realised, setRealised] = useState(0.1);
  const now = returns(implied, realised);

  const xs = Array.from({ length: 41 }, (_, i) => (i / 40) * MAX_APY);
  const series = xs.map((r) => returns(implied, r));
  const lo = Math.max(-STAKE, Math.min(...series.map((s) => s.yt))), hi = Math.max(...series.map((s) => s.yt), now.pt);
  const x = (r: number) => Math.round((L + (r / MAX_APY) * (W - L - R)) * 100) / 100;
  const y = (v: number) => Math.round((TOP + (1 - (Math.max(v, lo) - lo) / (hi - lo || 1)) * (H - TOP - B)) * 100) / 100;
  const line = (k: "pt" | "yt" | "hold") => series.map((s, i) => `${i ? "L" : "M"}${x(xs[i])} ${y(s[k])}`).join(" ");
  const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-soft">Put <span className="font-semibold text-ink">{STAKE}</span> in for {T_DAYS} days. What you end with depends on what the vault really earns:</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={`At ${(realised * 100).toFixed(1)}% realised APY: PT ${pct(now.pt)}, YT ${pct(now.yt)}, holding ${pct(now.hold)}`}>
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} className="stroke-line-strong" />
        <text x={L - 6} y={y(0) + 3} fontSize="9" textAnchor="end" className="fill-soft">0%</text>
        <text x={L - 6} y={y(hi) + 3} fontSize="9" textAnchor="end" className="fill-soft">{pct(hi)}</text>
        <text x={L - 6} y={y(lo) + 3} fontSize="9" textAnchor="end" className="fill-soft">{pct(lo)}</text>
        <line x1={x(implied)} x2={x(implied)} y1={TOP} y2={H - B} strokeDasharray="3 4" className="stroke-line-strong" />
        <text x={x(implied) + 4} y={TOP + 8} fontSize="9" className="fill-soft">YT = PT here · YT wins to the right</text>
        <path d={line("hold")} fill="none" strokeWidth="1.5" className="stroke-soft" />
        <path d={line("pt")} fill="none" strokeWidth="2.5" className="stroke-lime" />
        <path d={line("yt")} fill="none" strokeWidth="2.5" className="stroke-yt" />
        <line x1={x(realised)} x2={x(realised)} y1={TOP} y2={H - B} className="stroke-ink" strokeOpacity="0.5" />
        <circle cx={x(realised)} cy={y(now.pt)} r="4" className="fill-lime" />
        <circle cx={x(realised)} cy={y(now.yt)} r="4" className="fill-yt" />
        <text x={L} y={H - 8} fontSize="9" className="fill-soft">Realised APY 0%</text>
        <text x={W - R} y={H - 8} fontSize="9" textAnchor="end" className="fill-soft">{MAX_APY * 100}%</text>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-soft">
          What the vault actually earns: {(realised * 100).toFixed(1)}% APY
          <input type="range" min={0} max={MAX_APY} step={0.0025} value={realised} onChange={(e) => setRealised(Number(e.target.value))} className="accent-(--ybc-yt)" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-soft">
          Implied APY when you buy: {(implied * 100).toFixed(1)}%
          <input type="range" min={0.01} max={0.18} step={0.0025} value={implied} onChange={(e) => setImplied(Number(e.target.value))} className="accent-(--ybc-lime)" />
        </label>
      </div>

      <figcaption className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Buy PT</div>
          <div className="font-semibold text-lime tabular-nums">{pct(now.pt)}</div>
          <div className="text-xs text-soft">fixed, whatever happens</div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Buy YT</div>
          <div className="font-semibold text-yt tabular-nums">{pct(now.yt)}</div>
          <div className="text-xs text-soft">yield on ≈ {now.leverage.toFixed(0)}× your stake</div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Just hold the vault</div>
          <div className="font-semibold text-ink tabular-nums">{pct(now.hold)}</div>
          <div className="text-xs text-soft">for comparison</div>
        </div>
      </figcaption>
      <p className="mt-3 text-xs text-soft">
        Simplified: ignores fees and price impact, and YT&apos;s yield is shown paid at maturity. YT can lose most of its value if the vault earns little.
      </p>
    </figure>
  );
}
