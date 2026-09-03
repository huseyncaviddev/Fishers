"use client";

import { useEffect, useRef, useState } from "react";
import { useNetwork } from "@/lib/networkManager";

interface SmartVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Distance from viewport (px) at which the video begins loading. */
  rootMargin?: string;
}

/** Bounded auto-retry so a stalled/failed load on weak networks recovers. */
const MAX_RETRIES = 4;

/**
 * Premium, self-contained lazy video.
 *
 * Two-stage IntersectionObserver:
 *   - LOAD observer (near-viewport, wide margin): attaches the source so a
 *     tile that scrolls in has already buffered its first frames.
 *   - PLAY observer (actually visible, no margin): starts playback while the
 *     tile is on screen and pauses it the moment it scrolls away. Prevents
 *     the gallery from playing four offscreen videos at once on mobile.
 *
 * Also pauses the video when the tab is hidden and resumes on return, so a
 * backgrounded tab never keeps decoding.
 *
 * Render inside a `relative` container.
 */
export function SmartVideo({
  src,
  poster,
  className,
  rootMargin = "600px 0px",
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const retriesRef = useRef(0);
  // Offline is the only hard stop; slow connections still buffer and play.
  const online = useNetwork().online;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const applyPlayState = () => {
      const shouldPlay =
        inViewRef.current &&
        (typeof document === "undefined" || !document.hidden);
      if (shouldPlay) {
        void el.play?.().catch(() => {});
      } else {
        try {
          el.pause?.();
        } catch {
          // ignore
        }
      }
    };

    // LOAD observer — near-viewport. Only flips `active` on so the <video>
    // begins buffering; play state is decided by the PLAY observer below.
    const ioLoad = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { rootMargin, threshold: 0.01 }
    );
    ioLoad.observe(el);

    // PLAY observer — actually visible. Governs playback so an offscreen
    // buffered tile is not still decoding frames.
    const ioPlay = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        applyPlayState();
      },
      { threshold: 0.15 }
    );
    ioPlay.observe(el);

    const onVisibility = () => applyPlayState();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ioLoad.disconnect();
      ioPlay.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rootMargin]);

  // Resilient recovery: on stall/error, reload the source and retry playback.
  useEffect(() => {
    const el = ref.current;
    if (!el || !active || !online) return;

    const tryPlay = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!inViewRef.current) return;
      void el.play?.().catch(() => {});
    };
    const recover = () => {
      if (retriesRef.current >= MAX_RETRIES) return;
      retriesRef.current += 1;
      try {
        el.load();
      } catch {
        // ignore
      }
      tryPlay();
    };

    el.addEventListener("stalled", recover);
    el.addEventListener("error", recover);
    el.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      el.removeEventListener("stalled", recover);
      el.removeEventListener("error", recover);
      el.removeEventListener("canplay", tryPlay);
    };
  }, [active, online, src]);

  const loadedClass = loaded ? "sv-loaded" : "";

  return (
    <>
      <div
        aria-hidden="true"
        className={`sv-fill sv-placeholder ${loadedClass}`}
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      />
      <video
        ref={ref}
        src={active ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onLoadedData={() => setLoaded(true)}
        onCanPlay={() => setLoaded(true)}
        className={`sv-fill sv-video ${loadedClass} ${className ?? ""}`}
      />
    </>
  );
}

/** Resolve the tiny poster frame for a `/videos/<name>.mp4` source. */
export function videoPosterJpg(src: string): string {
  const name = src.split("/").pop()?.replace(/\.mp4$/, "") ?? "";
  return `/videos/posters/${name}.jpg`;
}
