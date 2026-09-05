"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaPolicy } from "@/lib/mediaPolicy";
import {
  MediaPriority,
  requestMedia,
  type MediaHandle,
  type MediaState,
} from "@/lib/mediaScheduler";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Relative importance among ambient background videos. */
  priority?: number;
  /** Ignored on poster-first policies. */
  autoplay?: boolean;
}

/**
 * Ambient background video (section backdrops). Requests a playback slot only
 * while genuinely on screen, and yields it to anything the user actually asked
 * for — a lightbox or a tapped gallery tile always wins.
 */
export function LazyVideo({
  src,
  poster,
  className,
  priority = 0,
  autoplay = true,
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<MediaHandle | null>(null);
  const policy = useMediaPolicy();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<MediaState>("POSTER");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = requestMedia({
      el,
      src,
      priority: MediaPriority.AMBIENT + priority,
      wantsPlay: false,
      onState: setState,
    });
    handleRef.current = handle;
    return () => {
      handle.release();
      handleRef.current = null;
    };
  }, [src, priority]);

  // Play only while genuinely on screen, with the same hysteresis band the
  // gallery tiles use: enter at 35% visible, keep going until 20%. A backdrop
  // the user has scrolled past has no claim on the decoder.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Take the LAST entry, not the first. A fast scroll can cross several
        // thresholds between frames, and the observer then delivers them all in
        // one callback — oldest first. Reading `entries[0]` uses stale state and
        // silently drops the final "ratio 0", leaving a clip playing far off
        // screen because the component still believes it is visible.
        const entry = entries[entries.length - 1];
        const r = entry.isIntersecting ? entry.intersectionRatio : 0;
        setVisible((was) => (was ? r >= 0.2 : r >= 0.35));
      },
      { threshold: [0, 0.1, 0.2, 0.28, 0.35, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const wants = visible && autoplay && !policy.posterFirst;
    // No retention for full-size section backdrops: these are the heaviest
    // clips on the page, so once one is off screen its source is released
    // rather than held. Re-attaching costs a fetch; holding costs memory on
    // every phone that scrolled past it.
    handleRef.current?.update({ wantsPlay: wants, wantsWarm: false });
  }, [visible, autoplay, policy.posterFirst]);

  const cls = className
    ? `${className} w-full h-full object-cover`
    : "w-full h-full object-cover";

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      className={`${cls} lv-video ${state === "PLAYING" ? "is-ready" : ""}`}
    />
  );
}

export function videoPoster(src: string): string {
  const name = src.split("/").pop()?.replace(".mp4", "");
  return `/images/posters/${name}.jpg`;
}
