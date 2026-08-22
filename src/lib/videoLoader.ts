"use client";

import {
  getNetworkSnapshot,
  isLowBandwidth,
  shouldPreloadMedia,
  subscribeNetwork,
  type NetworkSnapshot,
} from "./networkManager";

export type VideoState =
  | "IDLE"
  | "POSTER"
  | "NEAR"
  | "PRELOAD"
  | "PLAYING"
  | "RELEASED";

export interface VideoHandle {
  video: HTMLVideoElement;
  src: string;
  priority: number;
  autoplay: boolean;
  state: VideoState;
}

const MAX_PLAYING = 1;
const MAX_PRELOADING = 1;

const registered = new Map<HTMLVideoElement, VideoHandle>();
const nearSet = new Set<HTMLVideoElement>();
const visibleSet = new Set<HTMLVideoElement>();

let sharedObserver: IntersectionObserver | null = null;
let nearObserver: IntersectionObserver | null = null;

function currentNet(): NetworkSnapshot {
  return getNetworkSnapshot();
}

function applySrc(handle: VideoHandle) {
  const { video, src } = handle;
  if (video.getAttribute("src") !== src) {
    video.setAttribute("src", src);
    try {
      video.load();
    } catch {
      // ignore
    }
  }
}

function releaseSrc(handle: VideoHandle) {
  const { video } = handle;
  try {
    video.pause();
  } catch {
    // ignore
  }
  if (video.hasAttribute("src")) {
    video.removeAttribute("src");
    try {
      video.load();
    } catch {
      // ignore
    }
  }
  handle.state = "RELEASED";
}

function playingCount(): number {
  let n = 0;
  registered.forEach((h) => {
    if (h.state === "PLAYING") n++;
  });
  return n;
}

function preloadingCount(): number {
  let n = 0;
  registered.forEach((h) => {
    if (h.state === "PRELOAD") n++;
  });
  return n;
}

function pickSorted(elements: Iterable<HTMLVideoElement>): VideoHandle[] {
  const arr: VideoHandle[] = [];
  for (const el of elements) {
    const h = registered.get(el);
    if (h) arr.push(h);
  }
  arr.sort((a, b) => b.priority - a.priority);
  return arr;
}

function schedule() {
  const net = currentNet();
  const low = isLowBandwidth(net);
  const canPreload = shouldPreloadMedia(net);

  // Downgrade non-visible active videos
  registered.forEach((h) => {
    if (!visibleSet.has(h.video) && (h.state === "PLAYING" || h.state === "PRELOAD")) {
      releaseSrc(h);
      h.state = nearSet.has(h.video) ? "NEAR" : "POSTER";
    }
  });

  // On low bandwidth, drop everything to poster and stop
  if (low) {
    registered.forEach((h) => {
      if (h.state !== "POSTER" && h.state !== "IDLE") {
        if (!visibleSet.has(h.video)) releaseSrc(h);
        else if (net.klass === "OFFLINE") releaseSrc(h);
      }
      if (h.state === "IDLE") h.state = "POSTER";
    });
    return;
  }

  // Promote visible videos to PLAYING within concurrency cap
  const visibles = pickSorted(visibleSet);
  let playing = playingCount();
  for (const h of visibles) {
    if (h.state === "PLAYING") continue;
    if (playing >= MAX_PLAYING) break;
    applySrc(h);
    h.state = "PLAYING";
    if (h.autoplay) {
      h.video.play().catch(() => {
        // autoplay may be blocked; leave loaded
      });
    }
    playing++;
  }

  // Preload near-viewport within concurrency cap, only if network is good
  if (canPreload) {
    const nears = pickSorted(nearSet).filter((h) => !visibleSet.has(h.video));
    let preloading = preloadingCount();
    for (const h of nears) {
      if (h.state === "PRELOAD" || h.state === "PLAYING") continue;
      if (preloading >= MAX_PRELOADING) break;
      applySrc(h);
      h.state = "PRELOAD";
      preloading++;
    }
  }
}

function ensureObservers() {
  if (typeof window === "undefined") return;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLVideoElement;
          if (e.isIntersecting) visibleSet.add(el);
          else visibleSet.delete(el);
        }
        schedule();
      },
      { threshold: 0.25 }
    );
  }
  if (!nearObserver) {
    nearObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLVideoElement;
          if (e.isIntersecting) nearSet.add(el);
          else nearSet.delete(el);
        }
        schedule();
      },
      { rootMargin: "400px" }
    );
  }
}

let netUnsub: (() => void) | null = null;
function ensureNetSubscription() {
  if (netUnsub || typeof window === "undefined") return;
  netUnsub = subscribeNetwork(() => schedule());
}

export interface RegisterOptions {
  src: string;
  priority?: number;
  autoplay?: boolean;
}

export function registerVideo(
  video: HTMLVideoElement,
  opts: RegisterOptions
): () => void {
  ensureObservers();
  ensureNetSubscription();

  const handle: VideoHandle = {
    video,
    src: opts.src,
    priority: opts.priority ?? 0,
    autoplay: opts.autoplay ?? true,
    state: "POSTER",
  };
  registered.set(video, handle);
  sharedObserver?.observe(video);
  nearObserver?.observe(video);

  schedule();

  return () => {
    sharedObserver?.unobserve(video);
    nearObserver?.unobserve(video);
    visibleSet.delete(video);
    nearSet.delete(video);
    releaseSrc(handle);
    registered.delete(video);
    schedule();
  };
}

export function updateVideoSrc(video: HTMLVideoElement, src: string) {
  const h = registered.get(video);
  if (!h) return;
  if (h.src === src) return;
  h.src = src;
  if (h.state === "PLAYING" || h.state === "PRELOAD") {
    applySrc(h);
    if (h.autoplay && h.state === "PLAYING") {
      h.video.play().catch(() => {});
    }
  }
}
