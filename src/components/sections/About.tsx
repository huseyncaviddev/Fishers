"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: "Davamlılıq",
    desc: "Ekoloji tarazlığı qoruyaraq gələcək nəsillər üçün məsuliyyətli istehsal.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Keyfiyyət",
    desc: "Beynəlxalq standartlara uyğun ən yüksək keyfiyyətli dəniz məhsulları.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "İnnovasiya",
    desc: "Ən müasir texnologiyalar ilə səmərəli və ağıllı balıqçılıq təsərrüfatı.",
  },
];

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 lg:py-32 bg-white" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">
              Haqqımızda
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
              Davamlı Akvakulturanın{" "}
              <span className="text-ocean">Gələcəyini</span> Qururuq
            </h2>
            <p className="mt-6 text-slate/80 text-lg leading-relaxed">
              Biz innovativ yanaşmalar və davamlı təcrübələrlə akvakultura
              sənayesini dəyişdiririk. Müasir texnologiyalardan istifadə edərək
              ekoloji tarazlığı qorumaqla yanaşı, ən yüksək keyfiyyətli dəniz
              məhsulları istehsal edirik.
            </p>
            <p className="mt-4 text-slate/80 text-lg leading-relaxed">
              Missiyamız sağlam, davamlı və əlçatan akvakultura sistemləri
              yaratmaq, yerli icmaları dəstəkləmək və qlobal ərzaq
              təhlükəsizliyinə töhfə verməkdir.
            </p>
            <div className="mt-8 flex gap-8">
              <div>
                <div className="font-display text-3xl font-bold text-ocean">15+</div>
                <div className="text-sm text-slate/60 mt-1">İllik Təcrübə</div>
              </div>
              <div className="w-px bg-ocean-muted" />
              <div>
                <div className="font-display text-3xl font-bold text-ocean">50+</div>
                <div className="text-sm text-slate/60 mt-1">Mütəxəssis</div>
              </div>
              <div className="w-px bg-ocean-muted" />
              <div>
                <div className="font-display text-3xl font-bold text-ocean">200+</div>
                <div className="text-sm text-slate/60 mt-1">Tərəfdaş</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-ocean-light relative">
              <video
                src="/videos/farm-1.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ocean/20 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-ocean text-white p-6 rounded-xl shadow-xl max-w-[200px]">
              <div className="font-display text-2xl font-bold">100%</div>
              <div className="text-sm text-white/80 mt-1">
                Ekoloji Davamlı İstehsal
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-24 grid sm:grid-cols-3 gap-8"
        >
          {VALUES.map((v, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-mist hover:bg-ocean transition-all duration-500 cursor-default"
            >
              <div className="text-ocean group-hover:text-white transition-colors duration-500">
                {v.icon}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-navy group-hover:text-white transition-colors duration-500">
                {v.title}
              </h3>
              <p className="mt-3 text-slate/70 group-hover:text-white/80 leading-relaxed transition-colors duration-500">
                {v.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
