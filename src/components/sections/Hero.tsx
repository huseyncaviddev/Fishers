"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useNetwork } from "@/lib/networkManager";
import { pickHeroQuality } from "@/lib/videoQuality";
import { HeroVideoStack, type HeroSlideMedia } from "@/components/sections/HeroVideoStack";
import { useI18n } from "@/i18n/I18nProvider";

const SLIDES: ReadonlyArray<HeroSlideMedia> = [
  { video: "/videos/hero-1.mp4", poster: "/images/posters/hero-1.jpg" },
  { video: "/videos/hero-2.mp4", poster: "/images/posters/hero-2.jpg" },
  { video: "/videos/hero-3.mp4", poster: "/images/posters/hero-3.jpg" },
  { video: "/videos/hero-4.mp4", poster: "/images/posters/hero-4.jpg" },
  { video: "/videos/hero-5.mp4", poster: "/images/posters/hero-5.jpg" },
];

const EASE = [0.25, 0.1, 0.25, 1] as const;

// How long each slide stays on screen before autoplay dissolves to the next.
const AUTO_ADVANCE_MS = 5500;
// After any manual navigation, autoplay stays paused for this long so the two
// modes never fight each other; it then resumes seamlessly.
const SUSPEND_AFTER_INPUT_MS = 4000;
// Minimum gap between two gesture-driven slide changes — one flick = one slide.
const GESTURE_COOLDOWN_MS = 850;
// Vertical swipe distance (px) required to count as a slide change on touch.
const SWIPE_THRESHOLD = 48;
// We only capture wheel/touch while the hero is pinned at the very top.
const PINNED_EPSILON = 4;
// Never let a single frame advance the progress clock by more than this (guards
// against huge dt after the tab was backgrounded).
const MAX_FRAME_MS = 100;

