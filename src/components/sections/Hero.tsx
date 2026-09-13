"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useNetwork } from "@/lib/networkManager";
import { useMediaPolicy } from "@/lib/mediaPolicy";
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
// Horizontal swipe distance (px) required to count as a slide change on touch.
const SWIPE_THRESHOLD = 48;
// Horizontal wheel/trackpad delta before a slide change is considered.
const WHEEL_X_THRESHOLD = 40;
// We only capture wheel/touch while the hero is pinned at the very top.
const PINNED_EPSILON = 4;
// Never let a single frame advance the progress clock by more than this (guards
// against huge dt after the tab was backgrounded).
const MAX_FRAME_MS = 100;

// Bucketed viewport width, updated only when we cross the phone/desktop
// boundary that flips the hero rendition. Cheaper than a resize listener and
// avoids re-renders during a window drag. `undefined` during SSR — the picker
// then defers the mobile-downgrade decision until we know for sure.
const PHONE_BOUNDARY = "(max-width: 768px)";
function subscribeViewport(cb: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(PHONE_BOUNDARY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getViewportWidth(): number | undefined {
  if (typeof window === "undefined") return undefined;
  // We only care about the boundary, so return one of two representative
  // widths — the picker treats <=768 as "phone" and >768 as "desktop".
  return window.matchMedia(PHONE_BOUNDARY).matches ? 640 : 1440;
}
function getSSRViewportWidth(): number | undefined {
  return undefined;
}
function useViewportWidth(): number | undefined {
  return useSyncExternalStore(subscribeViewport, getViewportWidth, getSSRViewportWidth);
}

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
  const touchStartXRef = useRef(0);
  const swipeHandledRef = useRef(false);
  // True only while the active hero clip is genuinely painting frames.
  const activePlayingRef = useRef(true);
  const mouseRafRef = useRef(0);

  const net = useNetwork();
  const reducedMotion = useReducedMotion() ?? false;
  const viewportWidth = useViewportWidth();
  const quality = pickHeroQuality({ net, reducedMotion, viewportWidth });
  const policy = useMediaPolicy();

  // Whether the hero is on screen with a visible tab. Drives the rAF lifecycle
  // (state, so the effect can genuinely cancel the loop rather than idle in it).
  const [heroActive, setHeroActive] = useState(true);

  const handleActivePlaying = useCallback((playing: boolean) => {
    activePlayingRef.current = playing;
  }, []);

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
  // ring, so they can never drift apart.
  //
  // The loop is genuinely CANCELLED whenever the hero is off-screen or the tab
  // is hidden — not merely short-circuited by a `paused` flag. A rAF that keeps
  // ticking (and writing CSS variables) while nothing is visible is pure
  // main-thread and compositor waste on a phone, every frame, forever.
  useEffect(() => {
    if (!heroActive) return;

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(now - last, MAX_FRAME_MS);
      last = now;

      // The slide clock measures useful viewing time: it does not advance while
      // the user is interacting, nor while the active clip is still buffering,
      // so a slide never spends its turn showing an unpainted frame.
      const paused =
        Date.now() < suspendUntilRef.current || !activePlayingRef.current;

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
  }, [goTo, heroActive]);

  // Drives both the rAF lifecycle above and the ref the gesture handlers read.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let onScreen = true;
    const commit = () => {
      const active = onScreen && !document.hidden;
      heroVisibleRef.current = active;
      setHeroActive((prev) => (prev === active ? prev : active));
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Last entry wins: a fast scroll can deliver several crossings in one
        // callback, oldest first, and reading entries[0] would leave the hero
        // clock running after the hero has left the screen.
        onScreen = entries[entries.length - 1].isIntersecting;
        commit();
      },
      { threshold: 0.2 }
    );
    io.observe(container);

    const onVisibility = () => commit();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Carousel gestures. The hero is a HORIZONTAL carousel: sideways gestures
  // move between slides, and vertical movement is always the page's.
  //
  // Vertical wheel is no longer intercepted at all. It used to preventDefault
  // and convert scrolling into slide changes, which meant a reader trying to
  // move down the page was instead marched through five slides before the page
  // would budge — the scroll felt broken. Leaving the page's own scroll alone
  // is the whole point of this model.
  useEffect(() => {
    const isPinned = () => window.scrollY <= PINNED_EPSILON;
    const lastIndex = SLIDES.length - 1;

    // Horizontal trackpad / shift-wheel only. Vertical deltas are ignored so
    // the page scrolls natively; this listener stays passive as a result.
    const onWheel = (e: WheelEvent) => {
      if (!isPinned()) return;
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      if (Math.abs(dx) < Math.abs(e.deltaY) && !e.shiftKey) return;
      if (Math.abs(dx) < WHEEL_X_THRESHOLD) return;
      if (dx > 0 && currentRef.current < lastIndex) navigate(1);
      else if (dx < 0 && currentRef.current > 0) navigate(-1);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartYRef.current = t?.clientY ?? 0;
      touchStartXRef.current = t?.clientX ?? 0;
      swipeHandledRef.current = false;
    };

    // Touch is never trapped, and a VERTICAL swipe is now scroll and nothing
    // else. Previously a vertical flick both scrolled the page and advanced the
    // carousel, so the hero changed under the reader's thumb while they were
    // simply trying to move down the page.
    //
    // Only a clearly HORIZONTAL swipe navigates slides — the gesture users
    // already expect from a carousel — and it never cancels the scroll, so this
    // listener stays passive and the compositor is never blocked.
    const onTouchMove = (e: TouchEvent) => {
      if (swipeHandledRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = touchStartXRef.current - t.clientX;
      const dy = touchStartYRef.current - t.clientY;
      // Vertical intent always belongs to the page.
      if (Math.abs(dx) <= Math.abs(dy)) return;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      swipeHandledRef.current = true; // one flick = at most one slide
      if (dx > 0 && currentRef.current < lastIndex) navigate(1);
      else if (dx < 0 && currentRef.current > 0) navigate(-1);
    };

    // Left/Right match the carousel's axis. Up/Down/PageUp/PageDown are left to
    // the browser so keyboard users can scroll the page normally.
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPinned()) return;
      if (e.key === "ArrowRight" && currentRef.current < lastIndex) {
        e.preventDefault();
        navigate(1);
      } else if (e.key === "ArrowLeft" && currentRef.current > 0) {
        e.preventDefault();
        navigate(-1);
      }
    };

    // Every listener here is passive: none of them cancel a scroll, so the
    // compositor never has to wait on JS to decide whether the page may move.
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navigate]);

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
        <HeroVideoStack
          slides={SLIDES}
          current={current}
          quality={quality}
          allowWarmNext={policy.heroWarmNext}
          onActivePlaying={handleActivePlaying}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/20 to-navy/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/40 via-transparent to-navy/30" />
      </div>

      <div className="absolute inset-0 film-grain pointer-events-none z-[2]" />

      {/* px-10 on the smallest screens keeps the centred copy clear of the slide
          indicator rail pinned at right-5; from `sm` up there is ample room. */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-10 sm:px-6 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            // Horizontal motion, matching the carousel's axis: the next slide
            // enters from the right and the outgoing one leaves to the left.
            // Offsets are deliberately small — a long travel across a
            // full-width layer costs far more to composite than it adds.
            initial={{
              opacity: 0,
              x: direction > 0 ? 48 : -48,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: direction > 0 ? -32 : 32,
            }}
            transition={{ duration: 0.55, ease: EASE }}
            className="max-w-5xl"
          >
            {/* The copy's entrance is a CSS animation (see .hero-enter in
                globals.css), not a Framer `initial` state. Framer's initial
                serialises as `opacity:0` into the server HTML, so on a phone
                the headline — the page's LCP element — stayed invisible until
                the JS bundle had downloaded and hydrated (LCP ~6.5 s under
                simulated 4G). CSS keyframes start at first paint, keep the same
                staggered fade-up, and the wrapper above still slides between
                slides with Framer. */}
            <div className="hero-enter hero-enter--bar w-12 h-[2px] bg-sand mx-auto mb-6 origin-left" />

            <span className="hero-enter hero-enter--1 text-sand/90 text-xs sm:text-sm tracking-[0.3em] uppercase font-light block mb-4">
              {t.hero.eyebrow}
            </span>

            <h1 className="hero-enter hero-enter--2 font-display text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight">
              {t.hero.slides[current].title}
            </h1>
            <p className="hero-enter hero-enter--3 mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
              {t.hero.slides[current].subtitle}
            </p>
            <div className="hero-enter hero-enter--4 mt-9 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/about" className="btn btn-primary btn-lg btn-glow">
                <span>{t.hero.discover}</span>
                <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/products" className="btn btn-ghost btn-lg">
                {t.hero.products}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        ref={indicatorRef}
        // gap-0.5 + the buttons' py-1 keeps the bars 10px apart, as before.
        className="absolute right-5 sm:right-8 lg:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-20"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            // The visible bar is 3px wide; the button itself provides the
            // 24x24 minimum target (WCAG 2.5.8) instead of an invisible
            // overlay div, so the accessible box matches the clickable box.
            className="relative group flex w-6 justify-center py-1"
            aria-label={`Slayd ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
          >
            {/* `relative` so the track/fill layers below size to this 3px bar,
                not to the (wider) button around it. */}
            <div
              className="relative w-[3px] rounded-full overflow-hidden transition-all duration-700 ease-out"
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
