"use client";

import { useEffect, useRef } from "react";

interface ResilientVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

const MAX_RETRIES = 6;

/**
 * Full-view video for the gallery lightbox. Starts as soon as the first frames
 * arrive (progressive `preload`), and auto-recovers from stalls/errors so it
 * plays through even on weak connections. Buffers rather than refuses.
 */
export function ResilientVideo({ src, poster, className }: ResilientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let retries = 0;

    const tryPlay = () => void el.play?.().catch(() => {});
    const recover = () => {
      if (retries >= MAX_RETRIES) return;
      retries += 1;
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
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="auto"
      className={className}
    />
  );
}
