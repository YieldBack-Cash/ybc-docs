"use client";

import { motion } from "motion/react";
import { useState } from "react";

const POOL = { pt: 1200, v: 800 }; // illustrative reserves, V in the base asset
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });

// An LP position is a slice of both reserves. Drag your share of the pool and see the
// PT and V it's a claim on; the ring is the pool's composition.
export function LpShare() {
  const [share, setShare] = useState(0.05);
  const total = POOL.pt + POOL.v;
  const ptFrac = POOL.pt / total;
  const arc = { cx: 50, cy: 50, r: 38, fill: "none", strokeWidth: 12 } as const;
  const GAP = 0.012;

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
            <circle {...arc} className="stroke-line" />
            <motion.circle {...arc} className="stroke-lime" initial={{ pathLength: 0 }} whileInView={{ pathLength: ptFrac - GAP }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
            <motion.circle {...arc} className="stroke-soft" initial={{ pathLength: 0, pathOffset: ptFrac }} whileInView={{ pathLength: 1 - ptFrac - GAP, pathOffset: ptFrac }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }} />
            {/* your slice, drawn over both arcs */}
            <circle {...arc} r={26} strokeWidth={6} className="stroke-yt" pathLength={1} strokeDasharray={`${share} 1`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
            <span className="text-xs text-soft">You own</span>
            <span className="text-sm font-bold text-yt tabular-nums">{(share * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="w-full space-y-2 text-sm">
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-lime" /> Pool PT <span className="ml-auto tabular-nums text-soft">{fmt(POOL.pt)}</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-soft" /> Pool V <span className="ml-auto tabular-nums text-soft">{fmt(POOL.v)}</span></div>
          <div className="rounded-lg bg-bg px-3 py-2">
            <div className="text-xs text-soft">Your LP position is a claim on</div>
            <div className="font-semibold text-ink tabular-nums">{fmt(POOL.pt * share)} PT + {fmt(POOL.v * share)} V</div>
          </div>
        </div>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm text-soft">
        <span className="w-32 shrink-0">Your share {(share * 100).toFixed(1)}%</span>
        <input type="range" min={0.005} max={0.5} step={0.005} value={share} onChange={(e) => setShare(Number(e.target.value))} className="w-full accent-(--ybc-yt)" />
      </label>
      <figcaption className="mt-3 text-xs text-soft">
        Illustrative reserves. You earn the trading fee on both legs, minus the protocol&apos;s reserve cut. As trades move the pool, the mix you hold moves with it.
      </figcaption>
    </figure>
  );
}
