"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/TextReveal";
import { useI18n } from "@/i18n/I18nProvider";

export function CTA() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={containerRef}>
      <div className="bg-white section-fade" ref={ref}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="w-10 h-[2px] bg-sand mb-6 origin-left"
              />
              <TextReveal
                as="h2"
                className="font-display text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-navy leading-[1.1]"
                delay={0.1}
              >
                {t.cta.title}
              </TextReveal>
              <p className="mt-6 text-slate/60 text-lg leading-relaxed font-light">
                {t.cta.body}
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/contact" className="btn btn-primary btn-glow">
                  <span>{t.cta.partner}</span>
                  <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  {t.cta.businessPlan}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              <motion.div style={{ scale: imgScale, y: imgY }} className="aspect-[3/4] rounded-xl overflow-hidden border-glow">
                <Image
                  src="/images/16.jpg"
                  alt="United Fishers team member"
                  fill
                  className="object-cover !relative"
                  sizes="200px"
                />
              </motion.div>
              <div className="space-y-3 sm:space-y-4 pt-8">
                <div className="aspect-square rounded-xl overflow-hidden img-hover-zoom border-glow">
                  <Image
                    src="/images/12.jpg"
                    alt="RAS facility"
                    fill
                    className="object-cover !relative"
                    sizes="200px"
                  />
                </div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden img-hover-zoom border-glow">
                  <Image
                    src="/images/5.jpg"
                    alt="Outdoor tanks"
                    fill
                    className="object-cover !relative"
                    sizes="200px"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/8.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-ocean/90" />
        </div>
        <div className="absolute inset-0 film-grain pointer-events-none" />

        <div className="absolute inset-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 400"
            className="absolute bottom-0 w-full text-ocean-dark/20"
            preserveAspectRatio="none"
          >
            <path
              d="M0,250 C400,150 800,350 1200,200 C1350,150 1400,180 1440,170 L1440,400 L0,400 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-20 lg:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-xl lg:ml-auto"
          >
            <div className="glass rounded-2xl p-8 lg:p-10">
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-white">
                {t.cta.newsletterTitle}
              </h3>
              <p className="mt-3 text-white/60 text-sm font-light">
                {t.cta.newsletterBody}
              </p>
              <div className="mt-6 flex gap-3">
                <input
                  type="email"
                  placeholder={t.cta.newsletterPlaceholder}
                  className="flex-1 bg-white/10 text-white text-sm rounded-full px-5 py-3 placeholder:text-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                />
                <button className="btn btn-sand btn-sm shrink-0">
                  {t.cta.newsletterButton}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
