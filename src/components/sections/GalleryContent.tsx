"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { useOverlay } from "@/lib/useOverlay";
import {
  GALLERY_IMAGES,
  type GalleryImage,
  type GalleryCategory,
} from "@/data/galleryImages";

type FilterKey = "all" | GalleryCategory;
const CATEGORIES: FilterKey[] = ["all", "farm", "processing", "tech", "moments"];

/** Natural aspect ratio (w/h) — each photo keeps its intrinsic dimensions so
 *  the balanced masonry never crops the subject. */
function aspectOf(item: GalleryImage): number {
  return item.w / item.h;
}

/** Content-driven column count via matchMedia (no per-frame resize work):
 *  2 columns on phones, 3 on tablets, 4 on laptops+. */
function useColumnCount(): number {
  const [count, setCount] = useState(2);
  useEffect(() => {
    const mq3 = window.matchMedia("(min-width: 640px)");
    const mq4 = window.matchMedia("(min-width: 1024px)");
    const update = () => setCount(mq4.matches ? 4 : mq3.matches ? 3 : 2);
    update();
    mq3.addEventListener("change", update);
    mq4.addEventListener("change", update);
    return () => {
      mq3.removeEventListener("change", update);
      mq4.removeEventListener("change", update);
    };
  }, []);
  return count;
}

export function GalleryContent() {
  const { t } = useI18n();
  const gc = t.galleryContent;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [activeCategory, setActiveCategory] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const columnCount = useColumnCount();
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeLightbox = useCallback(() => setSelected(null), []);

  // `selected` indexes into `filtered`, so switching filters would point it at
  // the wrong photo — close the lightbox whenever the filter changes.
  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? GALLERY_IMAGES
        : GALLERY_IMAGES.filter((m) => m.category === activeCategory),
    [activeCategory],
  );
  const total = filtered.length;

  // The lightbox is modal: Escape closes it, Tab stays inside, and focus goes
  // back to the tile that opened it. Arrow keys page through the photos.
  useOverlay(selected !== null, closeLightbox, lightboxRef);
  const onLightboxKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSelected((s) => (s === null ? s : (s - 1 + total) % total));
    else if (e.key === "ArrowRight") setSelected((s) => (s === null ? s : (s + 1) % total));
  };

  // Greedy shortest-column packing keeps the columns visually balanced (no one
  // column running much taller) while preserving each photo's natural ratio.
  const columns = useMemo(() => {
    const cols: { item: GalleryImage; index: number }[][] = Array.from(
      { length: columnCount },
      () => [],
    );
    const heights = new Array(columnCount).fill(0);
    filtered.forEach((item, index) => {
      let k = 0;
      for (let j = 1; j < columnCount; j++) if (heights[j] < heights[k]) k = j;
      cols[k].push({ item, index });
      heights[k] += 1 / aspectOf(item);
    });
    return cols;
  }, [filtered, columnCount]);

  // Each tile is a real button: the previous clickable <div> could not be
  // reached or activated from the keyboard, so the lightbox was mouse-only.
  const renderTile = (item: GalleryImage, index: number) => (
    <motion.button
      key={item.src}
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(0.03 * index, 0.4) }}
      className="group block w-full text-left cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-mist border-glow"
      onClick={() => setSelected(index)}
      aria-label={`${gc.categories[item.category]} — ${gc.momentsCaption} ${index + 1}`}
    >
      <div className="relative overflow-hidden img-hover-zoom">
        <Image
          src={item.src}
          alt={gc.momentsCaption}
          width={item.w}
          height={item.h}
          className="w-full h-auto block"
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1400px) 25vw, 350px"
          priority={index < 4}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-11 h-11 rounded-full glass flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span className="text-white/70 text-[10px] font-medium tracking-[0.15em] uppercase">
            {gc.categories[item.category]}
          </span>
        </div>
      </div>
    </motion.button>
  );

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
              onClick={() => {
                setActiveCategory(cat);
                setSelected(null);
              }}
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

        <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
          {columns.map((col, ci) => (
            <div
              key={ci}
              className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 lg:gap-5"
            >
              {col.map(({ item, index }) => renderTile(item, index))}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && filtered[selected] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelected(null)}
            onKeyDown={onLightboxKey}
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${gc.categories[filtered[selected].category]} — ${selected + 1} / ${total}`}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-navy max-h-[82vh] flex items-center justify-center">
                <Image
                  key={filtered[selected].src}
                  src={filtered[selected].src}
                  alt={gc.momentsCaption}
                  width={filtered[selected].w}
                  height={filtered[selected].h}
                  className="w-auto h-auto max-w-full max-h-[82vh] object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-3 text-white/50 text-sm font-light">
                <span className="text-ocean-light tracking-[0.15em] uppercase text-xs">
                  {gc.categories[filtered[selected].category]}
                </span>
                <span className="h-px w-8 bg-white/20" />
                <span suppressHydrationWarning>
                  {selected + 1} / {total}
                </span>
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
                setSelected((selected - 1 + total) % total);
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
                setSelected((selected + 1) % total);
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
