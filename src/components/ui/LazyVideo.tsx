"use client";

import { useEffect, useRef } from "react";
import { registerVideo } from "@/lib/videoLoader";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  priority?: number;
  autoplay?: boolean;
}

export function LazyVideo({
  src,
  poster,
  className,
  priority = 0,
  autoplay = true,
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    return registerVideo(video, { src, priority, autoplay });
  }, [src, priority, autoplay]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      className={
        className
          ? `${className} w-full h-full object-cover`
          : "w-full h-full object-cover"
      }
    />
  );
}

export function videoPoster(src: string): string {
  const name = src.split("/").pop()?.replace(".mp4", "");
  return `/images/posters/${name}.jpg`;
}
