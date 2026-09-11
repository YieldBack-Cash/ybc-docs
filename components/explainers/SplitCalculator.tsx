"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EASE } from "./motion";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

function Chip({ label, amount, tone }: { label: string; amount: number; tone: "v" | "pt" | "yt" }) {
  const color = tone === "pt" ? "border-lime text-lime bg-lime/10" : tone === "yt" ? "border-yt text-yt bg-yt/10" : "border-line-strong text-ink bg-bg";
  return (
    <div className={`flex min-w-24 flex-col items-center rounded-xl border px-3 py-2 ${color}`}>
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-lg font-bold tabular-nums">{fmt(amount)}</span>
    </div>
  );
}

// Split and recombine with your own numbers. Split mints shares × rate of both PT and YT
// (the deposit's asset value); recombine burns equal PT + YT for amount ÷ rate shares.
export function SplitCalculator({ defaultShares = 100, defaultRate = 1.05 }: { defaultShares?: number; defaultRate?: number }) {
  const [mode, setMode] = useState<"split" | "recombine">("split");
  const [shares, setShares] = useState(defaultShares);
  const [rate, setRate] = useState(defaultRate);
  const reduce = useReducedMotion();
  const minted = shares * rate;

  const from = mode === "split" ? [{ label: "V shares", amount: shares, tone: "v" as const }] : [
    { label: "PT", amount: minted, tone: "pt" as const },
    { label: "YT", amount: minted, tone: "yt" as const },
  ];
  const to = mode === "split" ? [
    { label: "PT", amount: minted, tone: "pt" as const },
    { label: "YT", amount: minted, tone: "yt" as const },
  ] : [{ label: "V shares", amount: shares, tone: "v" as const }];

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-line p-0.5 text-sm" role="tablist" aria-label="Operation">
          {(["split", "recombine"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 capitalize transition-colors ${mode === m ? "bg-lime text-lime-ink font-medium" : "text-soft hover:text-ink"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="text-xs text-soft">Try your own numbers</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {from.map((c, i) => (
            <motion.div key={`${mode}-from-${c.label}`} layout initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.05 }}>
              <Chip {...c} />
            </motion.div>
          ))}
          <motion.span key={`${mode}-arrow`} layout className="px-1 text-center text-xs text-soft" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
            {mode === "split" ? `× ${fmt(rate)} →` : `÷ ${fmt(rate)} →`}
          </motion.span>
          {to.map((c, i) => (
            <motion.div key={`${mode}-to-${c.label}`} layout initial={reduce ? false : { opacity: 0, x: 16, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", bounce: 0.35, duration: 0.5, delay: 0.1 + i * 0.08 }}>
              <Chip {...c} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-soft">
          Vault shares
          <input
            type="number"
            min={0}
            step="any"
            value={shares}
            onChange={(e) => setShares(Math.max(0, Number(e.target.value) || 0))}
            className="rounded-lg border border-line bg-bg px-3 py-1.5 text-ink tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-soft">
          Exchange rate: 1 share = {fmt(rate)} of the base asset
          <input type="range" min={1} max={1.3} step={0.01} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="accent-(--ybc-lime)" />
        </label>
      </div>

      <figcaption className="mt-4 rounded-lg bg-bg px-3 py-2 font-mono text-xs text-soft">
        {mode === "split"
          ? `deposit ${fmt(shares)} shares → mints ${fmt(shares)} × ${fmt(rate)} = ${fmt(minted)} PT and ${fmt(minted)} YT`
          : `redeem_combined ${fmt(minted)} PT + ${fmt(minted)} YT → ${fmt(minted)} ÷ ${fmt(rate)} = ${fmt(shares)} shares`}
      </figcaption>
    </figure>
  );
}
