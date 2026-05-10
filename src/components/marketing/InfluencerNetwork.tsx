"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const PROFILES = [
  {
    name: "N. Al Mansoori",
    niche: "Luxury Mobility",
    reach: "5.2M",
    engagement: "8.9%",
    compatibility: "97",
    match: "95",
  },
  {
    name: "L. Hart",
    niche: "Fine Jewelry",
    reach: "3.7M",
    engagement: "9.4%",
    compatibility: "93",
    match: "91",
  },
  {
    name: "K. Ibrahim",
    niche: "Private Real Estate",
    reach: "6.1M",
    engagement: "7.6%",
    compatibility: "96",
    match: "94",
  },
  {
    name: "A. Coste",
    niche: "Wellness Prestige",
    reach: "2.9M",
    engagement: "10.2%",
    compatibility: "90",
    match: "89",
  },
];

export default function InfluencerNetwork() {
  const track = [...PROFILES, ...PROFILES];

  return (
    <section id="clients" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1340px] px-4 md:px-8">
        <motion.div {...fadeUp} className="mb-10">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Influencer Network</p>
          <h2 className="max-w-4xl font-display text-4xl text-warm-white md:text-6xl">
            A vetted private network,
            <em className="not-italic text-gold"> algorithmically matched</em> to your category.
          </h2>
        </motion.div>

        <div className="apex-marquee">
          <div className="apex-marquee-track gap-4 py-2">
            {track.map((profile, idx) => (
              <motion.article
                key={`${profile.name}-${idx}`}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
                className="w-[300px] shrink-0 rounded-[2px] border border-white/12 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 shadow-[0_14px_38px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-4 h-40 rounded-[2px] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(245,240,232,0.22),transparent_65%),linear-gradient(160deg,#1a1a22,#0b0b10)]" />
                <p className="font-display text-2xl text-warm-white">{profile.name}</p>
                <p className="mb-4 text-sm tracking-wide text-titanium">{profile.niche}</p>
                <ul className="space-y-2 text-xs uppercase tracking-[0.16em] text-beige/85">
                  <li>Reach: {profile.reach}</li>
                  <li>Engagement: {profile.engagement}</li>
                  <li>Luxury Compatibility: {profile.compatibility}</li>
                  <li>AI Match Score: {profile.match}</li>
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
