"use client";

import { useSyncExternalStore } from "react";
import { getNetworkSnapshot, subscribeNetwork, type NetworkSnapshot } from "./networkManager";

/**
 * One authoritative description of what this device/connection is allowed to do
 * with video. Every media component reads this instead of inventing its own
 * heuristic, so the whole page agrees on a single policy.
 */
export interface MediaPolicy {
  /** Hard page-wide cap on simultaneously PLAYING videos. */
  maxPlaying: number;
  /** Cap on speculatively warmed (buffering, not playing) videos. */
  maxWarm: number;
  /** May a gallery tile start playing purely because it scrolled into view? */
  viewportAutoplay: boolean;
  /** May a gallery tile play on deliberate hover (desktop pointers only)? */
  hoverIntent: boolean;
  /** May the hero warm the immediate-next slide? */
  heroWarmNext: boolean;
  /** Never autoplay anything decorative; posters carry the experience. */
  posterFirst: boolean;
  /** Prefer the lightweight rendition for background video. */
  lightRendition: boolean;
  /** True for touch/coarse-pointer devices. */
  coarsePointer: boolean;
  /** True when the user asked for reduced motion. */
  reducedMotion: boolean;
}

function coarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function reducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface HardwareNavigator extends Navigator {
  deviceMemory?: number;
}

/**
 * True for genuinely weak hardware.
 *
 * Concurrency is affordable because gallery tiles use a small rendition, but
 * "affordable" still assumes a device with some headroom. Profiling a scroll
 * through the gallery at 6x CPU throttle showed the page under real strain —
 * so where the browser tells us the device is low-end, we spend fewer decoders
 * rather than finding out the hard way on the user's phone.
 *
 * Both signals are advisory and absent in Safari, so a missing value is read
 * as "not known to be weak" rather than assumed either way.
 */
function lowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as HardwareNavigator).deviceMemory;
  if (typeof mem === "number" && mem <= 4) return true;
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 4) return true;
  return false;
}

/**
 * Resolves the policy from device class first, network second.
 *
 * Device class is the reliable signal. The Network Information API is only a
 * hint — Safari does not implement it at all, and Chrome routinely reports a
 * pessimistic "3g" on healthy broadband. So UNKNOWN is read as "be careful" on
 * phones and "carry on" on desktops, and network speed is never treated as a
 * proxy for GPU/decoder capability.
 */
export function resolvePolicy(net: NetworkSnapshot): MediaPolicy {
  const coarse = coarsePointer();
  const reduced = reducedMotion();
  const weak = lowEndDevice();
  const saveData = net.saveData;
  const offline = !net.online || net.klass === "OFFLINE";
  const verySlow = net.klass === "VERY_SLOW";
  const slow = net.klass === "SLOW";

  // Poster-only experiences: nothing decorative may autoplay.
  const posterFirst = reduced || offline || verySlow || saveData;

  if (posterFirst) {
    return {
      maxPlaying: reduced || offline ? 0 : 1,
      maxWarm: 0,
      viewportAutoplay: false,
      hoverIntent: false,
      heroWarmNext: false,
      posterFirst: true,
      lightRendition: true,
      coarsePointer: coarse,
      reducedMotion: reduced,
    };
  }

  if (coarse) {
    // Phones/tablets: several tiles may play at once, because gallery tiles now
    // use the 640px `-tile` rendition (~5x cheaper to decode than the master).
    // Three of those together cost less than a single full-size clip did, so
    // the grid looks alive without the stutter that concurrency used to cause.
    // Still no speculative warming — bytes are only spent on what is on screen.
    return {
      maxPlaying: slow || weak ? 1 : 3,
      maxWarm: 0,
      viewportAutoplay: true,
      hoverIntent: false,
      heroWarmNext: false,
      posterFirst: false,
      lightRendition: true,
      coarsePointer: true,
      reducedMotion: false,
    };
  }

  // Desktop: scroll drives playback, a deliberate hover can claim a slot ahead
  // of whatever scroll position picked, and the wider grid can afford more
  // concurrent tiles.
  return {
    maxPlaying: slow || weak ? 2 : 6,
    maxWarm: slow ? 0 : 1,
    viewportAutoplay: true,
    hoverIntent: true,
    heroWarmNext: !slow,
    posterFirst: false,
    lightRendition: slow,
    coarsePointer: false,
    reducedMotion: false,
  };
}

const SSR_POLICY: MediaPolicy = {
  maxPlaying: 1,
  maxWarm: 0,
  viewportAutoplay: false,
  hoverIntent: false,
  heroWarmNext: false,
  posterFirst: false,
  lightRendition: true,
  coarsePointer: false,
  reducedMotion: false,
};

let cached: MediaPolicy | null = null;
let cachedFrom: NetworkSnapshot | null = null;

function getPolicySnapshot(): MediaPolicy {
  if (typeof window === "undefined") return SSR_POLICY;
  const net = getNetworkSnapshot();
  // useSyncExternalStore requires a referentially stable snapshot between
  // changes, so only rebuild when the network snapshot actually changed.
  if (!cached || cachedFrom !== net) {
    cached = resolvePolicy(net);
    cachedFrom = net;
  }
  return cached;
}

function subscribePolicy(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const invalidate = () => {
    cached = null;
    cb();
  };
  const unsubNet = subscribeNetwork(invalidate);
  const mqs: MediaQueryList[] = [];
  if (window.matchMedia) {
    mqs.push(window.matchMedia("(pointer: coarse)"));
    mqs.push(window.matchMedia("(prefers-reduced-motion: reduce)"));
    mqs.forEach((m) => m.addEventListener("change", invalidate));
  }
  return () => {
    unsubNet();
    mqs.forEach((m) => m.removeEventListener("change", invalidate));
  };
}

/** Live media policy for this device + connection. */
export function useMediaPolicy(): MediaPolicy {
  return useSyncExternalStore(subscribePolicy, getPolicySnapshot, () => SSR_POLICY);
}

/** Non-reactive read, for use inside the scheduler and event handlers. */
export function currentPolicy(): MediaPolicy {
  return getPolicySnapshot();
}
