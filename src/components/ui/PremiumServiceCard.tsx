"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useMediaPolicy } from "@/lib/mediaPolicy";

interface PremiumServiceCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  href?: string;
}

const ARROW = (
  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
);

/**
 * Premium service card.
 *
 * Desktop gets the full treatment: a subtle pointer-tracked tilt and a
 * directional light that follows the cursor. Touch devices get the identical
 * visual design with none of the machinery — no springs, no mouse tracking, no
 * per-frame motion values — because on a phone that work animates nothing a
 * finger can ever produce.
 */
export function PremiumServiceCard(props: PremiumServiceCardProps) {
  const policy = useMediaPolicy();
  return policy.hoverIntent ? (
    <PointerCard {...props} />
  ) : (
    <StaticCard {...props} />
  );
}

/** Touch/reduced-motion variant: pure CSS, zero runtime animation cost. */
function StaticCard({ icon, title, desc, href = "/contact" }: PremiumServiceCardProps) {
  const { t } = useI18n();
  return (
    <div className="relative h-full">
      <div className="pc-card pc-card--static relative rounded-2xl p-7 sm:p-8 h-full bg-white">
        <div className="relative z-10">
          <div className="pc-icon w-12 h-12 rounded-xl bg-ocean/8 text-ocean flex items-center justify-center">
            {icon}
          </div>
          <h3 className="mt-5 font-display text-lg sm:text-xl font-semibold text-navy">
            {title}
          </h3>
          <p className="mt-3 text-slate/60 text-sm leading-relaxed">{desc}</p>
          <Link
            href={href}
            className="pc-link mt-5 inline-flex items-center gap-2 text-ocean font-medium text-sm"
          >
            <span>{t.common.details}</span>
            <svg
              className="pc-arrow w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {ARROW}
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Desktop variant: pointer-tracked tilt + directional light. */
function PointerCard({ icon, title, desc, href = "/contact" }: PremiumServiceCardProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const springTilt = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), springTilt);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), springTilt);

  const lx = useSpring(useTransform(mx, [0, 1], [0, 100]), { stiffness: 200, damping: 30 });
  const ly = useSpring(useTransform(my, [0, 1], [0, 100]), { stiffness: 200, damping: 30 });
  const lightBg = useMotionTemplate`radial-gradient(600px circle at ${lx}% ${ly}%, rgba(14,140,155,0.15) 0%, rgba(14,140,155,0.07) 25%, transparent 60%)`;

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [mx, my]
  );

  const onLeave = useCallback(() => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  }, [mx, my]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className="relative h-full"
    >
      <div className={`pc-card relative rounded-2xl p-7 sm:p-8 h-full bg-white ${hovered ? "is-hovered" : ""}`}>
        <motion.div
          className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ background: lightBg }}
        />

        <div className="relative z-10">
          <div className={`pc-icon w-12 h-12 rounded-xl bg-ocean/8 text-ocean flex items-center justify-center ${hovered ? "is-hovered" : ""}`}>
            {icon}
          </div>

          <h3 className="mt-5 font-display text-lg sm:text-xl font-semibold text-navy">
            {title}
          </h3>
          <p className="mt-3 text-slate/60 text-sm leading-relaxed">{desc}</p>

          <Link
            href={href}
            className="pc-link mt-5 inline-flex items-center gap-2 text-ocean font-medium text-sm"
          >
            <span>{t.common.details}</span>
            <svg
              className={`pc-arrow w-3.5 h-3.5 ${hovered ? "is-hovered" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {ARROW}
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
