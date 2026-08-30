import type { NetworkSnapshot } from "./networkManager";

/**
 * Delivery decision for a hero background video.
 * - `high`: full-quality master (good connections).
 * - `low`: lightweight 480p variant (weak-but-usable / Save-Data).
 * - `none`: no video — keep the poster only (offline, barely-2g, reduced-motion).
 */
export type HeroQuality = "high" | "low" | "none";

interface QualityInputs {
  net: NetworkSnapshot;
  reducedMotion: boolean;
}

/**
 * Chooses the hero delivery tier from network hints and user preference.
 *
 * The network snapshot is treated as an *optimization hint*, never as ground
 * truth — playback/stall recovery downgrades further at runtime if the hint was
 * too optimistic. Kept pure so it is trivially unit-testable.
 */
export function pickHeroQuality({ net, reducedMotion }: QualityInputs): HeroQuality {
  if (reducedMotion) return "none";
  if (!net.online || net.klass === "OFFLINE") return "none";
  // slow-2g genuinely cannot sustain even the 480p loop — stay on the poster.
  if (net.klass === "VERY_SLOW") return "none";

  // Save-Data is an explicit request to minimise bytes: still show motion, but
  // only the tiny variant.
  if (net.saveData) return "low";

  // 2g / 3g and other constrained links: lightweight variant that starts fast.
  if (net.klass === "SLOW" || net.klass === "NORMAL") return "low";

  // FAST / ULTRA_FAST, or UNKNOWN (no Network Information API — most desktop
  // Safari/Firefox): serve full quality.
  return "high";
}

/**
 * Loading role for a single hero slide.
 * - `active`: the visible slide — source assigned + played, highest priority.
 * - `warm`: the next slide, buffered quietly (never competes with `active`).
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
}

/**
 * Priority planner: the visible slide loads eagerly; on a healthy connection,
 * *after* the active clip is ready, every other slide warms (loads + decodes a
 * first frame) so switching to any slide reveals video immediately rather than
 * the poster. Weak connections keep every non-active slide unloaded (poster
 * first). Pure so the loading policy is unit-testable.
 */
export function planSlideRole({
  index,
  current,
  quality,
  activeReady,
}: SlidePlanInputs): SlideRole {
  if (quality === "none") return "idle";
  if (index === current) return "active";
  if (quality === "high" && activeReady) return "warm";
  return "idle";
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
