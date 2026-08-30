"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";
import { useI18n } from "@/i18n/I18nProvider";
import { SOCIAL_ICON_PATHS, SOCIAL_KEYS, type SocialKey } from "@/lib/socialIcons";

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

const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

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
                  src="https://maps.google.com/maps?q=Neftchala%2C%20Azerbaijan&t=&z=11&ie=UTF8&iwloc=&output=embed"
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
                    {SOCIAL_KEYS.map((s) => (
                      <a
                        key={s}
                        href="#"
                        className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300"
                        aria-label={SOCIAL_LABELS[s]}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d={SOCIAL_ICON_PATHS[s]} />
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
