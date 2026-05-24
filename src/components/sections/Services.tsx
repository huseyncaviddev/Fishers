"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PremiumServiceCard } from "@/components/ui/PremiumServiceCard";
import { TextReveal } from "@/components/ui/TextReveal";

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M20.5 8c-1.5-2-4-3-7-3S5 6 3.5 8c0 0 2 4 8.5 4s8.5-4 8.5-4Z" />
        <path d="M12 12v7" />
        <path d="M8 16c1.3 1.3 2.7 2 4 2s2.7-.7 4-2" />
      </svg>
    ),
    title: "Balıq Yetişdirmə",
    desc: "Müasir hovuzlarda və açıq su sistemlərində yüksək keyfiyyətli balıq növlərinin yetişdirilməsi.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Su Keyfiyyəti İdarəetmə",
    desc: "Avtomatlaşdırılmış su monitorinq sistemləri ilə optimal pH, oksigen və temperatur nəzarəti.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: "Ekoloji Davamlılıq",
    desc: "Ətraf mühitə minimum təsir göstərən qapalı dövriyyə sistemləri və enerji səmərəliliyi.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    title: "Ağıllı Texnologiya",
    desc: "IoT sensorlar, süni intellekt ilə yem idarəetməsi və avtomatik sortlaşdırma sistemləri.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Emal və Paketləmə",
    desc: "Beynəlxalq standartlara uyğun emal müəssisələri və müasir paketləmə həlləri.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Konsaltinq Xidmətləri",
    desc: "Akvakultura layihələrinin planlaşdırılması və texniki-iqtisadi əsaslandırma.",
  },
];

export function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 lg:py-36 bg-mist relative overflow-hidden section-fade" ref={ref}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ocean/[0.03] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sand/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="w-12 h-[2px] bg-ocean mx-auto mb-6 origin-center"
          />
          <span className="text-ocean font-medium text-xs tracking-[0.2em] uppercase">
            Xidmətlər
          </span>
          <TextReveal
            as="h2"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy"
            delay={0.2}
          >
            Həllərimizə İnvestisiya Edin
          </TextReveal>
          <p className="mt-5 text-slate/60 text-lg leading-relaxed font-light">
            Akvakultura sənayesinin bütün sahələrini əhatə edən kompleks xidmətlər
          </p>
        </motion.div>

        <div className="mt-14 lg:mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 * i }}
            >
              <PremiumServiceCard icon={s.icon} title={s.title} desc={s.desc} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
