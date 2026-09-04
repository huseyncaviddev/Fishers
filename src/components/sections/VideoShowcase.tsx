"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { useI18n } from "@/i18n/I18nProvider";
import { useContinuousMotion } from "@/lib/useAdaptiveMotion";

export function VideoShowcase() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const continuous = useContinuousMotion();
  // Parallax + scale on a full-screen video layer is the single most expensive
  // scroll-linked effect on the page. Desktop keeps it; touch devices get the
  // same composition rendered statically, which is what makes mobile scrolling
  // feel smooth here.
  const yRaw = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const y = continuous ? yRaw : undefined;
  const scale = continuous ? scaleRaw : undefined;

  return (
    <section ref={ref} className="relative py-0 overflow-hidden">
      <motion.div style={{ scale }} className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute inset-0 bg-navy" />
          <LazyVideo
            src="/videos/ras-system-new.mp4"
            poster="/images/posters/ras-system.jpg"
            className="absolute inset-0 w-full h-[120%]"
            priority={2}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/30 to-navy/70" />
        <div className="absolute inset-0 film-grain pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center px-6 max-w-4xl"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-16 h-[1px] bg-sand mx-auto mb-8 origin-center"
            />
            <span className="text-sand/80 text-xs tracking-[0.3em] uppercase font-light">
              {t.videoShowcase.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
              {t.videoShowcase.titleLead}{" "}
              <span className="text-gradient-gold">{t.videoShowcase.titleAccent}</span>
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              {t.videoShowcase.body}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex justify-center gap-8 sm:gap-16"
            >
              {t.videoShowcase.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-xl sm:text-3xl font-bold text-sand">
                    {stat.num}
                  </div>
                  <div className="text-white/50 text-[10px] sm:text-xs mt-1 tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            viewBox="0 0 1440 60"
            className="w-full text-white block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
