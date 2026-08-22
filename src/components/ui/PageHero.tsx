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
}

export function PageHero({ pageKey, productSlug, image }: PageHeroProps) {
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
    <section className="relative h-[45vh] sm:h-[50vh] min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy/80" />
      <div className="absolute inset-0 film-grain pointer-events-none" />

      <div className="relative z-10 text-center px-6 pt-20">
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
          className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto px-2 font-light"
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
