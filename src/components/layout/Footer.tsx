"use client";

import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useI18n } from "@/i18n/I18nProvider";
import { SOCIAL_ICON_PATHS, SOCIAL_KEYS } from "@/lib/socialIcons";

const COMPANY_LINKS = [
  { key: "about", href: "/about" },
  { key: "gallery", href: "/gallery" },
  { key: "products", href: "/products" },
  { key: "contact", href: "/contact" },
] as const;

export function Footer() {
  const { t } = useI18n();
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

        <div className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-16 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-white">
                {t.footer.ctaTitleLead} <span className="text-gradient-gold">{t.footer.ctaTitleAccent}</span>
              </h3>
              <p className="text-white/40 text-sm mt-2 font-light">{t.footer.ctaBody}</p>
            </div>
            <MagneticButton href="/contact" className="btn btn-primary btn-glow">
              <span>{t.footer.ctaButton}</span>
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
                {t.footer.colCompany}
              </h4>
              <ul className="mt-5 space-y-3">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-white/40 hover:text-white text-sm transition-colors duration-300 group inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-px bg-sand group-hover:w-3 transition-all duration-300" />
                      {t.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                {t.footer.colInfo}
              </h4>
              <ul className="mt-5 space-y-3">
                {t.footer.infoItems.map(
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
                {t.footer.colAddress}
              </h4>
              <div className="mt-5 text-sm text-white/40 space-y-1 font-light">
                {t.footer.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold tracking-wide text-sand">
                {t.footer.colContact}
              </h4>
              <div className="mt-5 text-sm text-white/40 space-y-1 font-light">
                <p>+994 12 345 67 89</p>
                <p>info@fishers.az</p>
                <p className="pt-2 text-white/20">{t.footer.partnersLabel}</p>
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
                    United Fishers
                  </span>
                  <span className="text-[9px] text-white/25 tracking-[0.15em] mt-0.5">
                    {t.brand.tagline}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/20 text-xs font-light" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} United Fishers. {t.footer.rights}
            </p>
            <div className="flex gap-3">
              {SOCIAL_KEYS.map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 hover:bg-ocean hover:text-white hover:scale-110 transition-all duration-500"
                  aria-label={social}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={SOCIAL_ICON_PATHS[social]} />
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
