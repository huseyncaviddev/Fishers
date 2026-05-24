"use client";

import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Footer() {
  return (
    <footer className="relative bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <Image
          src="/images/6.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 film-grain pointer-events-none opacity-50" />

      <div className="relative z-10">
        <div className="absolute top-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Premium top CTA strip */}
        <div className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-16 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-white">
                Layihəniz <span className="text-gradient-gold">varmı?</span>
              </h3>
              <p className="text-white/40 text-sm mt-2 font-light">Komandamızla əlaqə saxlayın</p>
            </div>
            <MagneticButton href="/contact" className="btn btn-primary btn-glow">
              <span>Əlaqə Saxlayın</span>
              <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </MagneticButton>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                Fishers
              </h4>
              <ul className="mt-5 space-y-3">
                {[
                  { label: "Haqqımızda", href: "/about" },
                  { label: "Qalereya", href: "/gallery" },
                  { label: "Məhsullar", href: "/products" },
                  { label: "Əlaqə", href: "/contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/40 hover:text-white text-sm transition-colors duration-300 group inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-px bg-sand group-hover:w-3 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                Məlumat
              </h4>
              <ul className="mt-5 space-y-3">
                {["Sertifikatlar", "Davamlılıq", "Tərəfdaşlıq", "Xəbərlər"].map(
                  (label) => (
                    <li key={label}>
                      <a
                        href="#"
                        className="text-white/40 hover:text-white text-sm transition-colors duration-300 group inline-flex items-center gap-1.5"
                      >
                        <span className="w-0 h-px bg-sand group-hover:w-3 transition-all duration-300" />
                        {label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                Ünvanımız
              </h4>
              <div className="mt-5 text-sm text-white/40 space-y-1 font-light">
                <p>Nərimanov rayonu</p>
                <p>Bakı şəhəri</p>
                <p>Azərbaycan</p>
              </div>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                Əlaqə
              </h4>
              <div className="mt-5 text-sm text-white/40 space-y-1 font-light">
                <p>+994 12 345 67 89</p>
                <p>info@fishers.az</p>
                <p className="pt-2 text-white/20">Tərəfdaşlar üçün:</p>
                <p>partners@fishers.az</p>
              </div>
            </div>

            <div className="flex col-span-2 sm:col-span-1 lg:justify-end items-start">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-ocean transition-all duration-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-5 h-5 text-white"
                  >
                    <path d="M20.5 8c-1.5-2-4-3-7-3S5 6 3.5 8c0 0 2 4 8.5 4s8.5-4 8.5-4Z" />
                    <path d="M12 12v7" />
                    <path d="M8 16c1.3 1.3 2.7 2 4 2s2.7-.7 4-2" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-lg font-semibold text-white leading-none">
                    Fishers
                  </span>
                  <span className="text-[9px] text-white/25 tracking-[0.15em] mt-0.5">
                    Sustainable Aquaculture
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/20 text-xs font-light" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} Fishers. Bütün hüquqlar qorunur.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 hover:bg-ocean hover:text-white hover:scale-110 transition-all duration-500"
                  aria-label={social}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    {social === "facebook" && (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    )}
                    {social === "instagram" && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    )}
                    {social === "linkedin" && (
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
