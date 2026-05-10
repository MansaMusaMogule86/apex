"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  ChartLine,
  Earth,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { SILK_EASE, stagger } from "@/lib/motion";

const SERVICES = [
  {
    icon: Bot,
    title: "AI Brand Intelligence",
    summary: "Decode prestige sentiment, competitor movement, and influence opportunities before market reaction.",
  },
  {
    icon: Sparkles,
    title: "Influencer Orchestration",
    summary: "Curate and activate elite creator clusters across luxury, lifestyle, and investment adjacency.",
  },
  {
    icon: ChartLine,
    title: "Luxury Growth Engineering",
    summary: "Build revenue pathways that preserve exclusivity while scaling qualified demand.",
  },
  {
    icon: Target,
    title: "Elite Audience Targeting",
    summary: "Pinpoint high-value audiences with micro-segments trained on real buying and status signals.",
  },
  {
    icon: ShieldCheck,
    title: "Private PR Intelligence",
    summary: "Protect narrative equity with real-time risk detection and proactive reputation strategy.",
  },
  {
    icon: Earth,
    title: "Cinematic Content Systems",
    summary: "Deploy editorial content engines designed to compound authority across channels.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="mx-auto max-w-335 px-4 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 md:mb-14">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-signal-blue">Services</p>
            <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">
              Intelligence products
              <br />
              for <em className="not-italic text-gold">private operators</em>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-titanium">
            Each service behaves like a private command module: precise inputs, strategic outputs, and measurable influence impact.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                variants={{
                  initial: { opacity: 0, y: 24 },
                  whileInView: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: SILK_EASE },
                  },
                }}
                className="group relative overflow-hidden rounded-[2px] border border-white/12 bg-gradient-to-br from-carbon/85 to-obsidian/80 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-signal-blue/40 hover:shadow-[0_18px_42px_rgba(110,140,255,0.14)]"
                data-cursor="interactive"
              >
                <span className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-signal-blue to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                <Icon className="mb-6 size-6 text-signal-blue" strokeWidth={1.2} />
                <h3 className="font-display text-3xl text-warm-white">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-titanium">{service.summary}</p>
                <ArrowUpRight className="mt-7 size-4 text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
