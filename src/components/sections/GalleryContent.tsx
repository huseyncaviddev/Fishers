"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { LazyVideo, videoPoster } from "@/components/ui/LazyVideo";

const CATEGORIES = ["Hamısı", "Təsərrüfat", "Emal", "Texnologiya"] as const;

interface MediaItem {
  src: string;
  title: string;
  category: string;
  desc: string;
  type: "video" | "image";
}

const MEDIA: MediaItem[] = [
  { src: "/images/1.jpg", title: "VIP Ziyarət", category: "Təsərrüfat", desc: "Nərə yetişdirmə təsərrüfatına rəsmi ziyarət", type: "image" },
  { src: "/videos/gallery-harvest.mp4", title: "Balıq Yığımı", category: "Təsərrüfat", desc: "Torla balıq yığımı prosesi", type: "video" },
  { src: "/images/4.jpg", title: "RAS Sistemi", category: "Texnologiya", desc: "Müasir qapalı dövriyyə sistemi", type: "image" },
  { src: "/images/8.jpg", title: "Dəniz Ferması", category: "Təsərrüfat", desc: "Açıq dənizdə akvakultura əməliyyatları", type: "image" },
  { src: "/videos/gallery-ai.mp4", title: "AI Monitorinq", category: "Texnologiya", desc: "Süni intellekt ilə balıq sağlamlıq nəzarəti", type: "video" },
  { src: "/images/3.jpg", title: "Tilapia Yetişdirmə", category: "Təsərrüfat", desc: "Yüksək sıxlıqlı tilapia hovuzları", type: "image" },
  { src: "/images/6.jpg", title: "Açıq Su Qəfəsləri", category: "Təsərrüfat", desc: "Dəniz suyunda balıq yetişdirmə qəfəsləri", type: "image" },
  { src: "/videos/gallery-tank.mp4", title: "Su Tankları", category: "Təsərrüfat", desc: "Müasir su tankı sistemləri", type: "video" },
  { src: "/images/14.jpg", title: "Keyfiyyət Nəzarəti", category: "Emal", desc: "Peşəkar keyfiyyət yoxlama prosesi", type: "image" },
  { src: "/videos/gallery-factory.mp4", title: "Emal Fabriki", category: "Emal", desc: "Beynəlxalq standartlarda emal müəssisəsi", type: "video" },
  { src: "/images/5.jpg", title: "Torpaq Hovuzları", category: "Təsərrüfat", desc: "Geniş miqyaslı torpaq əsaslı hovuzlar", type: "image" },
  { src: "/images/10.jpg", title: "Balıq Növləri", category: "Emal", desc: "Premium keyfiyyətli yetişdirilən balıqlar", type: "image" },
  { src: "/videos/gallery-largescale.mp4", title: "3000 Ton Tutumu", category: "Texnologiya", desc: "Böyük həcmli akvakultura tankları", type: "video" },
  { src: "/videos/gallery-chile.mp4", title: "Beynəlxalq Təsərrüfat", category: "Təsərrüfat", desc: "Çilidəki balıq təsərrüfatı əməliyyatları", type: "video" },
  { src: "/images/16.jpg", title: "Komandamız", category: "Təsərrüfat", desc: "Peşəkar komanda üzvlərimiz", type: "image" },
  { src: "/images/12.jpg", title: "İnnovasiya Mərkəzi", category: "Texnologiya", desc: "Müasir RAS təsərrüfatı", type: "image" },
  { src: "/images/9.jpg", title: "Havalandırma Sistemləri", category: "Texnologiya", desc: "Su aerasiya prosesləri", type: "image" },
];

export function GalleryContent() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [activeCategory, setActiveCategory] = useState<string>("Hamısı");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered =
    activeCategory === "Hamısı"
      ? MEDIA
      : MEDIA.filter((m) => m.category === activeCategory);

  return (
    <section className="py-16 lg:py-24 bg-white" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-12 lg:mb-16"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-500 ${
                activeCategory === cat
                  ? "bg-ocean text-white shadow-md shadow-ocean/20"
                  : "bg-mist text-slate/60 hover:bg-ocean-light hover:text-ocean"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const globalIndex = MEDIA.indexOf(item);
              return (
                <motion.div
                  key={item.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: 0.04 * i }}
                  className="group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-mist border-glow"
                  onClick={() => setSelected(globalIndex)}
                >
                  <div className="aspect-video overflow-hidden relative img-hover-zoom">
                    {item.type === "video" ? (
                      <LazyVideo src={item.src} poster={videoPoster(item.src)} className="w-full h-full" />
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
                        {item.type === "video" ? (
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="glass rounded-full px-2.5 py-1 text-[10px] text-white/80 tracking-wider uppercase font-light">
                        {item.type === "video" ? "Video" : "Foto"}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="text-ocean text-[10px] font-medium tracking-[0.15em] uppercase">
                      {item.category}
                    </span>
                    <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-slate/50 text-sm font-light">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                {MEDIA[selected].type === "video" ? (
                  <video
                    src={MEDIA[selected].src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={MEDIA[selected].src}
                    alt={MEDIA[selected].title}
                    fill
                    className="object-cover !relative"
                    sizes="100vw"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-semibold text-white">
                  {MEDIA[selected].title}
                </h3>
                <p className="text-white/50 mt-1 font-light">
                  {MEDIA[selected].desc}
                </p>
              </div>
            </motion.div>

            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Bağla"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelected(
                  (selected - 1 + MEDIA.length) % MEDIA.length
                );
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Əvvəlki"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelected((selected + 1) % MEDIA.length);
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Növbəti"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
