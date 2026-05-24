"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Product } from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { PageTransition } from "@/components/ui/PageTransition";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const infoRef = useRef(null);
  const infoInView = useInView(infoRef, { once: true, margin: "-50px" });
  const specsRef = useRef(null);
  const specsInView = useInView(specsRef, { once: true, margin: "-50px" });
  const relatedRef = useRef(null);
  const relatedInView = useInView(relatedRef, { once: true, margin: "-80px" });

  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [15, -15]);

  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category === product.category
  ).slice(0, 3);

  const allRelated =
    related.length < 2
      ? [
          ...related,
          ...PRODUCTS.filter(
            (p) =>
              p.slug !== product.slug &&
              !related.find((r) => r.slug === p.slug)
          ).slice(0, 3 - related.length),
        ]
      : related;

  return (
    <PageTransition>
      {/* Main Product Section */}
      <section className="py-16 lg:py-24 bg-white" ref={infoRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={infoInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-slate/50 mb-10"
          >
            <Link href="/" className="hover:text-ocean transition-colors">Ana Səhifə</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-ocean transition-colors">Məhsullar</Link>
            <span>/</span>
            <span className="text-navy/70">{product.name}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left — Image */}
            <motion.div
              ref={imgRef}
              initial={{ opacity: 0, x: -30 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative group border-glow">
                <motion.div style={{ y: imgY }} className="absolute inset-[-8%] w-[116%] h-[116%]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="mt-6 flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-ocean">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate/50 uppercase tracking-wider">Təchizatçı</div>
                  <div className="text-navy font-medium text-sm">{product.supplier}</div>
                </div>
              </div>
            </motion.div>

            {/* Right — Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-ocean/10 text-ocean text-xs font-medium rounded-full">
                  {product.category}
                </span>
                <span className="text-slate/40 text-xs">&bull;</span>
                <span className="text-slate/50 text-xs">{product.type}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
                {product.name}
              </h1>

              <p className="mt-5 text-slate/70 text-lg leading-relaxed">
                {product.shortDesc}
              </p>

              <div className="mt-8">
                <h3 className="text-navy font-semibold text-sm uppercase tracking-wider mb-4">
                  Əsas Xüsusiyyətlər
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={infoInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.3 + 0.05 * i }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-ocean/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate/70 text-sm leading-snug">{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-navy font-semibold text-sm uppercase tracking-wider mb-4">
                  İstifadə Sahələri
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.uses.map((use, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-mist text-slate/70 text-xs rounded-full font-medium border border-slate/8">
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link href="/contact" className="btn btn-primary btn-glow">
                  <span>Sifariş Verin</span>
                  <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Əlaqə Saxlayın
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specs & Description */}
      <section className="py-16 lg:py-24 bg-mist" ref={specsRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={specsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="w-10 h-[2px] bg-sand mb-6" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-8">
                Texniki <span className="text-gradient-ocean">Spesifikasiya</span>
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden depth-md">
                {product.specs.map((spec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={specsInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className={`flex items-center justify-between px-6 py-4 ${
                      i < product.specs.length - 1 ? "border-b border-slate/8" : ""
                    }`}
                  >
                    <span className="text-slate/60 text-sm font-medium">{spec.label}</span>
                    <span className="text-navy font-medium text-sm text-right">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={specsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="w-10 h-[2px] bg-ocean mb-6" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-8">
                Ətraflı <span className="text-gradient-ocean">Məlumat</span>
              </h2>
              <div className="prose prose-slate max-w-none">
                {product.fullDesc.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-slate/70 text-base leading-relaxed mb-5 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white rounded-2xl depth-sm">
                <div className="text-xs text-slate/50 uppercase tracking-wider mb-3 font-medium">Sertifikasiya</div>
                <div className="flex flex-wrap gap-2">
                  {product.specs
                    .filter((s) => s.label.toLowerCase().includes("sertifika") || s.label.toLowerCase().includes("certification"))
                    .map((s, i) =>
                      s.value.split(",").map((cert, j) => (
                        <span key={`${i}-${j}`} className="px-3 py-1.5 bg-ocean/8 text-ocean text-xs font-semibold rounded-lg">
                          {cert.trim()}
                        </span>
                      ))
                    )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {allRelated.length > 0 && (
        <section className="py-16 lg:py-24 bg-white" ref={relatedRef}>
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={relatedInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
                Digər <span className="text-gradient-ocean">Məhsullar</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRelated.map((item, i) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 25 }}
                  animate={relatedInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-mist hover:shadow-xl transition-all duration-500 border-glow"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-white text-[10px] font-medium rounded-full border border-white/20">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors duration-300">
                        {item.name}
                      </h3>
                      <p className="mt-1.5 text-slate/60 text-sm line-clamp-2">
                        {item.shortDesc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageTransition>
  );
}