export function Hero() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Refs mirror state so the rAF loop and native listeners read fresh values
  // without re-subscribing on every slide change.
  const currentRef = useRef(0);
  const elapsedRef = useRef(0);
  const suspendUntilRef = useRef(0);
  const lockRef = useRef(0);
  const heroVisibleRef = useRef(true);
  const touchStartYRef = useRef(0);
  const mouseRafRef = useRef(0);
  const handoffRef = useRef(false);

  const net = useNetwork();
  const reducedMotion = useReducedMotion() ?? false;
  const quality = pickHeroQuality({ net, reducedMotion });

  // Single source of truth for changing the active slide. Both autoplay and
  // every manual gesture funnel through here, so the crossfade, the counter and
  // the progress ring always stay in lockstep.
  const goTo = useCallback((index: number, dir: number) => {
    const next = (index + SLIDES.length) % SLIDES.length;
    setDirection(dir);
    currentRef.current = next;
    elapsedRef.current = 0;
    setCurrent(next);
  }, []);

  const suspendAutoplay = useCallback(() => {
    suspendUntilRef.current = Date.now() + SUSPEND_AFTER_INPUT_MS;
  }, []);

  // Hand off from the last slide into the section below (the "HAQQIMIZDA"
  // About preview, id="about"): one smooth glide instead of a partial nudge.
  // We animate the scroll ourselves with rAF rather than scrollIntoView({smooth})
  // because the browser cancels a programmatic smooth-scroll the moment more
  // wheel/touch momentum arrives — which, combined with our preventDefault,
  // would leave the page stuck on the last slide.
  const releaseToContent = useCallback(() => {
    // Ignore the leftover momentum from the flick that just landed on the last
    // slide, so the final video is actually seen before we glide away.
    if (handoffRef.current || Date.now() < lockRef.current) return;
    handoffRef.current = true;

    const target = document.getElementById("about");
    const startY = window.scrollY;
    const destY = target
      ? startY + target.getBoundingClientRect().top
      : startY + window.innerHeight;
    const distance = destY - startY;
    const duration = 750;
    const start = performance.now();
    const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + distance * easeOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        handoffRef.current = false;
      }
    };
    requestAnimationFrame(step);
  }, []);

  // Rate-limited manual step used by wheel / touch / keyboard.
  const navigate = useCallback(
    (dir: number) => {
      const now = Date.now();
      if (now < lockRef.current) return;
      lockRef.current = now + GESTURE_COOLDOWN_MS;
      suspendAutoplay();
      goTo(currentRef.current + dir, dir);
    },
    [goTo, suspendAutoplay]
  );

  // Unified clock: one rAF loop drives BOTH the auto-advance and the progress
  // ring, so they can never drift apart. It freezes while the user is
  // interacting or the hero is off-screen, then resumes without a jump.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(now - last, MAX_FRAME_MS);
      last = now;

      const paused =
        !heroVisibleRef.current || Date.now() < suspendUntilRef.current;

      if (!paused) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= AUTO_ADVANCE_MS) {
          goTo(currentRef.current + 1, 1); // resets elapsed to 0
        }
      }

      indicatorRef.current?.style.setProperty(
        "--slide-fill",
        String(Math.min(1, elapsedRef.current / AUTO_ADVANCE_MS))
      );

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [goTo]);

  // Pause autoplay when the hero scrolls out of view or the tab is hidden.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        heroVisibleRef.current = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0.35 }
    );
    io.observe(container);

    const onVisibility = () => {
      heroVisibleRef.current =
        !document.hidden &&
        (containerRef.current?.getBoundingClientRect().bottom ?? 0) > 0;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Scroll / swipe / keyboard capture. While the hero is pinned at the top we
  // translate a downward gesture into "next slide" and an upward one into
  // "previous". On the last slide a further downward gesture is left alone, so
  // the page scrolls naturally into the content below; scrolling back to the top
  // re-engages slide mode.
  useEffect(() => {
    const isPinned = () => window.scrollY <= PINNED_EPSILON;
    const lastIndex = SLIDES.length - 1;

    const onWheel = (e: WheelEvent) => {
      if (handoffRef.current) {
        e.preventDefault(); // don't let native momentum fight our rAF glide
        return;
      }
      if (!isPinned() || Math.abs(e.deltaY) < 2) return;
      if (e.deltaY > 0) {
        e.preventDefault();
        if (currentRef.current < lastIndex) {
          navigate(1);
        } else {
          releaseToContent(); // last slide -> glide into the About section
        }
      } else {
        if (currentRef.current > 0) {
          e.preventDefault();
          navigate(-1);
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (handoffRef.current) {
        e.preventDefault();
        return;
      }
      if (!isPinned()) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = touchStartYRef.current - y; // +ve = swipe up = next
      const dir = delta > 0 ? 1 : -1;
      const atLast = currentRef.current >= lastIndex;
      const canTrap =
        (dir > 0 && !atLast) || (dir < 0 && currentRef.current > 0);
      const canRelease = dir > 0 && atLast; // swipe up on last slide -> content
      if (!canTrap && !canRelease) return;

      e.preventDefault();
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        touchStartYRef.current = y;
        if (canRelease) releaseToContent();
        else navigate(dir);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (handoffRef.current || !isPinned()) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown";
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      if (down && currentRef.current < lastIndex) {
        e.preventDefault();
        navigate(1);
      } else if (down && currentRef.current >= lastIndex) {
        e.preventDefault();
        releaseToContent();
      } else if (up && currentRef.current > 0) {
        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navigate, releaseToContent]);

  // Subtle mouse parallax on the video stack.
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

  // Indicator dots: jump straight to a slide (no page scroll needed anymore).
  const goToSlide = useCallback(
    (index: number) => {
      suspendAutoplay();
      goTo(index, index > currentRef.current ? 1 : -1);
    },
    [goTo, suspendAutoplay]
  );

  return (
    <div
      ref={containerRef}
      data-hero-container
      className="relative h-[100dvh] min-h-[600px] w-full overflow-hidden"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transform:
            "translate3d(var(--px, 0px), var(--py, 0px), 0) scale(1.05)",
        }}
      >
        <HeroVideoStack slides={SLIDES} current={current} quality={quality} />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/20 to-navy/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/40 via-transparent to-navy/30" />
      </div>

      <div className="absolute inset-0 film-grain pointer-events-none z-[2]" />

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
            onClick={() => goToSlide(i)}
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
  );
}
