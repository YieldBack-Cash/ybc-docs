import { useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Props for a slow infinite loop, or nothing under reduced motion (the element shows its static state). */
export function useLoop() {
  const reduce = useReducedMotion();
  return (animate: TargetAndTransition, duration: number, opts: Transition = {}) =>
    reduce ? {} : { animate, transition: { duration, repeat: Infinity, ease: "easeInOut", ...opts } as Transition };
}
