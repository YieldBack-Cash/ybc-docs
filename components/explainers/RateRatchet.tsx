"use client";

import { motion, useReducedMotion } from "motion/react";

const W = 320, H = 160, PAD = { l: 12, r: 12, t: 16, b: 26 };
const MATURITY = 0.72; // where on the time axis the market matures

// A made-up vault rate: grows, dips twice, keeps growing after maturity.
const VAULT = [1.0, 1.012, 1.02, 1.017, 1.009, 1.022, 1.034, 1.041, 1.036, 1.028, 1.039, 1.05, 1.058, 1.066, 1.071, 1.079];
const MIN = 0.995, MAX = 1.085;
const px = (i: number) => PAD.l + (i / (VAULT.length - 1)) * (W - PAD.l - PAD.r);
const py = (v: number) => PAD.t + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD.t - PAD.b);

// The stored rate: max(stored, vault) while the market is live, frozen at maturity.
const matIdx = Math.round(MATURITY * (VAULT.length - 1));
const STORED = VAULT.reduce<number[]>((acc, v, i) => [...acc, i === 0 ? v : i > matIdx ? acc[matIdx] : Math.max(acc[i - 1], v)], []);
const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");

// "Only ever moves up, and freezes at maturity": the vault's own rate wobbles, the stored
// rate ratchets up past each dip, then locks at maturity while the vault carries on.
export function RateRatchet() {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce ? {} : {
      initial: { pathLength: 0 },
      whileInView: { pathLength: 1 },
      viewport: { once: false, amount: 0.6 },
      transition: { duration: 2.2, ease: "linear" as const, delay },
    };
  return (
    <figure className="not-prose my-6 rounded-2xl border border-line bg-surface p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="The vault rate dips twice; the stored rate never goes down and stays flat after maturity">
        <rect x={px(matIdx)} y={PAD.t} width={W - PAD.r - px(matIdx)} height={H - PAD.t - PAD.b} className="fill-bg" />
        <line x1={px(matIdx)} x2={px(matIdx)} y1={PAD.t} y2={H - PAD.b} strokeDasharray="3 4" className="stroke-line-strong" />
        <text x={px(matIdx) + 5} y={H - PAD.b - 6} fontSize="9" className="fill-soft">Maturity: rate locks</text>
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="stroke-line" />
        <text x={PAD.l} y={H - 8} fontSize="9" className="fill-soft">Time →</text>

        <motion.path d={path(VAULT)} fill="none" strokeWidth="1.4" className="stroke-soft" {...draw(0)} />
        <motion.path d={path(STORED)} fill="none" strokeWidth="2.8" strokeLinejoin="round" className="stroke-lime" {...draw(0.25)} />
        {/* the dips the stored rate refuses to follow */}
        {[4, 9].map((i) => (
          <motion.circle key={i} cx={px(i)} cy={py(VAULT[i])} r="3.5" className="fill-surface stroke-soft"
            initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ amount: 0.6 }} transition={{ delay: 0.6 + i * 0.12 }} />
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-soft">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-lime" /> Stored rate: max(stored, vault), frozen at maturity</span>
        <span className="flex items-center gap-1.5"><span className="h-px w-5 bg-soft" /> The vault&apos;s own rate</span>
      </figcaption>
    </figure>
  );
}
