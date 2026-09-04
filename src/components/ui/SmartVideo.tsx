"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaPolicy } from "@/lib/mediaPolicy";
import {
  MediaPriority,
  requestMedia,
  type MediaHandle,
  type MediaState,
} from "@/lib/mediaScheduler";

interface SmartVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Distance from the viewport at which the tile is considered "near". */
  rootMargin?: string;
  /** Accessible label for the tap-to-play affordance on touch devices. */
  playLabel?: string;
}

// Deliberate hover, not pointer noise: the cursor must rest on a tile before we
// spend a decoder on it, so sweeping across a grid starts nothing.
const HOVER_INTENT_MS = 140;
// Small grace on exit so a pointer clipping a corner doesn't thrash play/pause.
const HOVER_EXIT_MS = 120;

/**
 * A gallery/preview video governed entirely by the global media scheduler.
 *
 * It never autoplays on its own. What it does depends on the resolved policy:
 *
 *   coarse pointer  → poster only; a tap requests playback
 *   fine pointer    → deliberate hover requests playback
 *   poster-first    → poster only, no request at all
 *
 * Far from the viewport the source is released entirely (decoder + buffered
 * bytes freed), so scrolling a long gallery does not accumulate attached video.
 */
export function SmartVideo({
  src,
  poster,
  className,
  rootMargin = "300px 0px",
  playLabel = "Videonu oynat",
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<MediaHandle | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nearRef = useRef(false);

  const policy = useMediaPolicy();
  const [state, setState] = useState<MediaState>("POSTER");
  // Sticky user intent on touch: once tapped, the tile keeps its slot until it
  // scrolls away or something higher-priority takes over.
  const [requested, setRequested] = useState(false);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // Register with the scheduler once the element exists.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = requestMedia({
      el,
      src,
      priority: MediaPriority.USER,
      wantsPlay: false,
      onState: setState,
    });
    handleRef.current = handle;
    return () => {
      handle.release();
      handleRef.current = null;
    };
  }, [src]);

  // Keep the scheduler's copy of the source in sync.
  useEffect(() => {
    handleRef.current?.update({ src });
  }, [src]);

  // Near-viewport tracking. Leaving the near band withdraws the request, which
  // makes the scheduler detach the source and free the decoder.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        nearRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          clearHoverTimer();
          setRequested(false);
          handleRef.current?.update({ wantsPlay: false });
        }
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // Push the current intent to the scheduler.
  useEffect(() => {
    handleRef.current?.update({ wantsPlay: requested && !policy.posterFirst });
  }, [requested, policy.posterFirst]);

  useEffect(() => () => clearHoverTimer(), []);

  const onPointerEnter = useCallback(() => {
    if (!policy.hoverIntent || policy.posterFirst) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      if (nearRef.current) setRequested(true);
    }, HOVER_INTENT_MS);
  }, [policy.hoverIntent, policy.posterFirst]);

  const onPointerLeave = useCallback(() => {
    if (!policy.hoverIntent) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setRequested(false), HOVER_EXIT_MS);
  }, [policy.hoverIntent]);

  // Touch devices: an explicit tap is the only thing that starts motion.
  const onTap = useCallback(() => {
    if (!policy.coarsePointer || policy.posterFirst) return;
    setRequested((r) => !r);
  }, [policy.coarsePointer, policy.posterFirst]);

  const showing = state === "PLAYING";
  const showTapHint = policy.coarsePointer && !policy.posterFirst && !showing;

  return (
    <div
      className="sv-root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* The poster carries the experience. It is a real element (not a video
          frame) so it paints instantly and stays sharp when nothing plays. */}
      <div
        aria-hidden="true"
        className={`sv-fill sv-placeholder ${showing ? "sv-loaded" : ""}`}
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      />
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className={`sv-fill sv-video ${showing ? "sv-loaded" : ""} ${className ?? ""}`}
      />
      {showTapHint && (
        <button
          type="button"
          onClick={onTap}
          aria-label={playLabel}
          className="sv-play"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Resolve the poster frame for a `/videos/<name>.mp4` source. */
export function videoPosterJpg(src: string): string {
  const name = src.split("/").pop()?.replace(/\.mp4$/, "") ?? "";
  return `/videos/posters/${name}.jpg`;
}
