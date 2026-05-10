"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────
type Service = {
  number: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

// ─── Icons ───────────────────────────────────────────────────────
const IconBrain = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);
const IconUsers = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <circle cx="9" cy="7" r="4"/>
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    <circle cx="17" cy="7" r="3"/>
    <path d="M19 16c2 0 4 1 4 3"/>
  </svg>
);
const IconPen = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);
const IconTarget = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconChart = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
    <path d="M3 20h18"/>
  </svg>
);
const IconShield = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  {
    number: "01",
    name: "AI Brand Intelligence",
    description:
      "Deep analysis of brand positioning, sentiment, share of voice, and competitor vulnerabilities — delivered as actionable intelligence, not raw data.",
    icon: <IconBrain />,
  },
  {
    number: "02",
    name: "Influencer Orchestration",
    description:
      "340+ vetted elite influencers, AI-matched to your brand. APEX Score™ ensures only the highest-quality partnerships enter your orbit.",
    icon: <IconUsers />,
  },
  {
    number: "03",
    name: "Cinematic Content",
    description:
      "AI-powered content creation that doesn't look AI-generated. Campaign briefs, captions, visual direction — all bespoke.",
    icon: <IconPen />,
  },
  {
    number: "04",
    name: "Elite Audience Targeting",
    description:
      "Luxury audience segmentation that finds HNWI clusters other agencies can't see. Our AI maps the invisible networks of wealth and influence.",
    icon: <IconTarget />,
  },
  {
    number: "05",
    name: "Growth Engineering",
    description:
      "Predictive growth modeling with 90-day forecasts. We tell you exactly what needs to happen before the market tells you what didn't.",
    icon: <IconChart />,
  },
  {
    number: "06",
    name: "Private PR Intelligence",
    description:
      "Real-time reputation monitoring, crisis prevention, and narrative control. When privacy matters more than virality — this is where we operate.",
    icon: <IconShield />,
  },
];

// ─── Service Card ────────────────────────────────────────────────
function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative bg-obsidian border border-white/5 p-10 overflow-hidden hover:border-gold/20 transition-colors duration-500"
    >
      {/* Top sweep line on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

      {/* Number */}
      <span className="font-mono text-[10px] tracking-[0.2em] text-gold/40 block mb-8">
        {service.number}
      </span>

      {/* Icon */}
      <div className="text-gold/60 mb-6 group-hover:text-gold/90 transition-colors duration-500">
        {service.icon}
      </div>

      {/* Name */}
      <h3 className="font-display text-[22px] font-light text-warm-white leading-[1.2] mb-4">
        {service.name}
      </h3>

      {/* Description */}
      <p className="font-body font-light text-[13px] text-mist leading-[1.8]">
        {service.description}
      </p>

      {/* Arrow */}
      <svg
        className="absolute bottom-7 right-7 w-5 h-5 text-gold opacity-0 translate-x-[-4px] translate-y-[4px] group-hover:opacity-60 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      >
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function Services() {
  const introRef = useRef<HTMLDivElement>(null);
  const inView    = useInView(introRef, { once: true, margin: "-80px" });

  return (
    <section id="services" className="py-36">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Intro */}
        <div ref={introRef} className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-[10px] tracking-[0.35em] text-gold uppercase flex items-center gap-3 mb-5">
              Capabilities
              <span className="w-12 h-px bg-gold/40" />
            </span>
            <h2
              className="font-display font-light text-warm-white leading-[1.08] tracking-[-0.01em]"
              style={{ fontSize: "clamp(40px, 5vw, 68px)" }}
            >
              Prestige<br />
              Systems <em className="italic text-gold-light">Built</em><br />
              For Power
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-body font-light text-[15px] text-titanium leading-[1.9] max-w-[440px]"
          >
            Every service in our suite is engineered around one obsession:
            making elite clients untouchable in their market. We don&apos;t offer
            marketing. We engineer influence at the highest level.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.number} service={service} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}