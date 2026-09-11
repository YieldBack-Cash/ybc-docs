"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { EASE, useLoop } from "./motion";
import { hop, LOCK_BODY, scribble, SHACKLE } from "./yuiMotions";

// The protocol in five steps, one at a time: the landing page's animated scenes
// (YieldBack-Cash/landing-page, app/components/HowItWorks.tsx) with the same copy,
// as a stepper that fits the docs column.
const STEPS: { title: string; body: string; visual: () => ReactNode; className?: string }[] = [
  {
    title: "Pick a market",
    body: "Each market wraps a yield-bearing vault, like Blend's XLM lending pool, until a fixed maturity date. Its yield is split into two tradable tokens, PT and YT.",
    visual: MarketVisual,
    className: "lg:col-span-2",
  },
  {
    title: "Lock a fixed yield with PT",
    body: "PT is bought at a discount, and each one redeems for 1 of the underlying asset at maturity. That difference is your yield, locked in upfront regardless of market movement.",
    visual: LockVisual,
    className: "lg:col-span-2",
  },
  {
    title: "Or trade the yield with YT",
    body: "YT gives you all the variable yield until maturity, then its value decays to zero. If the underlying APY drops below the implied APY, you may receive less than expected.",
    visual: DecayVisual,
    className: "lg:col-span-2",
  },
  {
    title: "Hold to maturity, or exit anytime",
    body: "At maturity, redeem PT for full value and claim YT yield from Positions. Selling before maturity uses the current market price, which may be below face value.",
    visual: TimelineVisual,
    className: "lg:col-span-3",
  },
  {
    title: "Split and combine",
    body: "Split deposits your asset into the vault and mints a matched pair of PT and YT, with no trade against the pool. Combine burns an equal amount of PT and YT to redeem the underlying directly.",
    visual: SplitVisual,
    className: "md:col-span-2 lg:col-span-3",
  },
];

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  const { title, body, visual: Visual } = STEPS[step];
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface">
      <div aria-hidden className="relative flex h-48 items-center justify-center border-b border-line bg-bg/50 px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="flex h-full w-full items-center justify-center"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <Visual />
          </motion.div>
        </AnimatePresence>
      </div>
      <figcaption className="p-5">
        <p className="text-sm font-medium text-lime">
          Step {step + 1} of {STEPS.length}
        </p>
        <h3 className="mt-1 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1.5 leading-relaxed text-soft">{body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" role="tablist" aria-label="Steps">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={i === step}
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-lime" : "w-2 bg-line-strong hover:bg-soft"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-bg disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => setStep((s) => (s + 1) % STEPS.length)}
              className="rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-lime-ink transition-opacity hover:opacity-90"
            >
              {step === STEPS.length - 1 ? "Start over" : "Next"}
            </button>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

const svgProps = { viewBox: "0 0 320 160", className: "h-full max-h-40 w-full max-w-md" };

/* 01: vault + maturity = market */
function MarketVisual() {
  const loop = useLoop();
  return (
    <svg {...svgProps}>
      <rect x="16" y="20" width="124" height="48" rx="12" className="fill-surface stroke-line" />
      <text x="78" y="41" textAnchor="middle" fontSize="13" className="fill-ink font-medium">Vault</text>
      <text x="78" y="58" textAnchor="middle" fontSize="11" className="fill-soft">e.g. Blend XLM pool</text>
      <text x="160" y="50" textAnchor="middle" fontSize="18" className="fill-soft">+</text>
      <rect x="180" y="20" width="124" height="48" rx="12" className="fill-surface stroke-line" />
      <text x="242" y="41" textAnchor="middle" fontSize="13" className="fill-ink font-medium">Maturity</text>
      <text x="242" y="58" textAnchor="middle" fontSize="11" className="fill-soft">a fixed date</text>
      <path d="M78 68 V88 Q78 98 88 98 H150 M242 68 V88 Q242 98 232 98 H170" fill="none" className="stroke-line-strong" />
      <path d="M160 98 V106" className="stroke-line-strong" />
      <motion.rect
        x="100"
        y="106"
        width="120"
        height="40"
        rx="12"
        className="fill-lime/10 stroke-lime"
        {...loop({ opacity: [0.55, 1, 0.55] }, 3.2)}
      />
      <text x="160" y="131" textAnchor="middle" fontSize="13" className="fill-lime font-medium">Market</text>
      <motion.circle r="3.5" cx="78" cy="68" className="fill-lime" style={{ opacity: 0 }} {...loop({ cy: [68, 98, 98], cx: [78, 78, 150], opacity: [0, 1, 0] }, 3.2, { ease: "linear" })} />
      <motion.circle r="3.5" cx="242" cy="68" className="fill-lime" style={{ opacity: 0 }} {...loop({ cy: [68, 98, 98], cx: [242, 242, 170], opacity: [0, 1, 0] }, 3.2, { ease: "linear" })} />
    </svg>
  );
}

/* 02: a PT token with a lock, bought below 1 and redeemed at 1 */
function LockVisual() {
  const loop = useLoop();
  return (
    <svg {...svgProps}>
      <rect x="96" y="14" width="128" height="72" rx="16" className="fill-surface stroke-lime/50" />
      <text x="120" y="60" fontSize="26" className="fill-lime font-extrabold">PT</text>
      {/* shackle drops, pinches shut, holds, lifts (static = locked) */}
      <motion.path
        d="M181 44 v-8 a7 7 0 0 1 14 0 v8"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-lime"
        {...loop(SHACKLE.animate, 3, SHACKLE.transition)}
      />
      <motion.rect
        x="175"
        y="40"
        width="26"
        height="22"
        rx="5"
        className="fill-lime"
        {...loop(LOCK_BODY.animate, 3, LOCK_BODY.transition)}
      />
      <line x1="40" y1="118" x2="280" y2="118" strokeWidth="6" strokeLinecap="round" className="stroke-line" />
      <motion.line
        x1="40"
        y1="118"
        x2="280"
        y2="118"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-lime"
        {...loop({ pathLength: [0, 1, 1] }, 3, { times: [0, 0.7, 1] })}
      />
      <text x="40" y="146" fontSize="11" className="fill-soft">Buy below 1</text>
      <text x="280" y="146" fontSize="11" textAnchor="end" className="fill-soft">1 PT → 1 at maturity</text>
    </svg>
  );
}

/* 03: YT value decays to zero at maturity */
function DecayVisual() {
  const loop = useLoop();
  const d = "M20 30 C 50 26, 70 50, 100 48 S 140 72, 170 76 S 220 104, 250 118 S 285 134, 296 136";
  const yt = scribble(2.5);
  return (
    <svg {...svgProps}>
      <text x="20" y="18" fontSize="11" className="fill-soft">YT value</text>
      <line x1="20" y1="136" x2="300" y2="136" className="stroke-line-strong" />
      <line x1="296" y1="20" x2="296" y2="136" strokeDasharray="3 5" className="stroke-line-strong" />
      <text x="20" y="154" fontSize="11" className="fill-soft">Today</text>
      <text x="300" y="154" fontSize="11" textAnchor="end" className="fill-soft">Maturity · 0</text>
      <path d={`${d} L296 136 L20 136 Z`} className="fill-yt/10" />
      {/* drawn in, then the tail chases it down to zero */}
      <motion.path
        d={d}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-yt"
        {...loop(yt.animate, 2.6, yt.transition)}
      />
    </svg>
  );
}

/* 04: today -> maturity, exit anytime on the way */
function TimelineVisual() {
  const loop = useLoop();
  return (
    <svg {...svgProps}>
      <line x1="30" y1="78" x2="290" y2="78" strokeWidth="3" strokeLinecap="round" className="stroke-line" />
      <line x1="160" y1="70" x2="160" y2="86" strokeWidth="2" className="stroke-line-strong" />
      <text x="160" y="56" fontSize="11" textAnchor="middle" className="fill-soft">Exit anytime at market price</text>
      <circle cx="30" cy="78" r="6" className="fill-ink" />
      <circle cx="290" cy="78" r="8" className="fill-surface stroke-lime" strokeWidth="2" />
      <motion.circle
        cx="30"
        cy="78"
        r="6"
        className="fill-lime"
        {...loop({ x: [0, 260, 260], opacity: [1, 1, 0] }, 5, { times: [0, 0.8, 1] })}
      />
      <text x="30" y="106" fontSize="11" className="fill-soft">Today</text>
      <text x="290" y="106" fontSize="11" textAnchor="end" className="fill-soft">Maturity</text>
      <rect x="110" y="122" width="82" height="24" rx="12" className="fill-lime/15" />
      <text x="151" y="138" fontSize="11" textAnchor="middle" className="fill-lime font-medium">Redeem PT</text>
      <rect x="198" y="122" width="104" height="24" rx="12" className="fill-yt/15" />
      <text x="250" y="138" fontSize="11" textAnchor="middle" className="fill-yt font-medium">Claim YT yield</text>
    </svg>
  );
}

/* 05: PT and YT hop out of V (split), then hop back in (combine).
   Static layout (reduced motion) is the split state. */
function SplitVisual() {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const label = (split: boolean) => {
      animate(".l-split", { opacity: split ? 1 : 0 }, { duration: 0.3 });
      animate(".l-combine", { opacity: split ? 0 : 1 }, { duration: 0.3 });
    };
    (async () => {
      // start stacked behind V
      animate(".pt .coin", { x: 80 }, { duration: 0 });
      animate(".yt .coin", { x: -80 }, { duration: 0 });
      await wait(600);
      while (alive) {
        label(true);
        animate(".v", { opacity: 0.35 }, { duration: 0.4, delay: 0.2 });
        await Promise.all([hop(animate, ".pt", 0, -28, 0), hop(animate, ".yt", 0, -40, 0.15)]);
        await wait(1100);
        if (!alive) break;
        label(false);
        // V is solid again by the time the coins land, so they merge behind it
        animate(".v", { opacity: 1 }, { duration: 0.3, delay: 0.4 });
        await Promise.all([hop(animate, ".pt", 80, -28, 0), hop(animate, ".yt", -80, -40, 0.15)]);
        await wait(1100);
      }
    })();
    return () => {
      alive = false;
    };
  }, [reduce, animate]);

  const bottom = { originY: 1 } as const;
  return (
    <svg {...svgProps} ref={scope}>
      <g className="pt">
        <motion.g className="squash" style={bottom}>
          <motion.g className="coin" style={bottom}>
            <circle cx="80" cy="70" r="26" className="fill-lime/15 stroke-lime" />
            <text x="80" y="76" fontSize="15" textAnchor="middle" className="fill-lime font-extrabold">PT</text>
          </motion.g>
        </motion.g>
      </g>
      <g className="yt">
        <motion.g className="squash" style={bottom}>
          <motion.g className="coin" style={bottom}>
            <circle cx="240" cy="70" r="26" className="fill-yt/15 stroke-yt" />
            <text x="240" y="76" fontSize="15" textAnchor="middle" className="fill-yt font-extrabold">YT</text>
          </motion.g>
        </motion.g>
      </g>
      <g className="v">
        <circle cx="160" cy="70" r="30" className="fill-surface stroke-line-strong" />
        <text x="160" y="76" fontSize="16" textAnchor="middle" className="fill-ink font-extrabold">V</text>
      </g>
      <text x="160" y="136" fontSize="12" textAnchor="middle" className="l-split fill-soft">
        Split: V → PT + YT
      </text>
      <text x="160" y="136" fontSize="12" textAnchor="middle" className="l-combine fill-soft" opacity="0">
        Combine: PT + YT → V
      </text>
    </svg>
  );
}
