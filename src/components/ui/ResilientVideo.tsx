"use client";

import { useEffect, useRef, useState } from "react";
import { acquireExclusiveMedia } from "@/lib/mediaScheduler";
import { versionedMedia } from "@/lib/mediaVersion";

interface ResilientVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

// Bounded, increasing backoff. A `stalled` event is extremely common during
// normal buffering, so reacting to every one with load()+play() produced a
// retry storm that reset the source repeatedly and made recovery *less* likely.
const BACKOFF_MS = [1000, 2000, 4000] as const;
// A stall only counts as a real failure if the clip is still not progressing
// after this long — most stalls resolve themselves well inside it.
const STALL_GRACE_MS = 1200;

/**
 * Full-view video for the gallery lightbox.
 *
 * This is the user's explicit focus, so it plays with controls and the highest
 * media priority. Recovery is bounded: a transient stall is simply waited out,
 * and only a persistent one escalates through delayed retries before falling
 * back to the poster. Never an unbounded retry loop.
 */
export function ResilientVideo({ src, poster, className }: ResilientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  // The lightbox is the user's explicit focus: silence every background video
  // for as long as it is open, and restore normal scheduling on close.
  useEffect(() => acquireExclusiveMedia(), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setFailed(false);
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let graceTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let lastTime = -1;

    const clearTimers = () => {
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    };

    const tryPlay = () => {
      if (disposed) return;
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const escalate = () => {
      if (disposed) return;
      if (attempt >= BACKOFF_MS.length) {
        // Out of retries — keep the poster rather than a broken player.
        clearTimers();
        setFailed(true);
        return;
      }
      const delay = BACKOFF_MS[attempt];
      attempt += 1;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (disposed) return;
        try {
          el.load();
        } catch {
          // ignore
        }
        tryPlay();
      }, delay);
    };

    // A stall escalates only if playback genuinely fails to progress.
    const onStalledOrWaiting = () => {
      if (graceTimer || retryTimer || disposed) return;
      lastTime = el.currentTime;
      graceTimer = setTimeout(() => {
        graceTimer = null;
        if (disposed) return;
        if (el.currentTime > lastTime + 0.01) return; // recovered on its own
        escalate();
      }, STALL_GRACE_MS);
    };

    const onProgressing = () => {
      // Real progress cancels any pending escalation and resets the ladder.
      if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
      attempt = 0;
    };

    const onError = () => escalate();

    el.addEventListener("stalled", onStalledOrWaiting);
    el.addEventListener("waiting", onStalledOrWaiting);
    el.addEventListener("playing", onProgressing);
    el.addEventListener("timeupdate", onProgressing);
    el.addEventListener("error", onError);
    tryPlay();

    return () => {
      disposed = true;
      clearTimers();
      el.removeEventListener("stalled", onStalledOrWaiting);
      el.removeEventListener("waiting", onStalledOrWaiting);
      el.removeEventListener("playing", onProgressing);
      el.removeEventListener("timeupdate", onProgressing);
      el.removeEventListener("error", onError);
      try {
        el.pause();
        el.removeAttribute("src");
        el.load();
      } catch {
        // ignore
      }
    };
  }, [src]);

  if (failed && poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt="" className={className} />
    );
  }

  return (
    <video
      ref={ref}
      key={src}
      src={versionedMedia(src)}
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
