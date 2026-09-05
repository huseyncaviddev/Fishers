"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";
import { useI18n } from "@/i18n/I18nProvider";

// Photos are locale-independent, so they stay outside i18n and line up
// positionally with the (translated) t.teamContent.members array.
const MEMBER_PHOTOS = [
  "/images/team/niyazi-heybetov.jpg",
  "/images/team/ali-hasanov.jpg",
  "/images/team/leyla-mammadova.jpg",
  "/images/team/nigar-aliyeva.jpg",
] as const;

// Captions come from i18n (t.teamContent.cultureTiles) so they translate.
const CULTURE_TILES = [
  {
    src: "/images/culture/team-gathering.jpg",
    alt: "United Fishers komandası birlikdə",
    area: "tile-a",
  },
  {
    src: "/images/culture/conference.jpg",
    alt: "Peşəkar konfrans və müzakirələr",
    area: "tile-b",
  },
  {
    src: "/images/culture/laboratory.jpg",
    alt: "Laboratoriya və keyfiyyət nəzarəti",
    area: "tile-c",
  },
  {
    src: "/images/culture/fieldwork.jpg",
    alt: "Sahədə iş və istehsal",
    area: "tile-d",
  },
] as const;

export function TeamContent() {
  const { t } = useI18n();
  const tc = t.teamContent;
  const teamRef = useRef(null);
  const teamInView = useInView(teamRef, { once: true, margin: "-80px" });
  const cultureRef = useRef(null);
  const cultureInView = useInView(cultureRef, { once: true, margin: "-80px" });
  const deptRef = useRef(null);
  const deptInView = useInView(deptRef, { once: true, margin: "-80px" });

  const cultureImgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cultureImgRef, offset: ["start end", "end start"] });
  const cultureImgY = useTransform(scrollYProgress, [0, 1], [25, -25]);

  return (
    <PageTransition>
      <section className="py-20 lg:py-28 bg-white" ref={teamRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="w-12 h-[2px] bg-sand mx-auto mb-6" />
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">{tc.leadershipEyebrow}</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              {tc.leadershipTitleLead} <span className="text-gradient-ocean">{tc.leadershipTitleAccent}</span>
            </h2>
            <p className="mt-6 text-slate/70 text-lg">
              {tc.leadershipSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {tc.members.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="group"
              >
                <div className="bg-mist rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center card-lift h-full flex flex-col border border-transparent hover:border-ocean/10">
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden mx-auto shadow-lg shadow-ocean/20 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-ocean/30 transition-all duration-500">
                    <Image
                      src={MEMBER_PHOTOS[i]}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 96px"
                    />
                  </div>
                  <h3 className="mt-4 sm:mt-6 font-display text-base sm:text-xl font-semibold text-navy">{member.name}</h3>
                  <p className="mt-1 text-ocean text-xs sm:text-sm font-medium">{member.role}</p>
                  <p className="mt-3 sm:mt-4 text-slate/70 text-xs sm:text-sm leading-relaxed flex-1 hidden sm:block">{member.desc}</p>
                  <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {member.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-ocean/8 text-ocean text-[10px] sm:text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-mist" ref={cultureRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={cultureInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="w-12 h-[2px] bg-sand mb-6" />
              <span className="text-ocean font-medium text-sm tracking-widest uppercase">{tc.cultureEyebrow}</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-navy leading-tight">
                {tc.cultureTitleLead} <span className="text-gradient-ocean">{tc.cultureTitleAccent}</span>
              </h2>
              <p className="mt-6 text-slate/80 text-lg leading-relaxed">
                {tc.cultureBody1}
              </p>
              <p className="mt-4 text-slate/80 text-lg leading-relaxed">
                {tc.cultureBody2}
              </p>
              <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6">
                {tc.cultureStats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={cultureInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + 0.1 * i }}
                  >
                    <div className="font-display text-2xl sm:text-3xl font-bold text-ocean">{s.num}</div>
                    <div className="text-xs sm:text-sm text-slate/60 mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              ref={cultureImgRef}
              initial={{ opacity: 0, x: 30 }}
              animate={cultureInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <motion.div style={{ y: cultureImgY }} className="culture-mosaic">
                {CULTURE_TILES.map((tile, i) => (
                  <motion.figure
                    key={tile.src}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={cultureInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6 }}
                    className={`culture-tile ${tile.area}`}
                  >
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="culture-tile-sheen" aria-hidden />
                    <span className="culture-tile-veil" aria-hidden />
                    <figcaption className="culture-tile-caption">
                      <span className="culture-tile-dot" aria-hidden />
                      {tc.cultureTiles[i]}
                    </figcaption>
                  </motion.figure>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white" ref={deptRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={deptInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/7.jpg"
                alt="United Fishers komanda"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ocean/90 to-ocean-dark/90" />
            </div>
            <div className="relative z-10 p-10 lg:p-14 text-center film-grain">
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-white">
                {tc.joinTitle}
              </h3>
              <p className="mt-4 text-white/80 text-lg max-w-2xl mx-auto">
                {tc.joinBody}
              </p>
              <a href="/contact" className="btn btn-white mt-8">
                <span>{tc.joinButton}</span>
                <svg className="w-4 h-4 btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
