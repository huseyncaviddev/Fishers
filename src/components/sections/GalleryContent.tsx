"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { LazyVideo, videoPoster } from "@/components/ui/LazyVideo";
import { useI18n } from "@/i18n/I18nProvider";

type GalleryCategoryKey = "all" | "farm" | "processing" | "tech";
const CATEGORIES: GalleryCategoryKey[] = ["all", "farm", "processing", "tech"];

interface MediaItem {
  src: string;
  categoryKey: Exclude<GalleryCategoryKey, "all">;
  type: "video" | "image";
}

const MEDIA: MediaItem[] = [
  { src: "/images/1.jpg", categoryKey: "farm", type: "image" },
  { src: "/videos/gallery-harvest.mp4", categoryKey: "farm", type: "video" },
  { src: "/images/4.jpg", categoryKey: "tech", type: "image" },
  { src: "/images/8.jpg", categoryKey: "farm", type: "image" },
  { src: "/videos/gallery-ai.mp4", categoryKey: "tech", type: "video" },
  { src: "/images/3.jpg", categoryKey: "farm", type: "image" },
  { src: "/images/6.jpg", categoryKey: "farm", type: "image" },
  { src: "/videos/gallery-tank.mp4", categoryKey: "farm", type: "video" },
  { src: "/images/14.jpg", categoryKey: "processing", type: "image" },
  { src: "/videos/gallery-factory.mp4", categoryKey: "processing", type: "video" },
  { src: "/images/5.jpg", categoryKey: "farm", type: "image" },
  { src: "/images/10.jpg", categoryKey: "processing", type: "image" },
  { src: "/videos/gallery-largescale.mp4", categoryKey: "tech", type: "video" },
  { src: "/videos/gallery-chile.mp4", categoryKey: "farm", type: "video" },
  { src: "/images/16.jpg", categoryKey: "farm", type: "image" },
  { src: "/images/12.jpg", categoryKey: "tech", type: "image" },
  { src: "/images/9.jpg", categoryKey: "tech", type: "image" },
];

export function GalleryContent() {
  const { t } = useI18n();
  const gc = t.galleryContent;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryKey>("all");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered =
    activeCategory === "all"
      ? MEDIA
      : MEDIA.filter((m) => m.categoryKey === activeCategory);

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
              {gc.categories[cat]}
            </button>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <AnimatePresence initial={false}>
            {filtered.map((item, i) => {
              const globalIndex = MEDIA.indexOf(item);
              const media = gc.media[globalIndex];
              return (
                <motion.div
                  key={item.src}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(0.03 * i, 0.24) }}
                  className="group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-mist border-glow"
                  onClick={() => setSelected(globalIndex)}
                >
                  <div className="aspect-video overflow-hidden relative img-hover-zoom">
                    {item.type === "video" ? (
                      <LazyVideo src={item.src} poster={videoPoster(item.src)} className="w-full h-full" />
                    ) : (
                      <Image
                        src={item.src}
                        alt={media.title}
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
                        {item.type === "video" ? gc.video : gc.photo}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="text-ocean text-[10px] font-medium tracking-[0.15em] uppercase">
                      {gc.categories[item.categoryKey]}
                    </span>
                    <h3 className="mt-1 font-display text-base sm:text-lg font-semibold text-navy">
                      {media.title}
                    </h3>
                    <p className="mt-1 text-slate/50 text-sm font-light">
                      {media.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
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
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-navy">
                {MEDIA[selected].type === "video" ? (
                  <video
                    key={MEDIA[selected].src}
                    src={MEDIA[selected].src}
                    poster={videoPoster(MEDIA[selected].src)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={MEDIA[selected].src}
                    alt={gc.media[selected].title}
                    fill
                    className="object-cover !relative"
                    sizes="100vw"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-semibold text-white">
                  {gc.media[selected].title}
                </h3>
                <p className="text-white/50 mt-1 font-light">
                  {gc.media[selected].desc}
                </p>
              </div>
            </motion.div>

            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label={t.nav.close}
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
              aria-label={gc.prev}
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
              aria-label={gc.next}
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
