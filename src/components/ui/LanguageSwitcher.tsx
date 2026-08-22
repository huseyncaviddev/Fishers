"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, type Locale } from "@/i18n/config";

const EASE = [0.25, 0.1, 0.25, 1] as const;

interface LanguageSwitcherProps {
  scrolled: boolean;
}

export function LanguageSwitcher({ scrolled }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        className={`flex items-center gap-1.5 h-10 sm:h-9 px-2.5 rounded-full text-[13px] font-semibold tracking-[0.04em] transition-all duration-300 gold-focus ${
          scrolled
            ? "text-[var(--color-deep-900)] hover:bg-[rgba(22,165,184,0.08)]"
            : "text-white hover:bg-white/10"
        }`}
      >
        <svg
          className="w-[17px] h-[17px] opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
        <span>{LOCALE_SHORT[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
            role="listbox"
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(6,42,51,0.16)] border border-black/[0.04] overflow-hidden p-1.5 z-50"
          >
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <li key={code} role="option" aria-selected={active}>
                  <button
                    onClick={() => choose(code)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 ${
                      active
                        ? "bg-[rgba(22,165,184,0.10)] text-[var(--color-deep-900)] font-semibold"
                        : "text-[var(--color-ink-500)] hover:bg-[rgba(22,165,184,0.06)] hover:text-[var(--color-deep-900)]"
                    }`}
                  >
                    <span>{LOCALE_NAMES[code]}</span>
                    <span className="text-[11px] tracking-widest opacity-60">
                      {LOCALE_SHORT[code]}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
