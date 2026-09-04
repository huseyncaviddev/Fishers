"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaPolicy } from "@/lib/mediaPolicy";
import { versionedMedia } from "@/lib/mediaVersion";
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
// hand it the slot, so sweeping across a grid never starts anything.
const HOVER_INTENT_MS = 140;
const HOVER_EXIT_MS = 120;

// A tile must be *meaningfully* on screen before it asks to play. Below this it
// is scenery, not something the reader is looking at.
const AUTOPLAY_RATIO = 0.55;

// Enough steps that the winner changes smoothly as you scroll, few enough that
// the observer is not firing constantly.
const RATIO_STEPS = [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1];

/**
 * A gallery/preview video governed entirely by the global media scheduler.
 *
 * It never calls play() itself — it only ever *asks*, and the scheduler decides.
 * Because the page-wide cap is one playing video, several tiles can want the
 * slot at once and exactly one gets it.
 *
 * Which one? The most visible. A tile's priority scales with how much of it is
 * on screen, so as you scroll the slot hands off naturally from the tile
 * leaving the viewport to the one entering it. A deliberate hover, or a tap on
 * touch, outranks all of that and takes the slot immediately.
 *
 * Far from the viewport the source is released entirely (decoder + buffered
 * bytes freed), so a long gallery never accumulates attached video.
 */
export function SmartVideo({
  src,
  poster,
  className,
  rootMargin = "200px 0px",
  playLabel = "Videonu oynat",
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<MediaHandle | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const policy = useMediaPolicy();
  const [state, setState] = useState<MediaState>("POSTER");
  const [ratio, setRatio] = useState(0);
  // Explicit intent (tap / settled hover) — outranks scroll position.
  const [claimed, setClaimed] = useState(false);

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
      priority: MediaPriority.AMBIENT,
      wantsPlay: false,
      onState: setState,
    });
    handleRef.current = handle;
    return () => {
      handle.release();
      handleRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    handleRef.current?.update({ src });
  }, [src]);

  // Track how much of the tile is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const r = entry.isIntersecting ? entry.intersectionRatio : 0;
        setRatio(r);
        if (r === 0) {
          clearHoverTimer();
          setClaimed(false);
        }
      },
      { rootMargin, threshold: RATIO_STEPS }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // Translate visibility + intent into a scheduler request.
  useEffect(() => {
    if (policy.posterFirst) {
      handleRef.current?.update({ wantsPlay: false });
      return;
    }
    const visibleEnough = policy.viewportAutoplay && ratio >= AUTOPLAY_RATIO;
    const wantsPlay = claimed || visibleEnough;
    // Explicit intent wins outright. Otherwise the more of the tile that is on
    // screen, the stronger its claim — so the slot follows the reader's eye
    // instead of whichever tile happened to mount last.
    const priority = claimed
      ? MediaPriority.USER
      : MediaPriority.AMBIENT + Math.round(ratio * 30);
    handleRef.current?.update({ wantsPlay, priority });
  }, [ratio, claimed, policy.viewportAutoplay, policy.posterFirst]);

  useEffect(() => () => clearHoverTimer(), []);

  const onPointerEnter = useCallback(() => {
    if (!policy.hoverIntent || policy.posterFirst) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setClaimed(true), HOVER_INTENT_MS);
  }, [policy.hoverIntent, policy.posterFirst]);

  const onPointerLeave = useCallback(() => {
    if (!policy.hoverIntent) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setClaimed(false), HOVER_EXIT_MS);
  }, [policy.hoverIntent]);

  // Touch: a tap pins this tile as the one that should be playing.
  const onTap = useCallback(() => {
    if (!policy.coarsePointer || policy.posterFirst) return;
    setClaimed((c) => !c);
  }, [policy.coarsePointer, policy.posterFirst]);

  const showing = state === "PLAYING";
  // Only offer the manual affordance where automatic playback will not happen
  // anyway — otherwise it is a button that does nothing the scroll didn't.
  const showTapHint =
    policy.coarsePointer && !policy.posterFirst && !showing && ratio < AUTOPLAY_RATIO;

  return (
    <div
      className="sv-root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* The poster carries the experience whenever this tile does not hold the
          playback slot, so it must be a real, correctly-sized image. */}
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

/**
 * Resolve the poster frame for a `/videos/<name>.mp4` source.
 *
 * Versioned like the clips themselves: posters live under /videos/ and are
 * served `immutable`, so regenerating them without a new URL would leave every
 * returning visitor on the old 32px placeholders for a year.
 */
export function videoPosterJpg(src: string): string {
  const name = src.split("/").pop()?.replace(/\.mp4$/, "") ?? "";
  return versionedMedia(`/videos/posters/${name}.jpg`);
}
