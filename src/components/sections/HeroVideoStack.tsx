"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroQuality } from "@/lib/videoQuality";
import { heroVideoSrc } from "@/lib/videoQuality";

export interface HeroSlideMedia {
  video: string;
  poster: string;
}

interface HeroVideoStackProps {
  slides: ReadonlyArray<HeroSlideMedia>;
  current: number;
  /** Delivery tier chosen from the connection + reduced-motion preference. */
  quality: HeroQuality;
}

type Role = "active" | "warm" | "idle";

// Bounded stall/error recovery — never an infinite retry storm.
const MAX_RETRIES = 3;
const BACKOFF_MS = [800, 1600, 3200] as const;
// If a video keeps buffering this long without a frame, treat it as a soft
// failure and drop to the lightweight variant (or the poster).
const STALL_TIMEOUT_MS = 6000;

/**
 * Priority-based hero video manager.
 *
 * - ACTIVE slide: source assigned immediately at the chosen quality, played,
 *   and kept alive with bounded retry → quality-downgrade → poster fallback.
 * - NEXT slide: warmed only once the active clip can play AND only on a healthy
 *   connection, so neighbours never compete with the visible video for bytes.
 * - EVERY OTHER slide: fully unloaded (poster only), releasing network + memory.
 *
 * The poster attribute stays as the visual until the video genuinely renders a
 * frame, so the hero is never a black rectangle. Visual markup is unchanged.
 */
export function HeroVideoStack({ slides, current, quality }: HeroVideoStackProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const retriesRef = useRef<number[]>(slides.map(() => 0));
  const downgradedRef = useRef<boolean[]>(slides.map(() => false));
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Gates warming of the next slide on the *current* active clip being ready.
  // Keyed by slide+quality so a slide/quality change auto-invalidates the gate
  // without a separate reset effect (which would setState inside an effect).
  const activeKey = `${current}:${quality}`;
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const activeReady = readyKey === activeKey;

  const clearTimer = (i: number) => {
    const t = timersRef.current.get(i);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(i);
    }
  };

  // Effective source for a slide, honouring any runtime downgrade of that clip.
  const resolveSrc = (i: number): string | null => {
    if (quality === "none") return null;
    const wantHigh = quality === "high" && !downgradedRef.current[i];
    return heroVideoSrc(slides[i].video, wantHigh ? "high" : "low");
  };

  const unload = (video: HTMLVideoElement) => {
    if (!video.hasAttribute("src")) return;
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch {
      // ignore
    }
  };

  const assign = (video: HTMLVideoElement, src: string) => {
    if (video.getAttribute("src") === src) return;
    video.setAttribute("src", src);
    try {
      video.load();
    } catch {
      // ignore
    }
  };

  const safePlay = (video: HTMLVideoElement) => {
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  // A slide is reset for reuse when it leaves the active window.
  const resetRecovery = (i: number) => {
    retriesRef.current[i] = 0;
    downgradedRef.current[i] = false;
    clearTimer(i);
  };

  // --- Placement: decide each slide's role and apply it. ---------------------
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      // On a capable connection, once the visible clip is actually playing we
      // warm EVERY other slide (load + decode its first frame while hidden), so
      // switching to any slide reveals video immediately instead of the poster.
      // The active clip always loads first (activeReady gate), so warming the
      // neighbours never steals bandwidth from the slide the user is watching.
      // Weak / Save-Data / reduced-motion tiers keep the poster-first fallback.
      let role: Role = "idle";
      if (quality !== "none" && i === current) role = "active";
      else if (quality === "high" && activeReady && i !== current) role = "warm";

      if (role === "idle") {
        if (i !== current) resetRecovery(i);
        unload(video);
        return;
      }

      const src = resolveSrc(i);
      if (!src) {
        unload(video);
        return;
      }

      assign(video, src);

      if (role === "active") {
        video.preload = "auto";
        if (video.currentTime > 0) {
          try {
            video.currentTime = 0;
          } catch {
            // ignore
          }
        }
        safePlay(video);
      } else {
        // warm: buffer quietly, never play.
        video.preload = "auto";
        try {
          video.pause();
        } catch {
          // ignore
        }
      }
    });
    // resolveSrc/unload/... are stable closures over refs; only these inputs
    // change what work is performed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, quality, activeReady, slides]);

  // --- Recovery: bounded retry → downgrade → poster, for the ACTIVE clip. -----
  useEffect(() => {
    if (quality === "none") return;
    const i = current;
    const video = videoRefs.current[i];
    if (!video) return;

    const markReady = () => {
      clearTimer(i);
      setReadyKey(activeKey);
    };

    const armStallWatchdog = () => {
      if (timersRef.current.has(i)) return;
      timersRef.current.set(
        i,
        setTimeout(() => {
          timersRef.current.delete(i);
          // Buffered too long without a frame → soften the source.
          degrade();
        }, STALL_TIMEOUT_MS)
      );
    };

    // Step the clip down: high→low once, then low→poster. Bounded, no storms.
    const degrade = () => {
      clearTimer(i);
      if (quality === "high" && !downgradedRef.current[i]) {
        downgradedRef.current[i] = true;
        retriesRef.current[i] = 0;
        const low = resolveSrc(i);
        if (low) {
          assign(video, low);
          safePlay(video);
        }
        return;
      }
      // Already lightweight and still failing: fall back to the poster.
      unload(video);
    };

    const retry = () => {
      const n = retriesRef.current[i];
      if (n >= MAX_RETRIES) {
        degrade();
        return;
      }
      retriesRef.current[i] = n + 1;
      timersRef.current.set(
        i,
        setTimeout(() => {
          timersRef.current.delete(i);
          try {
            video.load();
          } catch {
            // ignore
          }
          safePlay(video);
        }, BACKOFF_MS[Math.min(n, BACKOFF_MS.length - 1)])
      );
    };

    const onPlaying = markReady;
    const onCanPlay = markReady;
    const onWaiting = armStallWatchdog;
    const onStalled = armStallWatchdog;
    const onError = retry;

    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("error", onError);
      clearTimer(i);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, quality]);

  // --- Unmount: flush any pending timers. ------------------------------------
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <>
      {slides.map((slide, i) => (
        <video
          key={slide.video}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          muted
          loop
          playsInline
          preload="none"
          poster={slide.poster}
          aria-hidden="true"
          className={`hero-slide absolute inset-0 w-full h-full object-cover ${
            i === current ? "is-active" : ""
          }`}
        />
      ))}
    </>
  );
}
