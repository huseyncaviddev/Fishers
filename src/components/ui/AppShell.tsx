"use client";

import { useEffect } from "react";
import { useNetwork, isLowBandwidth } from "@/lib/networkManager";

export function AppShell() {
  const net = useNetwork();

  // Register service worker (production only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration errors are non-fatal
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  // Toggle body[data-lowbw] so CSS can drop expensive effects.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.lowbw = isLowBandwidth(net) ? "1" : "0";
  }, [net]);

  if (net.online) return null;

  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
    >
      Oflayn rejim — məzmun keşdən göstərilir
    </div>
  );
}
