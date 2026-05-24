"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function AboutPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

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
              Haqqımızda
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-[1.1]">
              Davamlı Akvakulturanın{" "}
              <span className="text-gradient-ocean">Gələcəyini</span> Qururuq
            </h2>
            <p className="mt-6 text-slate/70 text-lg leading-relaxed font-light">
              Biz innovativ yanaşmalar və davamlı təcrübələrlə akvakultura
              sənayesini dəyişdiririk. Müasir texnologiyalardan istifadə edərək
              ekoloji tarazlığı qorumaqla yanaşı, ən yüksək keyfiyyətli dəniz
              məhsulları istehsal edirik.
            </p>

            {/* Stats row with dividers */}
            <div className="mt-10 flex gap-8 sm:gap-10">
              {[
                { num: "15+", label: "İllik Təcrübə" },
                { num: "50+", label: "Mütəxəssis" },
                { num: "200+", label: "Tərəfdaş" },
              ].map((stat, i) => (
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
                  Ətraflı Oxuyun
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

          {/* Image composition */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <motion.div
              style={{ y: imgY }}
              className="relative"
            >
              {/* Main image */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative img-hover-zoom">
                <Image
                  src="/images/1.jpg"
                  alt="Fishers aquaculture facility VIP tour"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-ocean/10 to-transparent" />
              </div>

              {/* Floating secondary image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="absolute -bottom-8 -left-4 sm:-bottom-10 sm:-left-8 w-[140px] h-[100px] sm:w-[200px] sm:h-[140px] rounded-xl overflow-hidden shadow-2xl ring-4 ring-white"
              >
                <Image
                  src="/images/4.jpg"
                  alt="Indoor RAS facility"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </motion.div>

              {/* Glass stat card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 glass-ocean rounded-xl p-4 sm:p-5 shadow-xl"
              >
                <div className="font-display text-xl sm:text-2xl font-bold text-ocean">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-ocean-dark/70 mt-1 font-light">
                  Ekoloji Davamlı İstehsal
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
