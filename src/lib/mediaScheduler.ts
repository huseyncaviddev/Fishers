"use client";

import { currentPolicy } from "./mediaPolicy";
import { versionedMedia } from "./mediaVersion";

/**
 * The single authority for which <video> elements may play or buffer.
 *
 * Every media surface on the site (hero, about, showcase, gallery tiles,
 * lightbox) registers here instead of running its own IntersectionObserver +
 * autoplay logic. That is what makes `playingVideoCount <= 1` a genuine
 * page-wide invariant rather than a per-component promise.
 *
 * Deliberately small and dependency-free: a Map of clients, a priority sort,
 * and one reconcile pass. No store library, no state machine framework.
 */

/** Higher wins a contested slot. */
export const MediaPriority = {
  /** Explicitly opened by the user — must never be preempted. */
  LIGHTBOX: 100,
  /** User asked for this tile to play (tap / deliberate hover). */
  USER: 60,
  /** The hero's active slide. */
  HERO: 40,
  /** Decorative background video (about, showcase). */
  AMBIENT: 20,
} as const;

export type MediaState =
  | "POSTER"
  | "QUEUED"
  | "LOADING"
  | "READY"
  | "PLAYING"
  | "PAUSED"
  | "RELEASED";

export interface MediaRequest {
  /** The element under management. */
  el: HTMLVideoElement;
  /** Resolved source URL. */
  src: string;
  priority: number;
  /** Wants an actual playback slot. */
  wantsPlay: boolean;
  /** Wants to buffer ahead without playing (desktop only). */
  wantsWarm?: boolean;
  /** Notified whenever the scheduler moves this client. */
  onState?: (state: MediaState) => void;
}

interface Client extends MediaRequest {
  id: number;
  state: MediaState;
}

const clients = new Map<number, Client>();
let nextId = 1;
let reconcileQueued = false;
/**
 * Depth counter for full-screen media (the gallery lightbox). While non-zero
 * no scheduler client may play, so opening a lightbox reliably silences every
 * background video and closing it restores normal scheduling.
 */
let exclusiveDepth = 0;

function setState(c: Client, next: MediaState) {
  if (c.state === next) return;
  c.state = next;
  c.onState?.(next);
}

function attach(c: Client) {
  // Single choke point for every scheduler-managed video, so cache-busting is
  // applied uniformly rather than at each call site.
  const url = versionedMedia(c.src);
  if (c.el.getAttribute("src") === url) return;
  c.el.setAttribute("src", url);
  try {
    c.el.load();
  } catch {
    // ignore
  }
}

function detach(c: Client) {
  const el = c.el;
  try {
    el.pause();
  } catch {
    // ignore
  }
  if (el.hasAttribute("src")) {
    el.removeAttribute("src");
    // load() after removing src is what actually frees the decoder and the
    // buffered bytes; without it the element keeps holding memory.
    try {
      el.load();
    } catch {
      // ignore
    }
  }
}

