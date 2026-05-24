"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/ui/PageTransition";

const TIMELINE = [
  { year: "2009", title: "Təsis Edildi", desc: "Kiçik bir balıqçılıq təsərrüfatı olaraq fəaliyyətə başladıq." },
  { year: "2013", title: "İlk Genişlənmə", desc: "Hovuz sayını artıraraq istehsal həcmini 3 dəfə böyütdük." },
  { year: "2017", title: "Texnoloji İnteqrasiya", desc: "IoT sensorlar və avtomatik yem sistemləri tətbiq etdik." },
  { year: "2020", title: "Emal Müəssisəsi", desc: "Beynəlxalq standartlara uyğun emal zavodu istifadəyə verdik." },
  { year: "2024", title: "İxracat Bazarları", desc: "Avropa və Yaxın Şərq bazarlarına ixracata başladıq." },
];

const VALUES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /><circle cx="12" cy="12" r="4" /></svg>,
    title: "Davamlılıq",
    desc: "Ekoloji tarazlığı qoruyaraq gələcək nəsillər üçün məsuliyyətli istehsal edirik. Hər bir prosesdə ətraf mühitə təsiri minimuma endiririk.",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: "Keyfiyyət",
    desc: "ISO 22000 və HACCP sertifikatlarına uyğun istehsal. Beynəlxalq standartlarda qida təhlükəsizliyi təmin edirik.",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "İnnovasiya",
    desc: "Ən müasir IoT, süni intellekt və avtomatlaşdırma texnologiyaları ilə sənayedə yeni standartlar müəyyən edirik.",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /><circle cx="12" cy="12" r="10" /></svg>,
    title: "Şəffaflıq",
    desc: "Bütün proseslərimizdə tam şəffaflıq təmin edirik. Tərəfdaşlarımız və müştərilərimiz istənilən vaxt istehsal prosesimizi izləyə bilər.",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: "İcma Dəstəyi",
    desc: "Yerli icmaları dəstəkləyirik, iş yerləri yaradırıq və biliyimizi paylaşaraq regional inkişafa töhfə veririk.",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    title: "Elmi Yanaşma",
    desc: "Elmi araşdırmalara əsaslanan yanaşma. Universitetlər və tədqiqat institutları ilə əməkdaşlıq edərək daim inkişaf edirik.",
  },
];

const ACTIVITY_AREAS = [
  { title: "Nərə Yetişdirmə", desc: "Premium nərə balığı və qara kürü istehsalı. Xəzər nərəsinin bərpası proqramına dəstək.", icon: "🐟" },
  { title: "Alabalıq Ferması", desc: "Təmiz dağ sularında yetişdirilən gökkuşağı alabalığı. İllik 200 ton istehsal gücü.", icon: "🏔️" },
  { title: "Yem Texnologiyası", desc: "Yüksək qidalılıq dəyərli, təbii komponentli balıq yemi istehsalı və R&D.", icon: "🌿" },
  { title: "Emal və İxracat", desc: "HACCP sertifikatlı emal müəssisəsi. Avropa və Yaxın Şərq bazarlarına ixracat.", icon: "📦" },
  { title: "Konsaltinq", desc: "Akvakultura layihələrinin planlaşdırılması, texniki-iqtisadi əsaslandırma xidmətləri.", icon: "📋" },
  { title: "Texnoloji Həllər", desc: "IoT monitorinq, avtomatik yemləmə və su keyfiyyəti idarəetmə sistemləri.", icon: "⚙️" },
];

