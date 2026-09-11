"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "./motion";

type Actor = "user" | "ym" | "amm";
type Token = "V" | "PT" | "YT";
type Step = { text: string; moves?: { token: Token; from: Actor; to: Actor; note?: string }[]; call?: [Actor, Actor, string]; at?: { actor: Actor; label: string } };

// The step lists on this page, as moves between three parties.
const FLOWS: Record<"buy" | "sell", { title: string; steps: Step[] }> = {
  buy: {
    title: "Buying YT",
    steps: [
      { text: "The AMM advances vault shares to the yield manager: its payment for the PT it's about to buy.", moves: [{ token: "V", from: "amm", to: "ym", note: "v_from_pool" }] },
      { text: "The AMM calls the yield manager back with the trade's numbers and the vault rate it already read.", call: ["amm", "ym", "on_flash_receive_pt"] },
      { text: "The yield manager pulls up to max_v_in from you and refunds the excess. What you actually pay is the YT price.", moves: [{ token: "V", from: "user", to: "ym", note: "user_cost" }] },
      { text: "It mints yt_out PT and yt_out YT. The YT goes to you.", at: { actor: "ym", label: "mint PT + YT" }, moves: [{ token: "YT", from: "ym", to: "user", note: "yt_out" }] },
      { text: "It repays the AMM in PT and checks it leaked none.", moves: [{ token: "PT", from: "ym", to: "amm", note: "yt_out PT" }] },
    ],
  },
  sell: {
    title: "Selling YT",
    steps: [
      { text: "The router moves your YT to the yield manager first, so you sign a fixed transfer rather than something that depends on pool state.", moves: [{ token: "YT", from: "user", to: "ym", note: "yt_in" }] },
      { text: "The AMM lends the same amount of PT to the yield manager.", moves: [{ token: "PT", from: "amm", to: "ym", note: "pt_borrowed" }] },
      { text: "The AMM calls the yield manager back.", call: ["amm", "ym", "on_flash_receive_v"] },
      { text: "The yield manager burns the PT + YT pair back into vault shares.", at: { actor: "ym", label: "burn PT + YT → V" } },
      { text: "It repays what the AMM is owed in vault shares and sends you the rest (at least min_v_out).", moves: [{ token: "V", from: "ym", to: "amm", note: "v_owed" }, { token: "V", from: "ym", to: "user", note: "the rest" }] },
    ],
  },
};

const X: Record<Actor, number> = { user: 50, ym: 160, amm: 270 };
const NAMES: Record<Actor, string> = { user: "You", ym: "Yield manager", amm: "AMM" };
const TONE: Record<Token, string> = { V: "fill-surface stroke-line-strong", PT: "fill-lime/20 stroke-lime", YT: "fill-yt/20 stroke-yt" };

// Step through how YT is bought and sold inside one transaction: each step moves a token
// between you, the yield manager and the AMM, or makes a callback.
export function FlashSwapSteps() {
  const [flow, setFlow] = useState<"buy" | "sell">("buy");
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const reduce = useReducedMotion();
  const { steps } = FLOWS[flow];
  const s = steps[step];

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => (step < steps.length - 1 ? setStep(step + 1) : setAuto(false)), 2200);
    return () => clearTimeout(t);
  }, [auto, step, steps.length]);

  const pick = (f: "buy" | "sell") => { setFlow(f); setStep(0); setAuto(false); };

  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <div className="inline-flex rounded-lg border border-line p-0.5 text-sm" role="tablist" aria-label="Flow">
        {(["buy", "sell"] as const).map((f) => (
          <button key={f} role="tab" aria-selected={flow === f} onClick={() => pick(f)}
            className={`rounded-md px-3 py-1 transition-colors ${flow === f ? "bg-lime text-lime-ink font-medium" : "text-soft hover:text-ink"}`}>
            {FLOWS[f].title}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 150" className="mx-auto mt-4 w-full max-w-md" aria-hidden="true">
        {(Object.keys(X) as Actor[]).map((a) => (
          <g key={a}>
            <rect x={X[a] - 44} y={92} width={88} height={40} rx={10} className={`fill-bg ${s.at?.actor === a || s.moves?.some((m) => m.from === a || m.to === a) || s.call?.includes(a) ? "stroke-lime" : "stroke-line"}`} />
            <text x={X[a]} y={116} fontSize="11" textAnchor="middle" className="fill-ink font-medium">{NAMES[a]}</text>
          </g>
        ))}
        <AnimatePresence mode="wait">
          <motion.g key={`${flow}-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {s.call && (
              <g>
                <motion.path d={`M${X[s.call[0]]} 88 Q${(X[s.call[0]] + X[s.call[1]]) / 2} 40 ${X[s.call[1]]} 88`} fill="none" strokeDasharray="4 4" className="stroke-soft"
                  initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
                <text x={(X[s.call[0]] + X[s.call[1]]) / 2} y={52} fontSize="9.5" textAnchor="middle" className="fill-soft font-mono">{s.call[2]}()</text>
              </g>
            )}
            {s.at && (
              <motion.text x={X[s.at.actor]} y={76} fontSize="10" textAnchor="middle" className="fill-lime font-semibold"
                initial={reduce ? false : { y: 86, opacity: 0 }} animate={{ y: 76, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }}>
                {s.at.label}
              </motion.text>
            )}
            {s.moves?.map((m, i) => (
              <motion.g key={i} initial={reduce ? false : { x: X[m.from] - 160 }} animate={{ x: X[m.to] - 160 }}
                transition={{ duration: 1, ease: EASE, delay: 0.25 + i * 0.35 + (s.at ? 0.4 : 0) }}>
                <circle cx={160} cy={i ? 44 : 64} r={14} className={TONE[m.token]} />
                <text x={160} y={(i ? 44 : 64) + 4} fontSize="10" textAnchor="middle" className="fill-ink font-bold">{m.token}</text>
                {m.note && <text x={160} y={(i ? 44 : 64) - 18} fontSize="8.5" textAnchor="middle" className="fill-soft font-mono">{m.note}</text>}
              </motion.g>
            ))}
          </motion.g>
        </AnimatePresence>
      </svg>

      <ol className="mt-2 space-y-1.5 text-sm">
        {steps.map((st, i) => (
          <li key={i}>
            <button onClick={() => { setStep(i); setAuto(false); }}
              className={`flex w-full gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${i === step ? "bg-lime/10 text-ink" : "text-soft hover:bg-bg"}`}>
              <span className={`font-mono text-xs leading-5 ${i === step ? "text-lime" : ""}`}>{i + 1}</span>
              <span>{st.text}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex justify-end gap-2">
        <button onClick={() => { setAuto(false); setStep((i) => Math.max(0, i - 1)); }} disabled={step === 0}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:bg-bg disabled:opacity-40">Back</button>
        <button onClick={() => { if (step === steps.length - 1) { setStep(0); setAuto(true); } else setAuto((a) => !a); }}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:bg-bg">{auto ? "Pause" : step === steps.length - 1 ? "Replay" : "Play"}</button>
        <button onClick={() => { setAuto(false); setStep((i) => Math.min(steps.length - 1, i + 1)); }} disabled={step === steps.length - 1}
          className="rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-lime-ink hover:opacity-90 disabled:opacity-40">Next</button>
      </div>
    </figure>
  );
}
