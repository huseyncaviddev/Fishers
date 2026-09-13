"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { SOCIAL_ICON_PATHS, SOCIAL_LABELS, configuredSocials } from "@/lib/socialIcons";
import { searchSite } from "@/lib/siteSearch";
import { useOverlay } from "@/lib/useOverlay";

const NAV_LINKS = [
  { key: "about", href: "/about" },
  { key: "team", href: "/team" },
  { key: "gallery", href: "/gallery" },
  { key: "contact", href: "/contact" },
] as const;

const MENU_LINKS_LEFT = [
  { key: "partner", href: "/contact" },
  { key: "businessPlan", href: "/contact" },
  { key: "careers", href: "/contact" },
] as const;

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchSite(query, t), [query, t]);

  // Both overlays are modal: Escape closes them, Tab stays inside, and focus
  // returns to the control that opened them. Previously neither responded to
  // Escape and focus was left on the (now covered) trigger button.
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useOverlay(menuOpen, closeMenu, menuPanelRef, menuCloseRef);
  useOverlay(searchOpen, closeSearch, searchPanelRef, searchInputRef);

  useEffect(() => {
    // Mount flag for hydration-safe animation of the active-link indicator.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // Every page carries a hero (the full home Hero, or the shorter
    // PageHero banner) — both tag their root with data-hero-container so
    // the navbar can measure it and fade from transparent to solid at
    // roughly its midpoint, regardless of how tall that hero is.
    let heroHeight = 0;
    const onScroll = () => {
      if (!heroHeight) {
        const hero = document.querySelector("[data-hero-container]");
        if (hero) heroHeight = hero.getBoundingClientRect().height;
      }
      const threshold = heroHeight > 0 ? heroHeight * 0.5 : 50;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    if (href === "/products") return pathname.startsWith("/products");
    return pathname === href;
  };

  return (
    <>
      <motion.header
        // Navigation is available immediately. This used to slide in after a
        // 1.8s delay plus a 0.8s animation, so for the first ~2.6s the primary
        // nav — including the only way to open the mobile menu — was off
        // screen. A short fade is enough of an entrance; it never gates use.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "nav-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-black/[0.03]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            {/* `min-w-0` (not `shrink-0`): the wordmark must yield space before
                the right-hand controls do. With shrink-0 here, at 320px the
                brand claimed 221px and pushed the language switcher and the
                menu button clean off the screen — leaving no way to open the
                menu at all. */}
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 sm:gap-3 group gold-focus rounded-lg"
            >
              <div
                className={`relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ${
                  scrolled
                    ? "bg-[var(--color-deep-800)] text-[var(--color-gold-300)] shadow-md shadow-black/10"
                    : "bg-white/[0.06] backdrop-blur-sm text-[var(--color-gold-300)] border border-white/15"
                }`}
              >
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(120% 100% at 30% 20%, rgba(90,224,236,0.4), transparent 60%)",
                  }}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path d="M20.5 8c-1.5-2-4-3-7-3S5 6 3.5 8c0 0 2 4 8.5 4s8.5-4 8.5-4Z" />
                  <path d="M12 12v7" />
                  <path d="M8 16c1.3 1.3 2.7 2 4 2s2.7-.7 4-2" />
                </svg>
              </div>
              <div className="flex min-w-0 flex-col leading-none">
                <span
                  className={`font-display text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em] leading-none truncate transition-colors duration-500 ${
                    scrolled ? "text-[var(--color-deep-900)]" : "text-white"
                  }`}
                >
                  United&nbsp;Fishers
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-px w-14 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ background: "var(--gold-hairline)" }}
                />
                <span
                  className={`mt-1 hidden min-[360px]:block text-[10px] tracking-[0.28em] uppercase truncate transition-colors duration-500 ${
                    scrolled ? "text-[var(--color-ink-500)]" : "text-white/50"
                  }`}
                >
                  {t.brand.tagline}
                </span>
                {/* Visible text stays the accessible name (WCAG 2.5.3);
                    this only adds the link's purpose for screen readers. */}
                <span className="sr-only">— {t.common.home}</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Əsas naviqasiya">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="relative px-4 py-2 group gold-focus rounded-lg"
                  >
                    <span
                      className={`relative z-10 text-[13px] font-medium tracking-[0.02em] transition-colors duration-300 ${
                        scrolled
                          ? active
                            ? "text-[var(--color-deep-900)]"
                            : "text-[var(--color-ink-500)] group-hover:text-[var(--color-deep-900)]"
                          : active
                            ? "text-white"
                            : "text-white/65 group-hover:text-white"
                      }`}
                    >
                      {t.nav[link.key]}
                    </span>
                    {active && mounted && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                        style={{ background: "var(--gold-metallic)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {!active && (
                      <span
                        className="absolute bottom-0 left-4 right-4 h-[1.5px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-70"
                        style={{ background: "var(--gold-hairline)" }}
                      />
                    )}
                    <span
                      className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        scrolled ? "bg-[rgba(22,165,184,0.06)]" : "bg-white/[0.05]"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <LanguageSwitcher scrolled={scrolled} />
              <MagneticButton strength={0.15}>
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-expanded={searchOpen}
                  aria-controls="site-search-panel"
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 gold-focus ${
                    scrolled
                      ? "text-[var(--color-ink-500)] hover:text-[var(--color-gold-600)] hover:bg-[rgba(22,165,184,0.08)]"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={t.nav.search}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </MagneticButton>

              <MagneticButton strength={0.15}>
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-expanded={menuOpen}
                  aria-controls="site-menu-panel"
                  className={`w-10 h-10 sm:w-9 sm:h-9 flex flex-col justify-center items-center gap-[5px] rounded-sm transition-colors duration-300 gold-focus ${
                    scrolled
                      ? "text-[var(--color-deep-900)] hover:text-[var(--color-gold-600)]"
                      : "text-white hover:text-white/80"
                  }`}
                  aria-label={t.nav.menu}
                >
                  <span className="block w-[22px] h-[1.5px] bg-current transition-all duration-300" />
                  <span className="block w-[22px] h-[1.5px] bg-current transition-all duration-300" />
                  <span className="block w-[14px] h-[1.5px] bg-current self-end transition-all duration-300" />
                </button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-[60] bg-navy"
            id="site-menu-panel"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 film-grain" />
              <div className="deco-blob absolute top-0 right-0 w-[600px] h-[600px] bg-ocean/10 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
              <div className="deco-blob absolute bottom-0 left-0 w-[400px] h-[400px] bg-sand/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
            </div>

            <button
              ref={menuCloseRef}
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 lg:right-12 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10 rounded-full hover:bg-white/5"
              aria-label={t.nav.close}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="h-full overflow-y-auto flex items-center py-20">
              <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-12">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
                    className="space-y-5"
                  >
                    <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-6">{t.nav.servicesGroup}</span>
                    {MENU_LINKS_LEFT.map((link, i) => (
                      <motion.div
                        key={link.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: EASE }}
                      >
                        <Link href={link.href} onClick={() => setMenuOpen(false)}
                          className="block text-white/70 text-lg sm:text-xl lg:text-2xl font-light hover:text-sand active:text-sand transition-colors duration-300 py-1">
                          {t.nav[link.key]}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="hidden lg:flex justify-center">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                      className="w-px bg-white/10 h-full origin-top"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
                    className="space-y-5"
                  >
                    <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-6">{t.nav.navigationGroup}</span>
                    {NAV_LINKS.map((link, i) => {
                      const active = isActive(link.href);
                      return (
                        <motion.div
                          key={link.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: EASE }}
                        >
                          <Link href={link.href} onClick={() => setMenuOpen(false)}
                            className={`block text-lg sm:text-xl lg:text-2xl font-light transition-colors duration-300 py-1 ${
                              active ? "text-sand" : "text-white/70 hover:text-sand active:text-sand"
                            }`}>
                            {t.nav[link.key]}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
                  className="mt-10 lg:mt-20 pt-10 border-t border-white/[0.06]"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div />
                    <div />
                    <div className="text-white/50 text-sm space-y-2">
                      <p className="font-medium text-white/80 text-base">{t.nav.contactHeading}</p>
                      <p><a href="tel:+994519115511" className="hover:text-white transition-colors">+994 51 911 55 11</a></p>
                      <p className="break-words"><a href="mailto:azerbaijanaquaculture@gmail.com" className="hover:text-white transition-colors">azerbaijanaquaculture@gmail.com</a></p>
                      <p className="pt-2">{t.contactPreview.info[0].text}</p>
                      <p>{t.footer.addressLines[2]}</p>
                      <div className="flex gap-3 pt-4">
                        {configuredSocials().map((s) => (
                          <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-ocean hover:text-white text-white/40 transition-all duration-300" aria-label={SOCIAL_LABELS[s.key]}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d={SOCIAL_ICON_PATHS[s.key]} />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[60] bg-navy/95 backdrop-blur-xl flex items-center justify-center"
            id="site-search-panel"
            ref={searchPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.searchLabel}
          >
            <div className="absolute inset-0 film-grain pointer-events-none" />
            <button onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 lg:right-12 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5" aria-label={t.nav.close}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-full max-w-2xl px-6 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE }}>
                <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-4">{t.nav.searchLabel}</span>
                <div className="relative">
                  <label htmlFor="site-search" className="sr-only">{t.nav.searchLabel}</label>
                  <input
                    id="site-search"
                    ref={searchInputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.nav.searchPlaceholder}
                    autoComplete="off"
                    className="w-full bg-transparent text-white text-2xl lg:text-3xl font-display font-light border-b border-white/15 pb-4 pr-10 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors" />
                  <svg className="absolute right-0 bottom-5 w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Results are rendered only once the query is long enough to
                    mean something, so an empty box never shows an empty list. */}
                {query.trim().length >= 2 && (
                  <div className="mt-6 max-h-[50vh] overflow-y-auto">
                    {results.length === 0 ? (
                      <p className="text-white/40 text-sm font-light">{t.nav.searchEmpty}</p>
                    ) : (
                      <ul className="space-y-1" data-search-results>
                        {results.map((r) => (
                          <li key={r.href}>
                            <Link
                              href={r.href}
                              onClick={() => { setSearchOpen(false); setQuery(""); }}
                              className="block rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors group"
                            >
                              <span className="block text-[10px] tracking-[0.25em] uppercase text-white/25">
                                {r.group}
                              </span>
                              <span className="block text-white text-base font-medium group-hover:text-sand transition-colors">
                                {r.title}
                              </span>
                              <span className="block text-white/40 text-sm font-light line-clamp-1">
                                {r.detail}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
