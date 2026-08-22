"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useNetwork, isLowBandwidth } from "@/lib/networkManager";
import { useI18n } from "@/i18n/I18nProvider";

const SLIDES = [
  { video: "/videos/hero-1.mp4", poster: "/images/posters/hero-1.jpg", image: "/images/8.jpg" },
  { video: "/videos/hero-2.mp4", poster: "/images/posters/hero-2.jpg", image: "/images/6.jpg" },
  { video: "/videos/hero-3.mp4", poster: "/images/posters/hero-3.jpg", image: "/images/4.jpg" },
  { video: "/videos/hero-4.mp4", poster: "/images/posters/hero-4.jpg", image: "/images/5.jpg" },
  { video: "/videos/hero-5.mp4", poster: "/images/posters/hero-5.jpg", image: "/images/1.jpg" },
];

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function Hero() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const prevSlideRef = useRef(0);
  const rafRef = useRef(0);
  const mouseRafRef = useRef(0);
  const net = useNetwork();
  const disableVideo = isLowBandwidth(net);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScroll = container.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      const slideIndex = Math.min(
        SLIDES.length - 1,
        Math.floor(progress * SLIDES.length)
      );

      if (indicatorRef.current) {
        const withinSlide =
          progress * SLIDES.length - Math.floor(progress * SLIDES.length);
        indicatorRef.current.style.setProperty(
          "--slide-fill",
          String(Math.min(1, withinSlide))
        );
      }

      if (slideIndex !== prevSlideRef.current) {
        setDirection(slideIndex > prevSlideRef.current ? 1 : -1);
        prevSlideRef.current = slideIndex;
        setCurrent(slideIndex);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    let px = 0;
    let py = 0;
    const onMove = (e: MouseEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 20;
      py = (e.clientY / window.innerHeight - 0.5) * 10;
      if (mouseRafRef.current) return;
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = 0;
        el.style.setProperty("--px", `${px}px`);
        el.style.setProperty("--py", `${py}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
    };
  }, []);

  // Stable video element: swap src on slide change, do not remount.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (disableVideo) {
      if (video.hasAttribute("src")) {
        video.pause();
        video.removeAttribute("src");
        try {
          video.load();
        } catch {
          // ignore
        }
      }
      return;
    }
    const nextSrc = SLIDES[current].video;
    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      try {
        video.load();
      } catch {
        // ignore
      }
    }
    video.play().catch(() => {});
  }, [current, disableVideo]);

  const scrollToSlide = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const totalScroll = container.offsetHeight - window.innerHeight;
    const target = (index / SLIDES.length) * totalScroll;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      data-hero-container
      style={{ height: `${SLIDES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-[100dvh] min-h-[600px] w-full overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute inset-0 will-change-transform"
          style={{
            transform:
              "translate3d(var(--px, 0px), var(--py, 0px), 0) scale(1.05)",
          }}
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={SLIDES[current].poster}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/20 to-navy/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/40 via-transparent to-navy/30" />
        </div>

        <div className="absolute inset-0 film-grain pointer-events-none z-[2]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`corner-${current}`}
            initial={{ opacity: 0, scale: 0.8, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            className="absolute bottom-20 left-6 sm:bottom-24 sm:left-10 lg:left-16 w-[120px] h-[80px] sm:w-[180px] sm:h-[120px] lg:w-[240px] lg:h-[160px] rounded-lg overflow-hidden z-10 hidden sm:block"
          >
            <div className="glass absolute inset-0 z-10" />
            <Image
              src={SLIDES[current].image}
              alt=""
              fill
              className="object-cover"
              sizes="240px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent z-20" />
            <div className="absolute bottom-2 left-3 z-30">
              <span className="text-[9px] sm:text-[10px] text-white/70 tracking-widest uppercase font-light">
                {t.hero.slides[current].accent}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{
                opacity: 0,
                y: direction > 0 ? 60 : -60,
              }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: direction > 0 ? -40 : 40,
              }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-5xl"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
                className="w-12 h-[2px] bg-sand mx-auto mb-6 origin-left"
              />

              <motion.span
                className="text-sand/90 text-xs sm:text-sm tracking-[0.3em] uppercase font-light block mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
              >
                {t.hero.eyebrow}
              </motion.span>

              <motion.h1
                className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
              >
                {t.hero.slides[current].title}
              </motion.h1>
              <motion.p
                className="mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
              >
                {t.hero.slides[current].subtitle}
              </motion.p>
              <motion.div
                className="mt-9 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
              >
                <Link href="/about" className="btn btn-primary btn-lg btn-glow">
                  <span>{t.hero.discover}</span>
                  <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/products" className="btn btn-ghost btn-lg">
                  {t.hero.products}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          ref={indicatorRef}
          className="absolute right-5 sm:right-8 lg:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 z-20"
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className="relative group"
              aria-label={`Slayd ${i + 1}`}
            >
              <div
                className="w-[3px] rounded-full overflow-hidden transition-all duration-700 ease-out"
                style={{ height: i === current ? 40 : 16 }}
              >
                <div
                  className={`absolute inset-0 rounded-full transition-colors duration-500 ${
                    i === current ? "bg-white/40" : "bg-white/20"
                  }`}
                />
                {i === current && (
                  <div
                    className="absolute top-0 left-0 right-0 rounded-full bg-white transition-[height] duration-100 ease-linear"
                    style={{
                      height: `calc(var(--slide-fill, 0) * 100%)`,
                    }}
                  />
                )}
              </div>
              <div className="absolute -left-2 -right-2 -top-1 -bottom-1" />
            </button>
          ))}
        </div>

        <div className="absolute bottom-6 sm:bottom-8 right-5 sm:right-8 lg:right-10 font-light text-xs tracking-widest z-20">
          <span className="text-white font-medium text-sm">
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="text-white/20 mx-1.5">/</span>
          <span className="text-white/30">
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/40 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-light">
              {t.hero.scroll}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                className="w-1 h-1.5 rounded-full bg-white/60"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
