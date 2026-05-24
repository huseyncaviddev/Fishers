"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
  delay: number;
}

function AnimatedNumber({ value, suffix, label, inView, delay }: StatItemProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplay(value);
          clearInterval(interval);
        } else {
          setDisplay(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [inView, value, delay]);

  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight">
        {display}
        <span className="text-sand">{suffix}</span>
      </div>
      <div className="mt-3 text-white/50 text-xs sm:text-sm tracking-[0.15em] uppercase font-light">
        {label}
      </div>
    </div>
  );
}

const STATS = [
  { value: 15, suffix: "+", label: "İllik Təcrübə" },
  { value: 500, suffix: "T", label: "İllik İstehsal (ton)" },
  { value: 50, suffix: "+", label: "Mütəxəssis" },
  { value: 98, suffix: "%", label: "Müştəri Məmnuniyyəti" },
];

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="stats" className="relative py-28 lg:py-36 overflow-hidden" ref={containerRef}>
      {/* Parallax background image */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
        <Image
          src="/images/6.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-navy/85" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      {/* Decorative lines */}
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
            Nailiyyətlərimiz
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
            Rəqəmlərlə <span className="text-gradient-gold">Biz</span>
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
                label={s.label}
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
