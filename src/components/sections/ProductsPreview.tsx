"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PRODUCTS } from "@/data/products";

const PRODUCT_IMAGES = [
  "/images/10.jpg",
  "/images/3.jpg",
  "/images/14.jpg",
  "/images/9.jpg",
];

const PREVIEW_ITEMS = PRODUCTS.slice(0, 4);

export function ProductsPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-36 bg-white" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 lg:mb-16"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="w-12 h-[2px] bg-ocean mx-auto mb-6 origin-center"
          />
          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-light text-navy">
            Həllərimizə{" "}
            <span className="text-ocean font-semibold italic">investisiya</span>{" "}
            edin
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {PREVIEW_ITEMS.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 * i }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="group relative block aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border-glow"
              >
                {/* Product image background */}
                <Image
                  src={PRODUCT_IMAGES[i]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent group-hover:from-navy/90 transition-all duration-700" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="mb-2 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-sand text-[10px] tracking-[0.15em] uppercase font-light">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-xl font-semibold text-white leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-600 font-light">
                    {product.shortDesc}
                  </p>
                </div>

                {/* Arrow icon */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mission statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 sm:mt-28 text-center max-w-4xl mx-auto"
        >
          <div className="w-8 h-[1px] bg-ocean/30 mx-auto mb-8" />
          <p className="text-lg sm:text-xl lg:text-3xl font-display text-navy/70 leading-relaxed font-light px-2">
            <span className="font-semibold text-navy">Missiyamız</span>{" "}
            akvakultura sənayesini{" "}
            <span className="text-ocean font-semibold italic">
              sağlam, davamlı, əlçatan
            </span>{" "}
            istehsala doğru irəlilətmək və qlobal ərzaq təhlükəsizliyinə töhfə
            verməkdir.
          </p>

          <Link
            href="/products"
            className="mt-10 group relative inline-flex items-center gap-2 px-9 py-4 bg-ocean text-white font-medium rounded-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-ocean/30"
          >
            <span className="relative z-10">Bütün Məhsullara Bax</span>
            <svg
              className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-dark to-ocean-deeper opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
