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

  // Only ask for a slot while actually on screen — an ambient backdrop that has
  // scrolled away has no claim on the single playback slot.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const wants = visible && autoplay && !policy.posterFirst;
    handleRef.current?.update({ wantsPlay: wants });
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
