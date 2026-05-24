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

interface PremiumServiceCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  href?: string;
}

export function PremiumServiceCard({ icon, title, desc, href = "/contact" }: PremiumServiceCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const springTilt = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), springTilt);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-5, 5]), springTilt);

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
      <div
        className={`relative rounded-2xl p-7 sm:p-8 h-full bg-white transition-all duration-700 ease-out ${
          hovered
            ? "border border-ocean/10 shadow-[0_20px_60px_-15px_rgba(14,140,155,0.15),0_8px_24px_-8px_rgba(12,35,64,0.08)] scale-[1.02]"
            : "border border-slate/[0.06] shadow-[0_4px_8px_rgba(12,35,64,0.04),0_8px_24px_rgba(12,35,64,0.06)]"
        }`}
      >
        <motion.div
          className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ background: lightBg }}
        />

        <div className="relative z-10">
          <div
            className={`w-12 h-12 rounded-xl bg-ocean/8 text-ocean flex items-center justify-center transition-all duration-700 ease-out ${
              hovered
                ? "shadow-[0_0_20px_rgba(14,140,155,0.15),0_0_40px_rgba(14,140,155,0.06)] scale-110"
                : ""
            }`}
          >
            {icon}
          </div>

          <h3 className="mt-5 font-display text-lg sm:text-xl font-semibold text-navy">
            {title}
          </h3>
          <p className="mt-3 text-slate/60 text-sm leading-relaxed">{desc}</p>

          <Link
            href={href}
            className="mt-5 inline-flex items-center gap-2 text-ocean font-medium text-sm hover:text-ocean-dark transition-colors cursor-pointer"
          >
            <span>Ətraflı</span>
            <motion.svg
              animate={{ x: hovered ? 6 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </motion.svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
