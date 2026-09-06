"use client";

import { currentPolicy } from "./mediaPolicy";
import { versionedMedia } from "./mediaVersion";
import { subscribeNetwork } from "./networkManager";

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
  /** Consecutive rejected play() calls, for bounded backoff. */
  playAttempts?: number;
  retryTimer?: ReturnType<typeof setTimeout>;
  /** Pending "has a frame actually been painted yet" watchers. */
  paintHandle?: number;
  paintTimer?: ReturnType<typeof setTimeout>;
}

/** A video element that may implement the rVFC extension. */
type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

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
  clearPaintWatch(c);
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

/** Bounded recovery for a rejected play(), so we never loop load/play forever. */
const MAX_PLAY_ATTEMPTS = 3;
const PLAY_BACKOFF_MS = [250, 900, 2000] as const;
/** How often the no-rVFC fallback checks whether real frames are flowing. */
const PAINT_POLL_MS = 120;

function clearPaintWatch(c: Client) {
  if (c.paintHandle !== undefined) {
    (c.el as FrameVideo).cancelVideoFrameCallback?.(c.paintHandle);
    c.paintHandle = undefined;
  }
  if (c.paintTimer !== undefined) {
    clearTimeout(c.paintTimer);
    c.paintTimer = undefined;
  }
}

/**
 * Promote to PLAYING only once a frame has genuinely been presented.
 *
 * A resolved `play()` promise is not proof of a painted frame — it only means
 * the element was allowed to start. `SmartVideo` fades the poster out on
 * PLAYING, so promoting on resolution alone risks showing an empty box until
 * the first frame decodes. `HeroVideoStack` already reveals on a real frame for
 * exactly this reason; this brings the scheduler-managed path in line with it.
 *
 * Honesty about the evidence: on localhost the tiles reach readyState 4 before
 * play() resolves, so the gap never actually opens here — removing this gate
 * and re-running the suite still passes. It is hardening for slow networks and
 * cold decoders, where the ordering is not guaranteed, not a fix for a failure
 * reproduced in this environment.
 */
function confirmPainted(c: Client) {
  clearPaintWatch(c);
  const el = c.el as FrameVideo;

  const settle = () => {
    if (!clients.has(c.id) || !c.wantsPlay) return;
    clearPaintWatch(c);
    setState(c, "PLAYING");
  };

  // rVFC fires on the first frame actually presented to the compositor.
  if (typeof el.requestVideoFrameCallback === "function") {
    c.paintHandle = el.requestVideoFrameCallback(settle);
  }

  // Safety net for engines without rVFC, and for a stall where rVFC never
  // fires: require decoded data AND a clock that has actually moved.
  const poll = () => {
    c.paintTimer = undefined;
    if (!clients.has(c.id) || !c.wantsPlay) return;
    if (!el.paused && el.readyState >= 2 && el.currentTime > 0) {
      settle();
      return;
    }
    c.paintTimer = setTimeout(poll, PAINT_POLL_MS);
  };
  c.paintTimer = setTimeout(poll, PAINT_POLL_MS);
}

/**
 * Start playback and only report PLAYING once the browser confirms it.
 *
 * `play()` returns a promise, and Safari rejects it in situations this app
 * cannot detect up front — iOS Low Power Mode being the important one, where
 * autoplay is refused outright. The previous code swallowed that rejection
 * (`p.catch(() => {})`) while the caller set PLAYING unconditionally, so
 * `SmartVideo` faded the poster out over a video that had been refused
 * permission to start: a frozen frame with no indication anything was wrong.
 *
 * That refusal cannot be reproduced under Playwright — neither Chromium nor
 * WebKit emulates Low Power Mode — so this is a correctness fix for a state
 * machine that could lie, not a verified reproduction of the reported symptom.
 *
 * Now the promise decides: confirmed playback waits for a real frame, and a
 * rejection leaves the poster in place and schedules a bounded retry.
 */
function play(c: Client) {
  const el = c.el;

  // Set the mobile autoplay preconditions imperatively, immediately before the
  // call. React props alone are not enough here: an imperative `src` swap can
  // land between render and play, and WebKit checks these at call time.
  el.muted = true;
  el.defaultMuted = true;
  if (!el.hasAttribute("muted")) el.setAttribute("muted", "");
  if (!el.hasAttribute("playsinline")) el.setAttribute("playsinline", "");

  const attempt = c.playAttempts ?? 0;
  const p = el.play();

  if (!p || typeof p.then !== "function") {
    // Ancient signature with no promise — still wait for a real frame.
    if (!el.paused) confirmPainted(c);
    else setState(c, "READY");
    return;
  }

  p.then(
    () => {
      c.playAttempts = 0;
      // Only wait for paint if this client still wants it; a scroll may have
      // overtaken the promise.
      if (c.wantsPlay) confirmPainted(c);
    },
    (err: unknown) => {
      const name = err instanceof Error ? err.name : "";
      // AbortError just means a newer load()/pause() superseded this call — the
      // next reconcile handles it, so it is not a failure worth retrying.
      if (name === "AbortError" || !c.wantsPlay) return;

      setState(c, "READY"); // poster stays visible; we are NOT playing
      if (attempt >= MAX_PLAY_ATTEMPTS) return;

      c.playAttempts = attempt + 1;
      if (c.retryTimer) clearTimeout(c.retryTimer);
      c.retryTimer = setTimeout(() => {
        c.retryTimer = undefined;
        if (c.wantsPlay && clients.has(c.id)) play(c);
      }, PLAY_BACKOFF_MS[Math.min(attempt, PLAY_BACKOFF_MS.length - 1)]);
    }
  );
}

function pause(c: Client) {
  clearPaintWatch(c);
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
      // State is set by play() itself, once the browser confirms it — not here.
      play(c);
      continue;
    }
    if (warmers.has(c.id)) {
      c.el.preload = "auto";
      attach(c);
      pause(c);
      setState(c, "READY");
      continue;
    }
    // Not selected.
    //
    // A client that lost a *play* slot to a cap keeps its source: it is on
    // screen, the cap is the only reason it is not playing, and a freed slot
    // should resume it instantly. The same applies while the tab is hidden.
    //
    // A client that lost a *warm* slot must be released. Keeping it attached is
    // what previously let retained sources exceed maxWarm — the budget counted
    // winners while the losers quietly held their decoders anyway.
    const cappedOutOfPlaySlot = c.wantsPlay && (hidden || Number.isFinite(maxPlaying));
    if (cappedOutOfPlaySlot) {
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

  // Policy is an input to every decision, so a policy change has to trigger a
  // pass of its own. Without this the scheduler only re-evaluated when some
  // component happened to update: a connection dropping to 2g (maxPlaying
  // Infinity -> 1) left five clips playing until an unrelated scroll event
  // eventually forced a reconcile.
  subscribeNetwork(schedule);
  if (typeof window !== "undefined" && window.matchMedia) {
    for (const q of ["(pointer: coarse)", "(prefers-reduced-motion: reduce)"]) {
      window.matchMedia(q).addEventListener("change", schedule);
    }
  }
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
      if (c.retryTimer) clearTimeout(c.retryTimer);
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
