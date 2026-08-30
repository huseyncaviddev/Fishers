"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { ProductSlug } from "@/data/products";

type PageKey = "about" | "team" | "gallery" | "products" | "contact";

interface PageHeroProps {
  pageKey?: PageKey;
  productSlug?: ProductSlug;
  image?: string;
  /** CSS object-position for the background image's focal point. */
  imagePosition?: string;
  /** Overlay gradient classes; override for brighter photos (e.g. group shots). */
  overlayClassName?: string;
  /** Vertical placement of the title block. "bottom" keeps faces clear above it. */
  contentAlign?: "center" | "bottom";
  /** Tiny base64 LQIP for instant blur paint (no dark void while LCP loads). */
  imageBlurDataURL?: string;
}

const DEFAULT_OVERLAY = "bg-gradient-to-b from-navy/70 via-navy/40 to-navy/80";

export function PageHero({
  pageKey,
  productSlug,
  image,
  imagePosition = "center",
  overlayClassName = DEFAULT_OVERLAY,
  contentAlign = "center",
  imageBlurDataURL,
}: PageHeroProps) {
  const { t } = useI18n();

  let title = "";
  let subtitle = "";
  if (productSlug) {
    const item = t.products.items[productSlug];
    title = item.name;
    subtitle = item.shortDesc;
  } else if (pageKey) {
    title = t.pages[pageKey].title;
    subtitle = t.pages[pageKey].subtitle;
  }

  return (
    <section
      className={`relative h-[45vh] sm:h-[50vh] min-h-[300px] sm:min-h-[360px] flex justify-center overflow-hidden ${
        contentAlign === "bottom" ? "items-end" : "items-center"
      }`}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: imagePosition }}
          sizes="100vw"
          quality={90}
          priority
          fetchPriority="high"
          {...(imageBlurDataURL
            ? { placeholder: "blur" as const, blurDataURL: imageBlurDataURL }
            : {})}
        />
      )}
      <div className={`absolute inset-0 ${overlayClassName}`} />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div
        className={`relative z-10 text-center px-6 ${
          contentAlign === "bottom" ? "pt-20 pb-10 sm:pb-14" : "pt-20"
        }`}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
          className="w-12 h-[1px] bg-sand mx-auto mb-6 origin-center"
        />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white [text-shadow:0_2px_24px_rgba(4,34,44,0.55)]"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-white/70 max-w-2xl mx-auto px-2 font-light [text-shadow:0_1px_16px_rgba(4,34,44,0.5)]"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs tracking-wider"
        >
          <Link href="/" className="hover:text-white transition-colors duration-300">
            {t.common.home}
          </Link>
          <span className="text-white/15">/</span>
          <span className="text-white/60">{title}</span>
        </motion.div>
      </div>
    </section>
  );
}
