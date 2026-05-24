"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const MEDIA = [
  { type: "video" as const, src: "/videos/farm-1.mp4", title: "Su Təsərrüfatı" },
  { type: "video" as const, src: "/videos/farm-2.mp4", title: "Yem Prosesi" },
  { type: "video" as const, src: "/videos/farm-3.mp4", title: "Hovuz Sistemi" },
  { type: "video" as const, src: "/videos/farm-4.mp4", title: "Emal Müəssisəsi" },
  { type: "video" as const, src: "/videos/farm-5.mp4", title: "Təsərrüfat Həyatı" },
];

export function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-white" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-ocean font-medium text-sm tracking-widest uppercase">
            Qalereya
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            Təsərrüfatımızdan <span className="text-ocean">Görüntülər</span>
          </h2>
          <p className="mt-6 text-slate/70 text-lg">
            İstehsal proseslərimiz və müasir infrastrukturumuzla yaxından tanış olun.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {MEDIA.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.08 * i }}
              className={`relative group cursor-pointer overflow-hidden rounded-xl ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => setSelected(i)}
            >
              <div className={`${i === 0 ? "aspect-square" : "aspect-video"} overflow-hidden`}>
                <video
                  src={item.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">{item.title}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={MEDIA[selected].src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            </motion.div>
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Bağla"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
