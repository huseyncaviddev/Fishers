"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type { RefObject } from "react";
import { useContinuousMotion } from "@/lib/useAdaptiveMotion";

interface ParallaxBackdropProps {
  src: string;
  /** The section whose scroll progress drives the drift. */
  target: RefObject<HTMLElement | null>;
  /** Vertical travel, as a CSS percentage of the layer height. */
  travel?: number;
  className?: string;
}

/**
 * A full-bleed background image with a subtle scroll-linked drift.
 *
 * The parallax machinery lives in its own component so the mobile path can skip
 * it by simply not rendering it. Previously the section computed `useScroll` /
 * `useTransform` unconditionally and then chose not to apply the result on
 * touch — which still subscribed to scroll and recalculated a transform on
 * every frame, paying the whole cost for an effect nobody could see.
 *
 * Hooks stay unconditional *within* this component, so there is no
 * conditional-hook hazard; the decision is made by the parent at the render
 * boundary.
 */
function DriftingBackdrop({ src, target, travel = 10, className }: ParallaxBackdropProps) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${travel}%`, `${travel}%`]);

  return (
    <motion.div
      style={{ y }}
      className={className ?? "absolute inset-0 -top-[10%] -bottom-[10%]"}
    >
      <Image src={src} alt="" fill className="object-cover" sizes="100vw" priority={false} />
    </motion.div>
  );
}

/** Static equivalent — identical framing, zero per-frame work. */
function StaticBackdrop({ src, className }: Pick<ParallaxBackdropProps, "src" | "className">) {
  return (
    <div className={className ?? "absolute inset-0"}>
      <Image src={src} alt="" fill className="object-cover" sizes="100vw" priority={false} />
    </div>
  );
}

export function ParallaxBackdrop(props: ParallaxBackdropProps) {
  const continuous = useContinuousMotion();
  return continuous ? (
    <DriftingBackdrop {...props} />
  ) : (
    <StaticBackdrop src={props.src} className={props.className ? undefined : "absolute inset-0"} />
  );
}

interface ScrollDriftProps {
  target: RefObject<HTMLElement | null>;
  className?: string;
  children: React.ReactNode;
  /** Vertical travel in px across the section's scroll range. */
  travel?: number;
  /** Scale at the start of the range, easing to 1. */
  fromScale?: number;
}

function DriftingGroup({ target, className, children, travel = 20, fromScale = 1.05 }: ScrollDriftProps) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [fromScale, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  return (
    <motion.div style={{ scale, y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Wraps a group of elements in a subtle scroll-linked drift on capable
 * pointers, and renders them plainly everywhere else — again by not mounting
 * the scroll subscription at all rather than computing it and discarding the
 * result.
 */
export function ScrollDrift(props: ScrollDriftProps) {
  const continuous = useContinuousMotion();
  if (!continuous) return <div className={props.className}>{props.children}</div>;
  return <DriftingGroup {...props} />;
}
