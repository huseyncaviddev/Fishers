"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

const NAV_LINKS = [
  { label: "Məhsullar", href: "/products" },
  { label: "Haqqımızda", href: "/about" },
  { label: "Komanda", href: "/team" },
  { label: "Qalereya", href: "/gallery" },
  { label: "Əlaqə", href: "/contact" },
];

const MENU_LINKS_LEFT = [
  { label: "Tərəfdaş Olun", href: "/contact" },
  { label: "Biznes Planınızı Göndərin", href: "/contact" },
  { label: "Karyera", href: "/contact" },
];

const MENU_LINKS_RIGHT = [
  { label: "Məhsullar", href: "/products" },
  { label: "Haqqımızda", href: "/about" },
  { label: "Komanda", href: "/team" },
  { label: "Qalereya", href: "/gallery" },
  { label: "Əlaqə", href: "/contact" },
];

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    let heroHeight = 0;
    const onScroll = () => {
      if (!heroHeight) {
        const hero = document.querySelector("[data-hero-container]");
        if (hero) heroHeight = hero.getBoundingClientRect().height;
      }
      const threshold =
        heroHeight > 0 ? heroHeight - window.innerHeight * 0.5 : 50;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-black/[0.03]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-700 ${
                  scrolled
                    ? "bg-ocean text-white shadow-md shadow-ocean/20"
                    : "bg-white/10 backdrop-blur-sm text-white border border-white/20"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path d="M20.5 8c-1.5-2-4-3-7-3S5 6 3.5 8c0 0 2 4 8.5 4s8.5-4 8.5-4Z" />
                  <path d="M12 12v7" />
                  <path d="M8 16c1.3 1.3 2.7 2 4 2s2.7-.7 4-2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className={`font-display text-xl font-semibold tracking-tight leading-none transition-colors duration-700 ${scrolled ? "text-navy" : "text-white"}`}>
                  Fishers
                </span>
                <span className={`text-[10px] tracking-[0.15em] transition-colors duration-700 ${scrolled ? "text-slate/40" : "text-white/40"}`}>
                  Sustainable Aquaculture
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative px-4 py-2 group"
                  >
                    <span
                      className={`relative z-10 text-[13px] font-medium tracking-wide transition-all duration-300 ${
                        scrolled
                          ? active
                            ? "text-ocean"
                            : "text-navy/60 group-hover:text-ocean"
                          : active
                            ? "text-white"
                            : "text-white/65 group-hover:text-white"
                      }`}
                    >
                      {link.label}
                    </span>
                    {active && mounted && (
                      <motion.div
                        layoutId="navbar-active"
                        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full ${
                          scrolled ? "bg-ocean" : "bg-white"
                        }`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {!active && (
                      <span
                        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                          scrolled ? "bg-ocean/30" : "bg-white/30"
                        }`}
                      />
                    )}
                    <span
                      className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        scrolled ? "bg-ocean/[0.04]" : "bg-white/[0.06]"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <MagneticButton strength={0.15}>
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    scrolled
                      ? "text-navy/50 hover:text-ocean hover:bg-ocean/5"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Axtar"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </MagneticButton>

              <MagneticButton strength={0.15}>
                <button
                  onClick={() => setMenuOpen(true)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 flex flex-col justify-center items-center gap-[5px] rounded-sm transition-colors duration-300 ${
                    scrolled ? "text-navy hover:text-ocean" : "text-white hover:text-white/80"
                  }`}
                  aria-label="Menu"
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

      {/* Full-screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-[60] bg-navy"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 film-grain" />
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ocean/10 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sand/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
            </div>

            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 lg:right-12 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10 rounded-full hover:bg-white/5"
              aria-label="Bağla"
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
                    <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-6">Xidmətlər</span>
                    {MENU_LINKS_LEFT.map((link, i) => (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: EASE }}
                      >
                        <Link href={link.href} onClick={() => setMenuOpen(false)}
                          className="block text-white/70 text-lg sm:text-xl lg:text-2xl font-light hover:text-sand active:text-sand transition-colors duration-300 py-1">
                          {link.label}
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
                    <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-6">Naviqasiya</span>
                    {MENU_LINKS_RIGHT.map((link, i) => {
                      const active = isActive(link.href);
                      return (
                        <motion.div
                          key={link.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: EASE }}
                        >
                          <Link href={link.href} onClick={() => setMenuOpen(false)}
                            className={`block text-lg sm:text-xl lg:text-2xl font-light transition-colors duration-300 py-1 ${
                              active ? "text-sand" : "text-white/70 hover:text-sand active:text-sand"
                            }`}>
                            {link.label}
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
                      <p className="font-medium text-white/80 text-base">Əlaqə</p>
                      <p>+994 12 345 67 89</p>
                      <p>info@fishers.az</p>
                      <p className="pt-2">Bakı şəhəri, Nərimanov rayonu</p>
                      <p>Azərbaycan</p>
                      <div className="flex gap-3 pt-4">
                        {["facebook", "instagram", "linkedin"].map((s) => (
                          <a key={s} href="#" className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-ocean hover:text-white text-white/40 transition-all duration-300" aria-label={s}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              {s === "facebook" && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                              {s === "instagram" && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />}
                              {s === "linkedin" && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />}
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

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[60] bg-navy/95 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="absolute inset-0 film-grain pointer-events-none" />
            <button onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 lg:right-12 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5" aria-label="Bağla">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-full max-w-2xl px-6 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE }}>
                <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase block mb-4">Axtarış</span>
                <div className="relative">
                  <input type="text" placeholder="Akvakultura sənayesi..." autoFocus
                    className="w-full bg-transparent text-white text-2xl lg:text-3xl font-display font-light border-b border-white/15 pb-4 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors" />
                  <svg className="absolute right-0 bottom-5 w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
