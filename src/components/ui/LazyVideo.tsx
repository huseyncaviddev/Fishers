"use client";

import { useRef, useEffect } from "react";
import { useInView } from "framer-motion";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(containerRef, { margin: "100px" });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (isVisible) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [isVisible, src]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function videoPoster(src: string): string {
  const name = src.split("/").pop()?.replace(".mp4", "");
  return `/images/posters/${name}.jpg`;
}
