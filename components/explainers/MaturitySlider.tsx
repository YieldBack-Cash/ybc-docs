"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const W = 320, H = 176, L = 44, R = 14;
const PANEL = { pt: { top: 14, h: 58 }, yt: { top: 98, h: 58 } };
// rounded: server and browser Math.exp can differ in the last digit, which breaks hydration
const r2 = (n: number) => Math.round(n * 100) / 100;
const x = (f: number) => r2(L + f * (W - L - R)); // f: 0 (start) .. 1 (maturity)
const py = (p: { top: number; h: number }, v: number, lo: number, hi: number) => r2(p.top + (1 - (v - lo) / (hi - lo || 1)) * p.h);

// PT = e^(−r·t) for t years left, with r = ln(1 + APY): the pool's implied-rate pricing, as in
// the app, so buying PT at a given APY compounds to exactly 1 at maturity. YT = 1 − PT.
const ptAt = (apy: number, yearsLeft: number) => Math.exp(-Math.log(1 + apy) * Math.max(yearsLeft, 0));

// Drag through a market's life: PT climbs to face value (1) while YT decays to 0, and the
// yield you'd lock by buying PT at that point is the gap to 1. `apy` is the implied rate.
export function MaturitySlider({ termDays = 180, defaultApy = 0.08 }: { termDays?: number; defaultApy?: number }) {
  const [day, setDay] = useState(0);
  const [apy, setApy] = useState(defaultApy);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);
  const play = () => {
    stop.current?.();
    if (reduce) return setDay(termDays);
    setPlaying(true);
    const controls = animate(day >= termDays ? 0 : day, termDays, {
      duration: 4,
      ease: "linear",
      onUpdate: (v) => setDay(Math.round(v)),
      onComplete: () => setPlaying(false),
    });
    stop.current = () => { controls.stop(); setPlaying(false); };
  };

  const yearsLeft = (f: number) => ((1 - f) * termDays) / 365;
  const ptMin = ptAt(apy, termDays / 365); // PT's price on day 0, the bottom of its panel
  const f = day / termDays;
  const pt = ptAt(apy, yearsLeft(f));
  const yt = 1 - pt;
  const daysLeft = termDays - day;

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      {/* two panels with their own scales: over one term PT only moves a few cents, so on a
          shared 0-1 axis both lines would look flat. Mirror images, since PT + YT = 1. */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Day ${day} of ${termDays}: PT ${pt.toFixed(4)}, YT ${yt.toFixed(4)}`}>
        {([
          { key: "pt", p: PANEL.pt, lo: ptMin, hi: 1, fn: (g: number) => ptAt(apy, yearsLeft(g)), v: pt, name: "PT price", fill: "fill-lime", stroke: "stroke-lime" },
          { key: "yt", p: PANEL.yt, lo: 0, hi: 1 - ptMin, fn: (g: number) => 1 - ptAt(apy, yearsLeft(g)), v: yt, name: "YT value", fill: "fill-yt", stroke: "stroke-yt" },
        ] as const).map(({ key, p, lo, hi, fn, v, name, fill, stroke }) => (
          <g key={key}>
            <text x={L} y={p.top - 4} fontSize="9" className={`${fill} font-semibold`}>{name}</text>
            <line x1={L} x2={W - R} y1={p.top} y2={p.top} strokeDasharray="2 4" className="stroke-line" />
            <line x1={L} x2={W - R} y1={p.top + p.h} y2={p.top + p.h} className="stroke-line" />
            <text x={L - 6} y={p.top + 3} fontSize="9" textAnchor="end" className="fill-soft">{hi.toFixed(3)}</text>
            <text x={L - 6} y={p.top + p.h + 3} fontSize="9" textAnchor="end" className="fill-soft">{lo.toFixed(3)}</text>
            <path
              d={Array.from({ length: 61 }, (_, i) => i / 60).map((g, i) => `${i ? "L" : "M"}${x(g)} ${py(p, fn(g), lo, hi)}`).join(" ")}
              fill="none" strokeWidth="2.5" className={stroke}
            />
            <circle cx={x(f)} cy={py(p, v, lo, hi)} r="4.5" className={fill} />
          </g>
        ))}
        <line x1={x(f)} x2={x(f)} y1={PANEL.pt.top} y2={PANEL.yt.top + PANEL.yt.h} className="stroke-line-strong" />
        <text x={x(0)} y={H - 4} fontSize="9" className="fill-soft">Start</text>
        <text x={x(1)} y={H - 4} fontSize="9" textAnchor="end" className="fill-soft">Maturity</text>
      </svg>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={playing ? () => stop.current?.() : play}
          className="shrink-0 rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-lime-ink transition-opacity hover:opacity-90"
        >
          {playing ? "Pause" : day >= termDays ? "Replay" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={termDays}
          value={day}
          onChange={(e) => { stop.current?.(); setDay(Number(e.target.value)); }}
          aria-label="Day in the market's term"
          className="w-full accent-(--ybc-lime)"
        />
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm text-soft">
        <span className="shrink-0">Implied APY {(apy * 100).toFixed(1)}%</span>
        <input type="range" min={0.01} max={0.3} step={0.005} value={apy} onChange={(e) => setApy(Number(e.target.value))} className="w-full accent-(--ybc-yt)" />
      </label>

      <figcaption className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Day</div>
          <div className="font-semibold text-ink tabular-nums">{day} of {termDays}{daysLeft ? ` · ${daysLeft} left` : " · matured"}</div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">Buy 1 PT now</div>
          <div className="font-semibold text-lime tabular-nums">
            {daysLeft ? `${pt.toFixed(4)} → 1 (+${((1 / pt - 1) * 100).toFixed(2)}%)` : "Redeems 1:1"}
          </div>
        </div>
        <div className="rounded-lg bg-bg px-3 py-2">
          <div className="text-xs text-soft">YT still to earn</div>
          <div className="font-semibold text-yt tabular-nums">{daysLeft ? `≈ ${yt.toFixed(4)} per YT` : "Nothing left"}</div>
        </div>
      </figcaption>
    </figure>
  );
}
