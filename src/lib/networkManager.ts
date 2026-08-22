"use client";

import { useSyncExternalStore } from "react";

export type NetworkClass =
  | "ULTRA_FAST"
  | "FAST"
  | "NORMAL"
  | "SLOW"
  | "VERY_SLOW"
  | "OFFLINE"
  | "UNKNOWN";

export interface NetworkSnapshot {
  klass: NetworkClass;
  saveData: boolean;
  online: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface NetInfoLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetInfoLike;
  mozConnection?: NetInfoLike;
  webkitConnection?: NetInfoLike;
}

const listeners = new Set<(s: NetworkSnapshot) => void>();
let current: NetworkSnapshot = {
  klass: "UNKNOWN",
  saveData: false,
  online: true,
  effectiveType: null,
  downlink: null,
  rtt: null,
};

function getConnection(): NetInfoLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  const n = navigator as NavigatorWithConnection;
  return n.connection ?? n.mozConnection ?? n.webkitConnection;
}

function classify(
  online: boolean,
  eff: string | null,
  downlink: number | null,
  rtt: number | null,
  saveData: boolean
): NetworkClass {
  if (!online) return "OFFLINE";
  if (saveData) return "VERY_SLOW";
  if (eff === "slow-2g") return "VERY_SLOW";
  if (eff === "2g") return "SLOW";
  if (eff === "3g") return "NORMAL";
  if (downlink != null) {
    if (downlink < 0.7) return "VERY_SLOW";
    if (downlink < 1.5) return "SLOW";
    if (downlink < 5) return "NORMAL";
    if (downlink < 12) return "FAST";
    return "ULTRA_FAST";
  }
  if (eff === "4g") {
    if (rtt != null && rtt > 400) return "SLOW";
    return "FAST";
  }
  return "UNKNOWN";
}

function snapshot(): NetworkSnapshot {
  if (typeof navigator === "undefined") return current;
  const conn = getConnection();
  const online = typeof navigator.onLine === "boolean" ? navigator.onLine : true;
  const eff = conn?.effectiveType ?? null;
  const dl = conn?.downlink ?? null;
  const rtt = conn?.rtt ?? null;
  const sd = conn?.saveData ?? false;
  return {
    klass: classify(online, eff, dl, rtt, sd),
    saveData: sd,
    online,
    effectiveType: eff,
    downlink: dl,
    rtt,
  };
}

function emit() {
  current = snapshot();
  listeners.forEach((cb) => {
    try {
      cb(current);
    } catch {
      // listener errors are non-fatal
    }
  });
}

let installed = false;
function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  current = snapshot();

  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);

  const conn = getConnection();
  conn?.addEventListener?.("change", emit);
}

export function getNetworkSnapshot(): NetworkSnapshot {
  if (!installed) install();
  return current;
}

export function subscribeNetwork(cb: (s: NetworkSnapshot) => void): () => void {
  if (!installed) install();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const SSR_SNAPSHOT: NetworkSnapshot = {
  klass: "UNKNOWN",
  saveData: false,
  online: true,
  effectiveType: null,
  downlink: null,
  rtt: null,
};

export function useNetwork(): NetworkSnapshot {
  return useSyncExternalStore(
    (cb) => subscribeNetwork(cb),
    getNetworkSnapshot,
    () => SSR_SNAPSHOT
  );
}

export function isLowBandwidth(s: NetworkSnapshot): boolean {
  return (
    s.klass === "SLOW" ||
    s.klass === "VERY_SLOW" ||
    s.klass === "OFFLINE" ||
    s.saveData
  );
}

export function shouldPreloadMedia(s: NetworkSnapshot): boolean {
  if (!s.online) return false;
  if (s.saveData) return false;
  return s.klass === "FAST" || s.klass === "ULTRA_FAST" || s.klass === "UNKNOWN";
}