export function AboutContent() {
  const missionRef = useRef(null);
  const missionInView = useInView(missionRef, { once: true, margin: "-80px" });
  const areasRef = useRef(null);
  const areasInView = useInView(areasRef, { once: true, margin: "-80px" });
  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-80px" });
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-80px" });
  const qualityRef = useRef(null);
  const qualityInView = useInView(qualityRef, { once: true, margin: "-80px" });

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const qualityParallaxRef = useRef(null);
  const { scrollYProgress: qualityScrollY } = useScroll({ target: qualityParallaxRef, offset: ["start end", "end start"] });
  const qualityImgY = useTransform(qualityScrollY, [0, 1], [20, -20]);

  return (
    <PageTransition>
      {/* Mission & Vision */}
      <section className="py-20 lg:py-28 bg-white" ref={missionRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-[2px] bg-sand mb-6" />
              <span className="text-ocean font-medium text-sm tracking-widest uppercase">Missiyamız</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
                Davamlı Akvakulturanın <span className="text-gradient-ocean">Gələcəyini</span> Qururuq
              </h2>
              <p className="mt-6 text-slate/80 text-lg leading-relaxed">
                Fishers olaraq biz innovativ yanaşmalar və davamlı təcrübələrlə akvakultura sənayesini
                dəyişdiririk. 2009-cu ildən bəri müasir texnologiyalardan istifadə edərək ekoloji tarazlığı
                qorumaqla yanaşı, ən yüksək keyfiyyətli dəniz məhsulları istehsal edirik.
              </p>
              <p className="mt-4 text-slate/80 text-lg leading-relaxed">
                Missiyamız sağlam, davamlı və əlçatan akvakultura sistemləri yaratmaq, yerli icmaları
                dəstəkləmək, iş yerləri açmaq və qlobal ərzaq təhlükəsizliyinə real töhfə verməkdir. Biz
                sadəcə balıq yetişdirmirik — sənayenin gələcəyini formalaşdırırıq.
              </p>
              <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6">
                {[
                  { num: "15+", label: "İllik Təcrübə" },
                  { num: "50+", label: "Mütəxəssis" },
                  { num: "200+", label: "Tərəfdaş" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-2xl sm:text-3xl font-bold text-ocean">{s.num}</div>
                    <div className="text-xs sm:text-sm text-slate/60 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              ref={parallaxRef}
              initial={{ opacity: 0, x: 40 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border-glow">
                <motion.div style={{ y: imgY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                  <Image
                    src="/images/1.jpg"
                    alt="Fishers akvakultura təsərrüfatı"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-tr from-ocean/20 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={missionInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 rounded-xl overflow-hidden shadow-2xl max-w-[140px] sm:max-w-[180px] border-2 border-white"
              >
                <Image
                  src="/images/4.jpg"
                  alt="RAS sistemi"
                  width={180}
                  height={120}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-ocean/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="font-display text-xl sm:text-2xl font-bold">100%</div>
                  <div className="text-[10px] sm:text-xs text-white/90 mt-0.5">Davamlı İstehsal</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 rounded-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/8.jpg"
                alt="Akvakultura sahəsi"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" />
            </div>
            <div className="relative z-10 p-10 lg:p-14">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-sand font-medium text-sm tracking-widest uppercase">Vizyonumuz</span>
                  <h3 className="mt-4 font-display text-2xl lg:text-3xl font-bold text-white">
                    Regionun Aparıcı Akvakultura Şirkəti
                  </h3>
                </div>
                <div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    2030-cu ilə qədər Qafqaz və Xəzər regionunda ən böyük və ən davamlı akvakultura
                    şirkəti olmaq. Texnologiya, elm və təbiətin harmoniyası ilə sənayedə yeni standartlar
                    müəyyən etmək və 1000+ iş yeri yaratmaq hədəfimizdir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Activity Areas */}
      <section className="py-20 lg:py-28 bg-mist" ref={areasRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={areasInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">Fəaliyyət İstiqamətləri</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              Nə <span className="text-gradient-ocean">Edirik</span>
            </h2>
            <p className="mt-6 text-slate/70 text-lg">
              Akvakultura dəyər zəncirinin bütün sahələrini əhatə edən kompleks xidmətlər.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITY_AREAS.map((area, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 25 }}
                animate={areasInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="bg-white rounded-2xl p-8 card-lift hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">{area.icon}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-navy">{area.title}</h3>
                <p className="mt-3 text-slate/70 leading-relaxed">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-white" ref={valuesRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={valuesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">Dəyərlərimiz</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              Prinsiplərimiz və <span className="text-gradient-ocean">Dəyərlərimiz</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALUES.map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 25 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="group p-8 rounded-2xl border border-ocean-muted/20 hover:bg-ocean transition-all duration-500 cursor-default hover:shadow-xl">
                <div className="text-ocean group-hover:text-white transition-colors duration-500">{v.icon}</div>
                <h3 className="mt-5 font-display text-xl font-semibold text-navy group-hover:text-white transition-colors duration-500">{v.title}</h3>
                <p className="mt-3 text-slate/70 group-hover:text-white/80 leading-relaxed transition-colors duration-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section className="py-20 lg:py-28 bg-mist" ref={qualityRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={qualityInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
              <div className="w-12 h-[2px] bg-sand mb-6" />
              <span className="text-ocean font-medium text-sm tracking-widest uppercase">Xidmət Keyfiyyəti</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-navy leading-tight">
                Beynəlxalq Standartlarda <span className="text-gradient-ocean">Keyfiyyət</span>
              </h2>
              <p className="mt-6 text-slate/80 text-lg leading-relaxed">
                Bütün istehsal proseslərimiz beynəlxalq keyfiyyət və qida təhlükəsizliyi standartlarına
                tam uyğundur. Laboratoriya yoxlamaları, müntəzəm auditlər və sertifikasiya prosesləri
                vasitəsilə məhsullarımızın keyfiyyətinə zəmanət veririk.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "ISO 22000 Qida Təhlükəsizliyi İdarəetmə Sistemi",
                  "HACCP Kritik Nəzarət Nöqtələri Sistemi",
                  "GlobalGAP Akvakultura Sertifikatı",
                  "ASC Davamlı Akvakultura Sertifikatı",
                ].map((cert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={qualityInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + 0.1 * i }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-ocean/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate/80">{cert}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              ref={qualityParallaxRef}
              initial={{ opacity: 0, x: 30 }}
              animate={qualityInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border-glow">
                <motion.div style={{ y: qualityImgY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                  <Image
                    src="/images/6.jpg"
                    alt="Keyfiyyət nəzarəti"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={qualityInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 glass-ocean rounded-xl p-4 sm:p-5 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ocean flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-navy">4 Sertifikat</div>
                    <div className="text-xs text-slate/60">Beynəlxalq Standart</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28 bg-white" ref={timelineRef}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={timelineInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-ocean font-medium text-sm tracking-widest uppercase">Tariximiz</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              İnkişaf <span className="text-gradient-ocean">Yolumuz</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-ocean-muted/30 hidden lg:block" />
            <div className="space-y-12 lg:space-y-0">
              {TIMELINE.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={timelineInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className={`relative lg:flex items-center ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} lg:mb-16`}>
                  <div className={`lg:w-1/2 ${i % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                    <div className="bg-mist rounded-xl sm:rounded-2xl p-6 sm:p-8 card-lift">
                      <span className="text-ocean font-display text-xl sm:text-2xl font-bold">{item.year}</span>
                      <h3 className="mt-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                      <p className="mt-2 text-slate/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-ocean border-4 border-white shadow-md" />
                  <div className="lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
