"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CATEGORIES = [
  {
    title: "Nərə Balığı",
    image: "/videos/farm-1.mp4",
    desc: "Premium keyfiyyətli nərə balığı və kürü istehsalı",
  },
  {
    title: "Alabalıq",
    image: "/videos/farm-2.mp4",
    desc: "Təmiz dağ sularında yetişdirilən alabalıq",
  },
  {
    title: "Akvakultura Texnologiyası",
    image: "/videos/farm-3.mp4",
    desc: "Müasir IoT və avtomatlaşdırma həlləri",
  },
  {
    title: "Yem İstehsalı",
    image: "/videos/farm-4.mp4",
    desc: "Yüksək qidalılıq dəyərli təbii yemlər",
  },
];

export function Products() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="products" className="py-24 lg:py-32 bg-white" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-navy">
            Həllərimizə{" "}
            <span className="text-ocean font-semibold italic">investisiya</span>{" "}
            edin
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="group relative aspect-[4/3] sm:aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
            >
              <video
                src={cat.image}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-xl font-semibold text-white">
                  {cat.title}
                </h3>
                <p className="text-white/70 text-sm mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  {cat.desc}
                </p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement — Aqua-Spark style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 text-center max-w-4xl mx-auto"
        >
          <p className="text-lg sm:text-xl lg:text-3xl font-display text-navy/80 leading-relaxed font-light px-2">
            <span className="font-semibold text-navy">Missiyamız</span>{" "}
            akvakultura sənayesini{" "}
            <span className="text-ocean font-semibold italic">
              sağlam, davamlı, əlçatan
            </span>{" "}
            istehsala doğru irəlilətmək və qlobal ərzaq təhlükəsizliyinə töhfə
            verməkdir.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
