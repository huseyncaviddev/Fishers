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
 * Premium, self-contained lazy video:
 * - attaches its source only when the tile nears the viewport (fast first paint)
 * - plays while visible, pauses when scrolled away (saves CPU/bandwidth)
 * - shows a brand shimmer placeholder, then fades the video in on first frame
 * - keeps trying on weak connections: it buffers and starts as soon as it can,
 *   and auto-recovers from stalls/errors — it never refuses to play.
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
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const retriesRef = useRef(0);
  // Offline is the only hard stop; slow connections still buffer and play.
  const online = useNetwork().online;

  // Attach the source only once the tile nears the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          void el.play?.().catch(() => {});
        } else {
          el.pause?.();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // Resilient recovery: on stall/error, reload the source and retry playback.
  useEffect(() => {
    const el = ref.current;
    if (!el || !active || !online) return;

    const tryPlay = () => void el.play?.().catch(() => {});
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
        autoPlay
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
