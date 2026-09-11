import type { ReactNode } from "react";

// Short definitions, the same wording as the Tokens and Markets pages.
const TERMS = {
  v: ["Vault shares (V)", "The yield-bearing collateral a market wraps, e.g. a Blend vault share. Its value in the base asset grows as the vault earns."],
  pt: ["Principal Token (PT)", "The fixed-yield leg. 1 PT redeems for 1 of the base asset after maturity, so buying it below 1 locks in a rate."],
  yt: ["Yield Token (YT)", "The variable-yield leg: all the yield the underlying earns until maturity, then worth zero."],
  apy: ["Implied APY", "The fixed rate the pool's PT price implies. Buy PT at it and that's what you earn by holding to maturity."],
  maturity: ["Maturity", "The market's fixed end date. PT becomes redeemable at face value, YT stops earning, and the exchange rate locks."],
} as const;

// A term with a dotted underline that shows its definition on hover or keyboard focus
// (tap on touch). CSS only, so it renders the same on the server.
export function Term({ k, children }: { k: keyof typeof TERMS; children?: ReactNode }) {
  const [title, body] = TERMS[k];
  return (
    <span tabIndex={0} className="group relative cursor-help underline decoration-dotted decoration-1 underline-offset-4 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-lime/50">
      {children ?? title}
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 translate-y-1 rounded-lg border border-line bg-surface p-3 text-left text-xs font-normal leading-relaxed text-soft no-underline opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus:visible group-focus:translate-y-0 group-focus:opacity-100"
      >
        <span className="mb-1 block font-semibold text-ink">{title}</span>
        {body}
      </span>
    </span>
  );
}
