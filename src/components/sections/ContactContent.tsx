"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";
import { useI18n } from "@/i18n/I18nProvider";

const CONTACT_ICONS = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
];

const SOCIALS = [
  { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { name: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

export function ContactContent() {
  const { t } = useI18n();
  const cc = t.contactContent;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <PageTransition>
      <section className="py-24 lg:py-32 bg-white" ref={ref}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {cc.info.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="group bg-mist rounded-2xl p-6 text-center card-lift border border-transparent hover:border-ocean/10"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-ocean-light text-ocean flex items-center justify-center group-hover:bg-ocean group-hover:text-white transition-all duration-500">
                  {CONTACT_ICONS[i]}
                </div>
                <h3 className="mt-4 font-semibold text-navy">{item.title}</h3>
                {item.lines.map((line, j) => (
                  <p key={j} className="text-slate/70 text-sm mt-1">
                    {line}
                  </p>
                ))}
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.form
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-mist rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="w-10 h-[2px] bg-sand mb-5" />
              <h3 className="font-display text-2xl font-bold text-navy mb-6">
                {cc.formTitle}
              </h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    {cc.nameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={cc.namePlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-ocean-muted/30 bg-white text-navy placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    {cc.emailLabel}
                  </label>
                  <input
                    type="email"
                    placeholder={cc.emailPlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-ocean-muted/30 bg-white text-navy placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-all"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-navy mb-2">
                  {cc.phoneLabel}
                </label>
                <input
                  type="tel"
                  placeholder={cc.phonePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-ocean-muted/30 bg-white text-navy placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-all"
                />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-navy mb-2">
                  {cc.subjectLabel}
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-ocean-muted/30 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-all">
                  <option value="">{cc.subjectPlaceholder}</option>
                  <option value="partnership">{cc.subjects.partnership}</option>
                  <option value="purchase">{cc.subjects.purchase}</option>
                  <option value="consulting">{cc.subjects.consulting}</option>
                  <option value="careers">{cc.subjects.careers}</option>
                  <option value="other">{cc.subjects.other}</option>
                </select>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-navy mb-2">
                  {cc.messageLabel}
                </label>
                <textarea
                  rows={5}
                  placeholder={cc.messagePlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-ocean-muted/30 bg-white text-navy placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-all resize-none"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-glow mt-6 w-full">
                <span>{cc.submit}</span>
                <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col gap-6"
            >
              <div className="flex-1 rounded-xl sm:rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[400px] bg-ocean-light relative shadow-xl shadow-ocean/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d97110.61928585407!2d49.78200349726563!3d40.40926100000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2sBaku!5e0!3m2!1sen!2saz!4v1700000000000!5m2!1sen!2saz"
                  className="w-full h-full absolute inset-0"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="United Fishers lokasiya"
                />
              </div>

              <div className="rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0">
                  <Image
                    src="/images/16.jpg"
                    alt="United Fishers"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-ocean/85 backdrop-blur-sm" />
                </div>
                <div className="relative z-10 p-8">
                  <h3 className="font-display text-xl font-bold text-white">
                    {cc.followTitle}
                  </h3>
                  <p className="text-white/70 mt-2 text-sm">
                    {cc.followBody}
                  </p>
                  <div className="flex gap-3 mt-5">
                    {SOCIALS.map((s) => (
                      <a
                        key={s.name}
                        href="#"
                        className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300"
                        aria-label={s.name}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d={s.icon} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
