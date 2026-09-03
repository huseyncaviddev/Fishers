import type { NetworkSnapshot } from "./networkManager";

/**
 * Delivery decision for a hero background video.
 * - `high`: full-quality master (good connections + desktop viewport).
 * - `low`: lightweight 480p variant (weak connection, Save-Data, or small
 *   viewport where the master would be wasted bytes).
 * - `none`: no video — keep the poster only (offline, barely-2g,
 *   reduced-motion).
 */
export type HeroQuality = "high" | "low" | "none";

interface QualityInputs {
  net: NetworkSnapshot;
  reducedMotion: boolean;
  /**
   * Client viewport width in CSS pixels. `undefined` during SSR — we don't
   * downgrade until we have a real width, so the first paint doesn't guess.
   */
  viewportWidth?: number;
}

// A hero background at <=768px CSS px never benefits from more than the 480p
// variant, so we short-circuit the network heuristic and save the bytes.
const PHONE_BREAKPOINT_PX = 768;

/**
 * Chooses the hero delivery tier from network hints, motion preference and
 * viewport size.
 *
 * The network snapshot is treated as an *optimization hint*, never as ground
 * truth — playback/stall recovery in `HeroVideoStack` downgrades further at
 * runtime if the hint was too optimistic. Kept pure so it is trivially
 * unit-testable.
 */
export function pickHeroQuality({
  net,
  reducedMotion,
  viewportWidth,
}: QualityInputs): HeroQuality {
  if (reducedMotion) return "none";
  if (!net.online || net.klass === "OFFLINE") return "none";
  // slow-2g genuinely cannot sustain even the 480p loop — stay on the poster.
  if (net.klass === "VERY_SLOW") return "none";

  // Save-Data is an explicit request to minimise bytes: still show motion, but
  // only the tiny variant.
  if (net.saveData) return "low";

  // Phones / small tablets: the 480p rendition already saturates the viewport,
  // so shipping the full master is pure waste — regardless of connection speed.
  if (typeof viewportWidth === "number" && viewportWidth <= PHONE_BREAKPOINT_PX) {
    return "low";
  }

  // 2g / 3g and other constrained links: lightweight variant that starts fast.
  if (net.klass === "SLOW" || net.klass === "NORMAL") return "low";

  // FAST / ULTRA_FAST, or UNKNOWN (no Network Information API — most desktop
  // Safari/Firefox): serve full quality.
  return "high";
}

/**
 * Loading role for a single hero slide.
 * - `active`: the visible slide — source assigned + played, highest priority.
 * - `warm`: the *next* slide only, buffered quietly (never competes with
 *   `active`, and never more than one at a time).
 * - `idle`: fully unloaded — poster only.
 */
export type SlideRole = "active" | "warm" | "idle";

interface SlidePlanInputs {
  index: number;
  current: number;
  slideCount: number;
  quality: HeroQuality;
  /** True once the active clip can actually play (gates warming the next one). */
  activeReady: boolean;
  /** False while the hero is off-screen or the tab is hidden. */
  playbackAllowed: boolean;
}

/**
 * Priority planner: the visible slide loads eagerly. Once it is ready AND the
 * hero is on-screen with a visible tab, we warm *only the immediate next
 * slide* so a crossfade reveals video instead of the poster. Every other slide
 * stays unloaded (poster only) — no five-way byte race on desktop, no wasted
 * decode on mobile. Pure so the loading policy is unit-testable.
 */
export function planSlideRole({
  index,
  current,
  slideCount,
  quality,
  activeReady,
  playbackAllowed,
}: SlidePlanInputs): SlideRole {
  if (quality === "none") return "idle";
  if (index === current) return "active";
  if (!activeReady || !playbackAllowed) return "idle";
  const next = (current + 1) % slideCount;
  return index === next ? "warm" : "idle";
}

const LOW_SUFFIX = "-low.mp4";

/**
 * Resolves the concrete asset URL for a base `/videos/<name>.mp4` source.
 * `high` returns the master untouched; `low` maps to the `-low.mp4` variant.
 */
export function heroVideoSrc(baseSrc: string, quality: "high" | "low"): string {
  if (quality === "high") return baseSrc;
  return baseSrc.replace(/\.mp4$/, LOW_SUFFIX);
}
