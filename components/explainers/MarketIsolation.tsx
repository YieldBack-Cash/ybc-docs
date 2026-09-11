"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const MARKETS = ["Market A", "Market B", "Market C"];
const BAD = 1;

// Markets share no state. Break one vault and only its market is hit; the others
// don't notice. That containment is the safety model for permissionless creation.
export function MarketIsolation() {
  const [broken, setBroken] = useState(false);
  const reduce = useReducedMotion();

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {MARKETS.map((name, i) => {
          const hit = broken && i === BAD;
          return (
            <motion.div
              key={name}
              animate={hit && !reduce ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className={`rounded-xl border p-3 transition-colors ${hit ? "border-red-500/70 bg-red-500/10" : "border-line bg-bg"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${hit ? "bg-red-500/15 text-red-500" : "bg-lime/15 text-lime"}`}>
                  {hit ? "Vault failed" : broken ? "Unaffected" : "Healthy"}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-soft">
                {["Vault", "Yield manager", "AMM pool", "Its depositors"].map((part) => (
                  <li key={part} className={`rounded-md px-2 py-1 ${hit ? "bg-red-500/10 text-red-500" : "bg-surface"}`}>{part}</li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-soft">Each market has its own vault, yield manager and pool. Nothing is shared.</p>
        <button
          onClick={() => setBroken((b) => !b)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${broken ? "border border-line text-ink hover:bg-bg" : "bg-red-500 text-white hover:bg-red-600"}`}
        >
          {broken ? "Reset" : "Break Market B's vault"}
        </button>
      </div>
    </figure>
  );
}
