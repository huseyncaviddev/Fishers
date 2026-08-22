"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";
import { useI18n } from "@/i18n/I18nProvider";

const DEPT_COUNTS = [28, 8, 6, 5, 3];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

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
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-ocean to-ocean-dark mx-auto flex items-center justify-center shadow-lg shadow-ocean/20 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-ocean/30 transition-all duration-500">
                    <span className="text-white font-display text-lg sm:text-2xl font-bold">{getInitials(member.name)}</span>
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
              <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden relative border-glow">
                <motion.div style={{ y: cultureImgY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                  <Image
                    src="/images/2.jpg"
                    alt="United Fishers komanda mədəniyyəti"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={cultureInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 glass-ocean rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-display font-bold text-navy text-sm">{tc.cultureBadge}</span>
                </div>
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
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">{tc.structureEyebrow}</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              {tc.structureTitle}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {tc.departments.map((dept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={deptInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="bg-mist rounded-2xl p-6 text-center card-lift border border-transparent hover:border-ocean/10"
              >
                <div className="font-display text-3xl font-bold text-gradient-ocean">{DEPT_COUNTS[i]}</div>
                <div className="mt-2 text-navy font-medium text-sm">{dept.name}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={deptInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 rounded-2xl overflow-hidden relative"
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
