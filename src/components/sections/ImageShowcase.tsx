"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const SHOWCASE_IMAGES = [
  { src: "/images/8.jpg", alt: "Aerial aquaculture operations", span: "col-span-2 row-span-2" },
  { src: "/images/6.jpg", alt: "Open water fish pens", span: "" },
  { src: "/images/10.jpg", alt: "Fish close-up", span: "" },
  { src: "/images/12.jpg", alt: "Indoor RAS facility", span: "col-span-2" },
  { src: "/images/14.jpg", alt: "Salmon handling", span: "" },
  { src: "/images/5.jpg", alt: "Land-based circular tanks", span: "" },
];

export function ImageShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [20, -60]);

  return (
    <section ref={containerRef} className="py-24 lg:py-36 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12" ref={ref}>
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
            className="w-12 h-[2px] bg-ocean mx-auto mb-6 origin-left"
          />
          <span className="text-ocean font-medium text-xs tracking-[0.2em] uppercase">
            Təsərrüfatımız
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-6xl font-light text-navy leading-tight">
            Mükəmməlliyin{" "}
            <span className="text-ocean font-semibold italic">arxasında</span>
          </h2>
          <p className="mt-5 text-slate/60 text-lg max-w-2xl mx-auto font-light">
            Müasir texnologiya ilə təbiətin harmoniyasını yaradırıq
          </p>
        </motion.div>

        {/* Masonry-style grid with parallax */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 auto-rows-[180px] sm:auto-rows-[220px] lg:auto-rows-[260px]">
          {SHOWCASE_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.08 * i }}
              style={{ y: i % 2 === 0 ? y1 : y2 }}
              className={`relative group overflow-hidden rounded-xl ${img.span} img-hover-zoom border-glow`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <div className="glass-dark rounded-lg px-3 py-2">
                  <span className="text-white/90 text-xs sm:text-sm font-light">
                    {img.alt}
                  </span>
                </div>
              </div>
              {/* Corner accent */}
              <div className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-3 h-[1px] bg-white/60" />
                <div className="absolute top-0 right-0 h-3 w-[1px] bg-white/60" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
