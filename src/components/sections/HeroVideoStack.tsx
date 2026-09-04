"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HeroQuality } from "@/lib/videoQuality";
import { heroVideoSrc, planSlideRole } from "@/lib/videoQuality";

export interface HeroSlideMedia {
  video: string;
  poster: string;
}

interface HeroVideoStackProps {
  slides: ReadonlyArray<HeroSlideMedia>;
  current: number;
  /** Delivery tier chosen from network + reduced-motion + viewport width. */
  quality: HeroQuality;
}

// Bounded stall/error recovery — never an infinite retry storm.
const MAX_RETRIES = 3;
const BACKOFF_MS = [800, 1600, 3200] as const;
// If a video keeps buffering this long without a frame, treat it as a soft
// failure and drop to the lightweight variant (or the poster).
const STALL_TIMEOUT_MS = 6000;

/**
 * Priority-based hero video manager.
 *
 * At any moment there is AT MOST one playing video and AT MOST one warm
 * (preloaded) neighbour — the *immediate* next slide. Every other slide is
 * fully released (poster only), so five videos never race for bytes/CPU/GPU.
 *
 * Playback is also gated on:
 *   - the container being in the viewport
 *   - document.visibilityState === "visible"
 * so a scrolled-away hero or a backgrounded tab never keeps decoding.
 *
 * The poster image renders underneath every slide via `next/image` (AVIF/WebP
 * where supported) with the first slide's poster marked `priority` so it wins
 * the browser's initial fetch race. The video only fades in once it has a real
 * frame — so the hero is never a black rectangle and the handoff is
 * imperceptible.
 */