function play(c: Client) {
  const p = c.el.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

function pause(c: Client) {
  try {
    c.el.pause();
  } catch {
    // ignore
  }
}

function docHidden(): boolean {
  return typeof document !== "undefined" && document.hidden;
}

/**
 * One pass: decide who plays, who warms, and who is released, then apply it.
 * Idempotent — safe to run as often as we like.
 */
function reconcile() {
  reconcileQueued = false;
  const policy = currentPolicy();
  const hidden = docHidden();

  const all = [...clients.values()];

  // Everything genuinely on screen wants to play. Priority (higher first) only
  // decides who survives when a cap is in force — normally there is no cap, so
  // every visible client plays and the set is simply "what the user can see".
  const wantPlay = all
    .filter((c) => c.wantsPlay)
    .sort((a, b) => b.priority - a.priority || b.id - a.id);

  const maxPlaying = hidden || exclusiveDepth > 0 ? 0 : policy.maxPlaying;
  const winners = new Set(
    (Number.isFinite(maxPlaying) ? wantPlay.slice(0, maxPlaying) : wantPlay).map(
      (c) => c.id
    )
  );

  // Retention, not speculation: a client that has left the play band but is
  // still near keeps its source so a few pixels of scroll cannot cause an
  // attach/detach/attach cycle. Bounded, so a long gallery cannot accumulate
  // decoders behind the user.
  const wantWarm = all
    .filter((c) => c.wantsWarm && !winners.has(c.id))
    .sort((a, b) => b.priority - a.priority || b.id - a.id);
  const maxWarm = hidden || exclusiveDepth > 0 ? 0 : policy.maxWarm;
  const warmers = new Set(wantWarm.slice(0, maxWarm).map((c) => c.id));

  for (const c of all) {
    if (winners.has(c.id)) {
      c.el.preload = "auto";
      attach(c);
      play(c);
      setState(c, "PLAYING");
      continue;
    }
    if (warmers.has(c.id)) {
      c.el.preload = "auto";
      attach(c);
      pause(c);
      setState(c, "READY");
      continue;
    }
    // Not selected. A client that still *wants* to play keeps its source (so
    // resuming is instant when the tab returns or a slot frees) but stops
    // decoding. Anything else is fully released back to its poster.
    if (c.wantsPlay || c.wantsWarm) {
      pause(c);
      setState(c, hidden ? "PAUSED" : "QUEUED");
    } else {
      detach(c);
      c.el.preload = "none";
      setState(c, "RELEASED");
    }
  }
}

/** Coalesce bursts of requests into a single pass. */
function schedule() {
  if (reconcileQueued) return;
  reconcileQueued = true;
  queueMicrotask(reconcile);
}

let visibilityBound = false;
function bindVisibility() {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", schedule);
}

export interface MediaHandle {
  /** Update what this client wants; triggers a reconcile. */
  update(patch: Partial<Pick<MediaRequest, "src" | "priority" | "wantsPlay" | "wantsWarm">>): void;
  /** Unregister and release. */
  release(): void;
}

/**
 * Register a video element with the scheduler. The returned handle is the only
 * way a component should start/stop playback — calling `el.play()` directly
 * would break the page-wide invariant.
 */
export function requestMedia(req: MediaRequest): MediaHandle {
  bindVisibility();
  const id = nextId++;
  const client: Client = { ...req, id, state: "POSTER" };
  clients.set(id, client);
  schedule();

  return {
    update(patch) {
      const c = clients.get(id);
      if (!c) return;
      let changed = false;
      if (patch.src !== undefined && patch.src !== c.src) {
        c.src = patch.src;
        changed = true;
      }
      if (patch.priority !== undefined && patch.priority !== c.priority) {
        c.priority = patch.priority;
        changed = true;
      }
      if (patch.wantsPlay !== undefined && patch.wantsPlay !== c.wantsPlay) {
        c.wantsPlay = patch.wantsPlay;
        changed = true;
      }
      if (patch.wantsWarm !== undefined && patch.wantsWarm !== c.wantsWarm) {
        c.wantsWarm = patch.wantsWarm;
        changed = true;
      }
      if (changed) schedule();
    },
    release() {
      const c = clients.get(id);
      if (!c) return;
      detach(c);
      clients.delete(id);
      schedule();
    },
  };
}

/**
 * Claim the screen for user-opened full-screen media (the lightbox). Every
 * scheduler client is paused for the duration. Returns the release function;
 * it is reference-counted so overlapping opens behave correctly.
 */
export function acquireExclusiveMedia(): () => void {
  exclusiveDepth += 1;
  schedule();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    exclusiveDepth = Math.max(0, exclusiveDepth - 1);
    schedule();
  };
}

/** Debug/test helper: how many elements are actually playing right now. */
export function playingVideoCount(): number {
  let n = 0;
  clients.forEach((c) => {
    if (!c.el.paused && !c.el.ended && c.el.getAttribute("src")) n++;
  });
  return n;
}
