"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function VideoShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  useEffect(() => {
    if (inView && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative py-0 overflow-hidden">
      <motion.div style={{ scale }} className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <motion.div style={{ y }} className="absolute inset-0">
          {!videoLoaded && (
            <div className="absolute inset-0 bg-navy animate-pulse" />
          )}
          <video
            ref={videoRef}
            src={inView ? "/videos/ras-system-new.mp4" : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/images/posters/ras-system.jpg"
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-[120%] object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/30 to-navy/70" />
        <div className="absolute inset-0 film-grain pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center px-6 max-w-4xl"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-16 h-[1px] bg-sand mx-auto mb-8 origin-center"
            />
            <span className="text-sand/80 text-xs tracking-[0.3em] uppercase font-light">
              RAS Texnologiyası
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
              Gələcəyin{" "}
              <span className="text-gradient-gold">Akvakulturası</span>
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Qapalı dövriyyə sistemləri (RAS) ilə suyun 99%-ni təkrar istifadə
              edərək ətraf mühitə minimum təsir göstəririk.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex justify-center gap-8 sm:gap-16"
            >
              {[
                { num: "99%", label: "Su Təkrar İstifadəsi" },
                { num: "0", label: "Ətraf Mühit Zərəri" },
                { num: "24/7", label: "Monitorinq" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-xl sm:text-3xl font-bold text-sand">
                    {stat.num}
                  </div>
                  <div className="text-white/50 text-[10px] sm:text-xs mt-1 tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            viewBox="0 0 1440 60"
            className="w-full text-white block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
