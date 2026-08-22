"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_WAIT_MS = 1200;

function subscribeReady(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLoad = () => cb();
  window.addEventListener("load", onLoad, { once: true });
  const t = window.setTimeout(cb, MAX_WAIT_MS);
  return () => {
    window.removeEventListener("load", onLoad);
    window.clearTimeout(t);
  };
}

function getReady(): boolean {
  if (typeof document === "undefined") return false;
  return document.readyState === "complete";
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
