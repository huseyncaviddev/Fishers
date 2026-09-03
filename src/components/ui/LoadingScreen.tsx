"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Absolute cap on how long the loading veil stays up. If `window.load` (which
// waits for every image, video and stylesheet) hasn't fired by then, we
// dismiss anyway so a slow media asset never holds back the interactive shell.
const MAX_WAIT_MS = 700;
// Minimum visible hold so the veil never *flashes* on fast networks — it
// either shows for at least this long, or (below) not at all.
const MIN_HOLD_MS = 250;
// If the DOM is already parsed *at hydration time* (fast desktop), skip the
// screen almost immediately — nothing left to wait for.
const SKIP_IF_PARSED_MS = 80;

// Module-level ready flag: once flipped it stays flipped, so remounts (e.g.
// route transitions) never re-show the veil, and `getSnapshot` returns a
// stable value that React can trust across subscribe cycles.
let dismissed = false;
const notifiers = new Set<() => void>();

function markDismissed() {
  if (dismissed) return;
  dismissed = true;
  notifiers.forEach((n) => n());
}

function subscribeReady(cb: () => void): () => void {
  notifiers.add(cb);
  if (typeof window === "undefined") return () => notifiers.delete(cb);
  if (dismissed) {
    // Already ready — schedule the notification so React can commit the change.
    queueMicrotask(cb);
    return () => notifiers.delete(cb);
  }

  const start = performance.now();
  const dismiss = () => {
    const elapsed = performance.now() - start;
    if (elapsed >= MIN_HOLD_MS) markDismissed();
    else window.setTimeout(markDismissed, MIN_HOLD_MS - elapsed);
  };

  // DOM already parsed at hydration → a full veil would just be a flash.
  // "interactive" is enough; "complete" only fires after every image/video.
  const parsed = document.readyState === "interactive" || document.readyState === "complete";

  const onLoad = () => dismiss();
  let dcl: (() => void) | null = null;

  if (parsed) {
    window.setTimeout(dismiss, SKIP_IF_PARSED_MS);
  } else {
    dcl = () => window.setTimeout(dismiss, SKIP_IF_PARSED_MS);
    document.addEventListener("DOMContentLoaded", dcl, { once: true });
    window.addEventListener("load", onLoad, { once: true });
  }

  // Absolute cap so a slow image/video never keeps the veil up.
  const cap = window.setTimeout(markDismissed, MAX_WAIT_MS);

  return () => {
    notifiers.delete(cb);
    if (dcl) document.removeEventListener("DOMContentLoaded", dcl);
    window.removeEventListener("load", onLoad);
    window.clearTimeout(cap);
  };
}

function getReady(): boolean {
  return dismissed;
}

function getSSRReady(): boolean {
  return false;
}

export function LoadingScreen() {
  const ready = useSyncExternalStore(subscribeReady, getReady, getSSRReady);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] bg-navy flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-16 h-16 rounded-full bg-ocean/20 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-ocean">
                <path d="M20.5 8c-1.5-2-4-3-7-3S5 6 3.5 8c0 0 2 4 8.5 4s8.5-4 8.5-4Z" />
                <path d="M12 12v7" />
                <path d="M8 16c1.3 1.3 2.7 2 4 2s2.7-.7 4-2" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-[1px] bg-gradient-to-r from-transparent via-ocean to-transparent mt-6"
            />

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-white/30 text-[10px] tracking-[0.4em] uppercase mt-4 font-light"
            >
              United Fishers
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
