"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

function LazyVideo({ src, poster, className }: { src: string; poster?: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(containerRef, { margin: "100px" });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (isVisible) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [isVisible, src]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

const GALLERY_ITEMS = [
  { src: "/images/4.jpg", title: "RAS Sistemi", type: "image" as const },
  { src: "/videos/farm-2.mp4", title: "Yem Prosesi", type: "video" as const },
  { src: "/images/3.jpg", title: "Tilapia Yetişdirmə", type: "image" as const },
  { src: "/images/9.jpg", title: "Su Hovuzları", type: "image" as const },
  { src: "/images/14.jpg", title: "Keyfiyyət Nəzarəti", type: "image" as const },
  { src: "/images/16.jpg", title: "Komandamız", type: "image" as const },
];

export function GalleryPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="gallery" className="py-24 lg:py-36 bg-mist overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 lg:mb-16"
        >
          <div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="w-10 h-[2px] bg-ocean mb-6 origin-left"
            />
            <span className="text-ocean font-medium text-xs tracking-[0.2em] uppercase">
              Qalereya
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-tight">
              Təsərrüfatımızdan{" "}
              <span className="text-gradient-ocean">Görüntülər</span>
            </h2>
          </div>
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 text-ocean font-medium shrink-0"
          >
            <span className="relative">
              Hamısına Bax
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

        {/* Asymmetric gallery grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.06 * i }}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl img-hover-zoom border-glow ${
                i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              <div
                className={`relative ${
                  i === 0
                    ? "aspect-[4/3] lg:aspect-auto lg:h-full"
                    : "aspect-[4/3]"
                }`}
              >
                {item.type === "video" ? (
                  <LazyVideo src={item.src} poster={`/images/posters/${item.src.split("/").pop()?.replace(".mp4", "")}.jpg`} className="w-full h-full" />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Title card on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-out">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0">
                    {item.type === "video" ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white font-medium text-sm">
                    {item.title}
                  </span>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-6 h-6">
                  <div className="absolute top-0 right-0 w-3 h-[1px] bg-white/50" />
                  <div className="absolute top-0 right-0 h-3 w-[1px] bg-white/50" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