export function HeroVideoStack({ slides, current, quality }: HeroVideoStackProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const retriesRef = useRef<number[]>(slides.map(() => 0));
  const downgradedRef = useRef<boolean[]>(slides.map(() => false));
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const firstSlideRef = useRef<HTMLDivElement>(null);

  // Playback gate — false while the hero is off-screen or the tab is hidden.
  // Starts true so the very first slide isn't held back by SSR's blind guess.
  const [playbackAllowed, setPlaybackAllowed] = useState(true);

  // Warming is keyed by (active slide, quality) so any change auto-invalidates
  // it without a separate reset effect.
  const activeKey = `${current}:${quality}`;
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const activeReady = readyKey === activeKey;

  // Which slides currently show video (vs poster). Poster remains visible
  // underneath until the video renders a real frame, so we never expose a
  // black rectangle mid-transition.
  const [revealed, setRevealed] = useState<boolean[]>(() => slides.map(() => false));
  const reveal = (i: number) =>
    setRevealed((r) => (r[i] ? r : r.map((v, j) => (j === i ? true : v))));
  const hide = (i: number) =>
    setRevealed((r) => (!r[i] ? r : r.map((v, j) => (j === i ? false : v))));

  const nextIndex = useMemo(
    () => (current + 1) % slides.length,
    [current, slides.length]
  );

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
      // Force the element to release the buffered bytes rather than sit on them
      // with a stale src attribute.
      video.load();
    } catch {
      // ignore
    }
  };

  /** Returns true when the source actually changed (and the element reloaded). */
  const assign = (video: HTMLVideoElement, src: string): boolean => {
    if (video.getAttribute("src") === src) return false;
    video.setAttribute("src", src);
    try {
      video.load();
    } catch {
      // ignore
    }
    return true;
  };

  const safePlay = (video: HTMLVideoElement) => {
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  const resetRecovery = (i: number) => {
    retriesRef.current[i] = 0;
    downgradedRef.current[i] = false;
    clearTimer(i);
  };

  // --- Playback gate: intersection + tab visibility ---------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = firstSlideRef.current;
    if (!el) return;

    let inView = true;

    const commit = () => {
      const allowed =
        inView &&
        (typeof document === "undefined" || !document.hidden);
      setPlaybackAllowed((prev) => (prev === allowed ? prev : allowed));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        // 0.1 threshold: even a sliver of hero visible still counts as "in
        // view" so a normal scroll doesn't stutter the video during a nav.
        inView = entry.isIntersecting;
        commit();
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    const onVisibility = () => commit();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // --- Placement: assign role + source for every slide. ----------------------
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      const role = planSlideRole({
        index: i,
        current,
        slideCount: slides.length,
        quality,
        activeReady,
        playbackAllowed,
      });

      if (role === "idle") {
        if (i !== current) resetRecovery(i);
        unload(video);
        hide(i); // src gone → poster reveals underneath, never a stale/black frame
        return;
      }

      const src = resolveSrc(i);
      if (!src) {
        unload(video);
        hide(i);
        return;
      }

      // A source swap reloads the element back to its black frame 0, so drop
      // the reveal until a real frame is painted again — otherwise the stale
      // `is-ready` would expose that black frame over the poster.
      if (assign(video, src)) hide(i);
      video.preload = "auto";

      if (role === "active") {
        if (playbackAllowed) {
          safePlay(video);
        } else {
          // Pause but keep the src attached so resuming is instant when the
          // hero returns to view / the tab regains focus.
          try {
            video.pause();
          } catch {
            // ignore
          }
        }
      } else {
        // warm: buffer quietly, never play.
        try {
          video.pause();
        } catch {
          // ignore
        }
      }
    });
    // resolveSrc/unload closures are stable via refs; only these inputs decide
    // what work runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, quality, activeReady, playbackAllowed, nextIndex, slides]);

  // --- Recovery: bounded retry → downgrade → poster, for the ACTIVE clip. ----
  useEffect(() => {
    if (quality === "none") return;
    const i = current;
    const video = videoRefs.current[i];
    if (!video) return;

    const markReady = () => {
      clearTimer(i);
      setReadyKey(activeKey);
      reveal(i); // fade the video in over its poster
    };

    // These clips fade in from black, so frame 0 is a black rectangle. Revealing
    // on `canplay` (which only means bytes are buffered) therefore paints a
    // black box over a perfectly good poster — and if playback never actually
    // starts, it stays black forever. So we only reveal once the compositor has
    // genuinely presented a frame past the black lead-in.
    const FIRST_VISIBLE_FRAME_S = 0.05;
    let rvfcHandle = 0;
    type FrameCallbackVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (handle: number) => void;
    };
    const fcVideo = video as FrameCallbackVideo;
    const supportsFrameCallback =
      typeof fcVideo.requestVideoFrameCallback === "function";

    // Waits for an actually-presented frame (rVFC), re-arming until the clip is
    // past its black first frame.
    const awaitPaintedFrame = () => {
      if (!supportsFrameCallback) return;
      rvfcHandle = fcVideo.requestVideoFrameCallback!(() => {
        if (video.currentTime > FIRST_VISIBLE_FRAME_S) markReady();
        else awaitPaintedFrame();
      });
    };

    // Fallback for browsers without rVFC (mainly older Firefox): `timeupdate`
    // proves the clip is genuinely advancing, not merely buffered.
    const onTimeUpdate = () => {
      if (video.currentTime > FIRST_VISIBLE_FRAME_S) markReady();
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
          if (assign(video, low)) hide(i); // reloading → back to poster until painted
          if (playbackAllowed) safePlay(video);
        }
        return;
      }
      // Already lightweight and still failing: fall back to the poster.
      unload(video);
      hide(i);
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
          if (playbackAllowed) safePlay(video);
        }, BACKOFF_MS[Math.min(n, BACKOFF_MS.length - 1)])
      );
    };

    const onPlaying = () => {
      clearTimer(i);
      awaitPaintedFrame();
    };

    // `canplay` is NOT proof of a painted frame — it only means enough data is
    // buffered. Use it to (re)assert playback instead: swapping the source
    // (e.g. the high→low switch that fires on every phone once the viewport is
    // known) calls load(), which aborts the in-flight play() promise. Without
    // this the clip would sit paused at its black frame 0 indefinitely.
    const onCanPlay = () => {
      clearTimer(i);
      if (playbackAllowed) safePlay(video);
    };

    const onWaiting = armStallWatchdog;
    const onStalled = armStallWatchdog;
    const onError = retry;

    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    if (!supportsFrameCallback) {
      video.addEventListener("timeupdate", onTimeUpdate);
    }
    // If we arrive already playing (src unchanged across a re-render), don't
    // wait for another `playing` event that will never come.
    if (!video.paused) awaitPaintedFrame();
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("error", onError);
      if (rvfcHandle) fcVideo.cancelVideoFrameCallback?.(rvfcHandle);
      clearTimer(i);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, quality, playbackAllowed]);

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
      {slides.map((slide, i) => {
        const isFirst = i === 0;
        return (
          <div
            key={slide.video}
            ref={isFirst ? firstSlideRef : undefined}
            aria-hidden="true"
            className={`hero-slide ${i === current ? "is-active" : ""}`}
          >
            {/* Optimized poster underneath the video. It renders on first paint
                (via next/image AVIF/WebP negotiation) so the hero is always a
                composed frame — never a black rectangle. */}
            <Image
              src={slide.poster}
              alt=""
              fill
              sizes="100vw"
              priority={isFirst}
              fetchPriority={isFirst ? "high" : "low"}
              // 75 is one of next.config's allowed `qualities` — behind the
              // hero's dark overlay + film grain it is visually identical to a
              // higher setting, and the AVIF stays small for slow-network first
              // paint. (An out-of-list value is silently clamped, so we name it.)
              quality={75}
              className="hero-slide__poster"
              aria-hidden="true"
            />
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              aria-hidden="true"
              className={`hero-slide__video ${revealed[i] ? "is-ready" : ""}`}
            />
          </div>
        );
      })}
    </>
  );
}
