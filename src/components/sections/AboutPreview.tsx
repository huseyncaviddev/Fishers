"use client";

import Link from "next/link";
import { SmartVideo } from "@/components/ui/SmartVideo";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useContinuousMotion } from "@/lib/useAdaptiveMotion";

export function AboutPreview() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const continuous = useContinuousMotion();
  const imgYRaw = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const imgY = continuous ? imgYRaw : undefined;

  return (
    <section id="about" className="py-24 lg:py-36 bg-white overflow-hidden" ref={containerRef}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="w-10 h-[2px] bg-ocean mb-6 origin-left"
            />
            <span className="text-ocean font-medium text-xs tracking-[0.2em] uppercase">
              {t.aboutPreview.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-[1.1]">
              {t.aboutPreview.titleLead}{" "}
              <span className="text-gradient-ocean">{t.aboutPreview.titleAccent}</span> {t.aboutPreview.titleTail}
            </h2>
            <p className="mt-6 text-slate/70 text-lg leading-relaxed font-light">
              {t.aboutPreview.body}
            </p>

            <div className="mt-10 flex gap-8 sm:gap-10">
              {t.aboutPreview.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`${i > 0 ? "border-l border-ocean-muted/50 pl-8 sm:pl-10" : ""}`}
                >
                  <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ocean">
                    {stat.num}
                  </div>
                  <div className="text-xs sm:text-sm text-slate/50 mt-1 font-light">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                href="/about"
                className="mt-10 inline-flex items-center gap-3 text-ocean font-medium group"
              >
                <span className="relative">
                  {t.aboutPreview.cta}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-ocean group-hover:w-full transition-all duration-500" />
                </span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <motion.div style={{ y: imgY }} className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative img-hover-zoom border-glow depth-lg">
                <SmartVideo
                  src="/videos/about-preview.mp4"
                  poster="/videos/posters/about-preview.jpg"
                />
                <div className="absolute inset-0 z-[3] bg-gradient-to-tr from-ocean/15 via-transparent to-transparent" />
                <div className="absolute inset-0 z-[3] pointer-events-none about-showcase-sheen" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="about-showcase-badge about-showcase-badge--metric"
              >
                <div className="about-showcase-metric-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="about-showcase-metric-body">
                  <span className="about-showcase-metric-value">{t.aboutPreview.badgeValue}</span>
                  <span className="about-showcase-metric-label">{t.aboutPreview.badgeLabel}</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
