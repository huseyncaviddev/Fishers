"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { ParallaxBackdrop } from "@/components/ui/ParallaxBackdrop";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
  delay: number;
}

const COUNT_DURATION_MS = 1600;

/**
 * A statistic that renders its REAL value in the HTML and treats the count-up
 * purely as an enhancement.
 *
 * Two things were wrong with the previous version. It initialised state to 0,
 * so the server-rendered markup (and therefore crawlers, and anyone whose JS
 * fails) advertised "0T+" and "0%" as the company's figures. And it drove the
 * animation with a 60-step setInterval per stat — around 240 React renders
 * across the row, on the main thread, on a phone.
 *
 * Now the number is correct in the markup from the start, and the animation
 * writes to the DOM node directly from a single rAF loop: no state, no
 * re-renders, and it never runs at all under reduced motion.
 */
function AnimatedNumber({ value, suffix, label, inView, delay }: StatItemProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const el = numRef.current;
    if (!el || !inView || reduceMotion) return;

    let raf = 0;
    let start = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / COUNT_DURATION_MS);
      // easeOutCubic — fast first, settling gently on the real figure.
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = String(value);
    };

    timer = setTimeout(() => {
      el.textContent = "0";
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      if (timer) clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      el.textContent = String(value);
    };
  }, [inView, value, delay, reduceMotion]);

  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight">
        <span ref={numRef}>{value}</span>
        <span className="text-sand">{suffix}</span>
      </div>
      <div className="mt-3 text-white/50 text-xs sm:text-sm tracking-[0.15em] uppercase font-light">
        {label}
      </div>
    </div>
  );
}

const STATS = [
  { value: 15, suffix: "+" },
  { value: 50, suffix: "T+" },
  { value: 20, suffix: "+" },
  { value: 98, suffix: "%" },
];

export function Stats() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section id="stats" className="relative py-28 lg:py-36 overflow-hidden" ref={containerRef}>
      <ParallaxBackdrop src="/images/6.jpg" target={containerRef} />
      <div className="absolute inset-0 bg-navy/85" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="w-16 h-[1px] bg-sand mx-auto mb-6 origin-center"
          />
          <span className="text-sand/70 font-medium text-xs tracking-[0.3em] uppercase">
            {t.stats.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
            {t.stats.titleLead} <span className="text-gradient-gold">{t.stats.titleAccent}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-16">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 * i }}
            >
              <AnimatedNumber
                value={s.value}
                suffix={s.suffix}
                label={t.stats.items[i].label}
                inView={inView}
                delay={250 * i}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
