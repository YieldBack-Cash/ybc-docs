"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Stage = { label: string; tone?: "pt" | "yt" | "lp" };
type Hop = string; // the operation between two stages

// The zaps table on this page, entering from the base asset. Exiting runs the same path backwards.
// hops[i] joins stages[i] and stages[i + 1]; exitHops are the same legs walked back.
const ZAPS: Record<string, { name: string; exitName: string; stages: Stage[]; hops: Hop[]; exitHops: Hop[] }> = {
  pt: { name: "zap_asset_for_pt", exitName: "zap_pt_for_asset", stages: [{ label: "Asset" }, { label: "V" }, { label: "PT", tone: "pt" }], hops: ["vault deposit", "AMM swap"], exitHops: ["AMM swap", "vault redeem"] },
  yt: { name: "zap_asset_for_yt", exitName: "zap_yt_for_asset", stages: [{ label: "Asset" }, { label: "V" }, { label: "YT", tone: "yt" }], hops: ["vault deposit", "flash swap"], exitHops: ["flash swap", "vault redeem"] },
  split: { name: "zap_asset_for_split", exitName: "zap_split_for_asset", stages: [{ label: "Asset" }, { label: "V" }, { label: "PT + YT", tone: "pt" }], hops: ["vault deposit", "mint"], exitHops: ["burn", "vault redeem"] },
  lp: { name: "zap_asset_for_lp", exitName: "zap_lp_for_asset", stages: [{ label: "Asset" }, { label: "V" }, { label: "PT + V" }, { label: "LP", tone: "lp" }], hops: ["vault deposit", "buy pt_to_buy PT", "AMM deposit"], exitHops: ["AMM withdraw", "sell PT", "vault redeem"] },
};
const TONE = { pt: "border-lime text-lime bg-lime/10", yt: "border-yt text-yt bg-yt/10", lp: "border-lime text-lime bg-lime/10" };

// One zap, animated: a token walks the path from your base asset to the position, every leg
// inside a single transaction, with one slippage bound in base-asset terms for the lot.
export function ZapFlow() {
  const [key, setKey] = useState<keyof typeof ZAPS>("lp");
  const [exit, setExit] = useState(false);
  const [lit, setLit] = useState(0);
  const reduce = useReducedMotion();
  const zap = ZAPS[key];
  const stages = exit ? [...zap.stages].reverse() : zap.stages;
  const hops = exit ? zap.exitHops : zap.hops;

  // light the stages one by one, then hold, then start over
  useEffect(() => {
    if (reduce) { setLit(stages.length - 1); return; }
    setLit(0);
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % (stages.length + 2); setLit(Math.min(i, stages.length - 1)); }, 900);
    return () => clearInterval(id);
  }, [key, exit, stages.length, reduce]);

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Zap">
          {Object.entries(ZAPS).map(([k, z]) => (
            <button key={k} role="tab" aria-selected={key === k} onClick={() => setKey(k)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${key === k ? "border-lime bg-lime text-lime-ink font-medium" : "border-line text-soft hover:text-ink"}`}>
              {z.stages.at(-1)!.label}
            </button>
          ))}
        </div>
        <button onClick={() => setExit((e) => !e)} className="rounded-md border border-line px-2.5 py-1 text-xs text-soft hover:text-ink">
          {exit ? "Show entering" : "Show exiting"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-y-3" aria-live="polite">
        {stages.map((s, i) => (
          <div key={`${key}-${exit}-${i}`} className="flex items-center">
            {i > 0 && (
              <div className="flex w-20 flex-col items-center px-1 sm:w-24">
                <span className="text-center text-[10px] leading-tight text-soft">{hops[i - 1]}</span>
                <div className="relative mt-1 h-0.5 w-full overflow-hidden rounded bg-line">
                  <motion.div className="absolute inset-y-0 left-0 bg-lime" initial={false} animate={{ width: lit >= i ? "100%" : "0%" }} transition={{ duration: reduce ? 0 : 0.6 }} />
                </div>
              </div>
            )}
            <motion.div
              initial={false}
              animate={{ scale: lit === i ? 1.08 : 1, opacity: lit >= i ? 1 : 0.4 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${s.tone ? TONE[s.tone] : "border-line-strong bg-bg text-ink"}`}
            >
              {s.label}
            </motion.div>
          </div>
        ))}
      </div>

      <figcaption className="mt-5 rounded-lg bg-bg px-3 py-2 text-xs text-soft">
        <code className="text-ink">{exit ? zap.exitName : zap.name}</code>: every leg settles in one
        transaction, and the slippage bound is set once, in the base asset (<code>{exit ? "min_asset_out" : "max_asset_in"}</code>), covering pool price and vault rate together.
      </figcaption>
    </figure>
  );
}
