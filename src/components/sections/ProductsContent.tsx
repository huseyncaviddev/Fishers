"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/products";
import { PageTransition } from "@/components/ui/PageTransition";

export function ProductsContent() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [activeCategory, setActiveCategory] = useState<string>("Hamısı");

  const filtered =
    activeCategory === "Hamısı"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <PageTransition>
      <section className="py-20 lg:py-28 bg-white" ref={ref}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-14"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-ocean text-white shadow-md shadow-ocean/20"
                    : "bg-mist text-slate hover:bg-ocean-light hover:text-ocean"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-mist hover:shadow-2xl hover:shadow-ocean/10 transition-all duration-500 border-glow"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/15 backdrop-blur-md text-white text-[11px] font-medium rounded-full border border-white/20">
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-white/70 text-xs font-medium tracking-widest uppercase">
                          {product.type}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <h3 className="font-display text-lg sm:text-xl font-semibold text-navy group-hover:text-ocean transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-slate/60 text-sm leading-relaxed line-clamp-2">
                        {product.shortDesc}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {product.features.slice(0, 3).map((feat, j) => (
                          <span
                            key={j}
                            className="px-2.5 py-0.5 bg-ocean/6 text-ocean/80 text-[11px] rounded-full font-medium"
                          >
                            {feat.length > 25
                              ? feat.slice(0, 25) + "…"
                              : feat}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-ocean font-medium text-sm group-hover:gap-3 transition-all duration-300">
                        <span>Ətraflı</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
