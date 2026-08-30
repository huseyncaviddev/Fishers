"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";

const CONTACT_ICONS = [
  "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
];

export function ContactPreview() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 lg:py-36 bg-white overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="w-10 h-[2px] bg-ocean mb-6 origin-left"
            />
            <span className="text-ocean font-medium text-xs tracking-[0.2em] uppercase">
              {t.contactPreview.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-[1.1]">
              {t.contactPreview.titleLead}{" "}
              <span className="text-gradient-ocean">{t.contactPreview.titleAccent}</span>
              {t.contactPreview.titleTail ? ` ${t.contactPreview.titleTail}` : ""}
            </h2>
            <p className="mt-6 text-slate/60 text-lg leading-relaxed font-light">
              {t.contactPreview.body}
            </p>

            <div className="mt-10 space-y-5">
              {t.contactPreview.info.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="group flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-ocean/[0.03] transition-colors duration-500"
                >
                  <div className="w-11 h-11 rounded-xl bg-ocean/10 text-ocean flex items-center justify-center shrink-0 group-hover:bg-ocean group-hover:text-white transition-all duration-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-5 h-5"
                    >
                      <path d={CONTACT_ICONS[i]} />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate/40 tracking-wider uppercase block">
                      {item.label}
                    </span>
                    <span className="text-navy/80 font-medium text-sm">
                      {item.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                href="/contact"
                className="mt-10 group relative inline-flex items-center gap-2 px-8 py-4 bg-ocean text-white font-medium rounded-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-ocean/30"
              >
                <span className="relative z-10">{t.contactPreview.cta}</span>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden h-[350px] sm:h-[450px] shadow-2xl shadow-ocean/10">
              <iframe
                src="https://maps.google.com/maps?q=Neftchala%20Rayonu%2C%20Azerbaijan&t=&z=11&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="United Fishers lokasiya"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute -bottom-6 -left-3 sm:-bottom-8 sm:-left-6 glass-ocean rounded-xl p-4 sm:p-5 shadow-xl max-w-[220px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-ocean/30">
                  <Image
                    src="/images/16.jpg"
                    alt="United Fishers"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy">{t.contactPreview.hqName}</div>
                  <div className="text-[11px] text-ocean">{t.contactPreview.hqLocation}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
