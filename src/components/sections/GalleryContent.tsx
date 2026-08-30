"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { SmartVideo, videoPosterJpg } from "@/components/ui/SmartVideo";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { useI18n } from "@/i18n/I18nProvider";

type GalleryCategoryKey = "all" | "farm" | "processing" | "tech" | "moments";
const CATEGORIES: GalleryCategoryKey[] = [
  "all",
  "farm",
  "processing",
  "tech",
  "moments",
];

interface MediaItem {
  src: string;
  categoryKey: Exclude<GalleryCategoryKey, "all">;
  type: "video" | "image";
  /** Natural dimensions, used to reserve masonry space (no layout shift). */
  w?: number;
  h?: number;
  /** Index into the translated `media` list for curated items. */
  titleIdx?: number;
}

const CURATED: MediaItem[] = [
  { src: "/images/1.jpg", categoryKey: "farm", type: "image", titleIdx: 0 },
  { src: "/videos/gallery-harvest.mp4", categoryKey: "farm", type: "video", titleIdx: 1 },
  { src: "/images/4.jpg", categoryKey: "tech", type: "image", titleIdx: 2 },
  { src: "/images/8.jpg", categoryKey: "farm", type: "image", titleIdx: 3 },
  { src: "/videos/gallery-ai.mp4", categoryKey: "tech", type: "video", titleIdx: 4 },
  { src: "/images/3.jpg", categoryKey: "farm", type: "image", titleIdx: 5 },
  { src: "/images/6.jpg", categoryKey: "farm", type: "image", titleIdx: 6 },
  { src: "/videos/gallery-tank.mp4", categoryKey: "farm", type: "video", titleIdx: 7 },
  { src: "/images/14.jpg", categoryKey: "processing", type: "image", titleIdx: 8 },
  { src: "/videos/gallery-factory.mp4", categoryKey: "processing", type: "video", titleIdx: 9 },
  { src: "/images/5.jpg", categoryKey: "farm", type: "image", titleIdx: 10 },
  { src: "/images/10.jpg", categoryKey: "processing", type: "image", titleIdx: 11 },
  { src: "/images/16.jpg", categoryKey: "farm", type: "image", titleIdx: 12 },
  { src: "/images/12.jpg", categoryKey: "tech", type: "image", titleIdx: 13 },
  { src: "/images/9.jpg", categoryKey: "tech", type: "image", titleIdx: 14 },
];

// Authentic operational photography — preserved at natural aspect ratio.
const MOMENT_DIMS: ReadonlyArray<[number, number]> = [
  [1050, 1400], [1400, 630], [646, 1400], [1050, 1400], [1050, 1400],
  [788, 1400], [1050, 1400], [1050, 1400], [1400, 630], [1050, 1400],
  [1050, 1400], [646, 1400], [1050, 1400], [786, 1400], [1050, 1400],
  [1050, 1400], [1050, 1400], [1050, 1400], [1400, 1050], [1050, 1400],
  [1050, 1400], [1050, 1400], [1400, 1050], [1050, 1400], [1050, 1400],
  [788, 1400], [1050, 1400], [646, 1400], [788, 1400], [1400, 932],
  [1050, 1400], [1400, 1050],
];

const MOMENTS: MediaItem[] = MOMENT_DIMS.map(([w, h], i) => ({
  src: `/images/gallery/moment-${String(i + 1).padStart(2, "0")}.jpg`,
  categoryKey: "moments" as const,
  type: "image" as const,
  w,
  h,
}));

const MEDIA: MediaItem[] = [...CURATED, ...MOMENTS];

/** Natural aspect ratio (w/h) — videos are a fixed 16:9, images use their
 *  intrinsic dimensions so the balanced masonry never crops the subject. */
function aspectOf(item: MediaItem): number {
  if (item.type === "video") return 16 / 9;
  return (item.w ?? 1200) / (item.h ?? 900);
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
  const [activeCategory, setActiveCategory] = useState<GalleryCategoryKey>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const columnCount = useColumnCount();

  // Guard the index lookup: if a locale's `media` list is ever shorter than the
  // curated titleIdx range, fall back to the moments caption instead of crashing
  // the whole gallery route with `Cannot read properties of undefined`.
  const titleOf = (item: MediaItem) =>
    (item.titleIdx != null ? gc.media[item.titleIdx]?.title : undefined) ??
    gc.momentsCaption;
  const descOf = (item: MediaItem) =>
    (item.titleIdx != null ? gc.media[item.titleIdx]?.desc : undefined) ?? "";

  const filtered =
    activeCategory === "all"
      ? MEDIA
      : MEDIA.filter((m) => m.categoryKey === activeCategory);

  // Greedy shortest-column packing keeps the columns visually balanced (no one
  // column running much taller) while preserving each photo's natural ratio.
  const columns = useMemo(() => {
    const cols: MediaItem[][] = Array.from({ length: columnCount }, () => []);
    const heights = new Array(columnCount).fill(0);
    for (const item of filtered) {
      let k = 0;
      for (let j = 1; j < columnCount; j++) if (heights[j] < heights[k]) k = j;
      cols[k].push(item);
      heights[k] += 1 / aspectOf(item);
    }
    return cols;
  }, [filtered, columnCount]);

  // Stable stagger order (index within the filtered set) for the reveal.
  const orderOf = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((it, i) => m.set(it.src, i));
    return m;
  }, [filtered]);

  const renderTile = (item: MediaItem) => {
    const globalIndex = MEDIA.indexOf(item);
    const order = orderOf.get(item.src) ?? 0;
    return (
      <motion.div
        key={item.src}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: Math.min(0.03 * order, 0.4) }}
        className="group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-mist border-glow"
        onClick={() => setSelected(globalIndex)}
      >
        <div className="relative overflow-hidden img-hover-zoom">
          {item.type === "video" ? (
            <div className="relative aspect-video">
              <SmartVideo src={item.src} poster={videoPosterJpg(item.src)} />
            </div>
          ) : (
            <Image
              src={item.src}
              alt={titleOf(item)}
              width={item.w ?? 1200}
              height={item.h ?? 900}
              className="w-full h-auto block"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1400px) 25vw, 350px"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-11 h-11 rounded-full glass flex items-center justify-center">
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

          {item.categoryKey !== "moments" && (
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <span className="text-white/60 text-[10px] font-medium tracking-[0.15em] uppercase">
                {gc.categories[item.categoryKey]}
              </span>
              <h3 className="mt-0.5 font-display text-sm sm:text-base font-semibold text-white leading-snug">
                {titleOf(item)}
              </h3>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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

        <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
          {columns.map((col, ci) => (
            <div
              key={ci}
              className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 lg:gap-5"
            >
              {col.map(renderTile)}
            </div>
          ))}
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
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-navy max-h-[80vh] flex items-center justify-center">
                {MEDIA[selected].type === "video" ? (
                  <ResilientVideo
                    src={MEDIA[selected].src}
                    poster={videoPosterJpg(MEDIA[selected].src)}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <Image
                    key={MEDIA[selected].src}
                    src={MEDIA[selected].src}
                    alt={titleOf(MEDIA[selected])}
                    width={MEDIA[selected].w ?? 1200}
                    height={MEDIA[selected].h ?? 900}
                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
                    sizes="100vw"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-semibold text-white">
                  {titleOf(MEDIA[selected])}
                </h3>
                {descOf(MEDIA[selected]) && (
                  <p className="text-white/50 mt-1 font-light">
                    {descOf(MEDIA[selected])}
                  </p>
                )}
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
                setSelected((selected - 1 + MEDIA.length) % MEDIA.length);
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
