"use client";

import { useMediaPolicy } from "./mediaPolicy";

/**
 * Whether this device should run continuous, scroll-linked transforms.
 *
 * Scroll-linked parallax means recomputing and recompositing a transform on
 * every scroll frame. On a desktop that is free; on a phone — especially when
 * the transformed layer is a full-screen video or a large image — it is one of
 * the main causes of scroll jank.
 *
 * Sections keep their entrance animations (opacity + a short translate, which
 * run once and then stop). Only the *continuous* effects are dropped, so the
 * design still feels alive without paying per-frame for it.
 */
export function useContinuousMotion(): boolean {
  const policy = useMediaPolicy();
  return !policy.coarsePointer && !policy.reducedMotion;
}
