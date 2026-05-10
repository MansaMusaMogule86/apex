"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LuxuryFormInput from "@/components/shared/LuxuryFormInput";

const STEPS = [
  { id: "profile", title: "Profile" },
  { id: "intent", title: "Intent" },
  { id: "authority", title: "Authority" },
] as const;

export default function PrivateAccessOnboarding() {
  const [step, setStep] = useState(0);

  return (
    <section className="py-24 md:py-32" id="private-access-onboarding">
      <div className="mx-auto max-w-300 px-4 md:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Private Access Onboarding Flow</p>
        <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">Screening intelligence for high-value operators.</h2>

        <div className="mt-10 rounded-[2px] border border-white/12 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-6 md:p-8">
          <div className="mb-7 flex gap-3">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-[2px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] ${
                  step === index ? "border-gold/60 bg-gold/[0.1] text-gold-light" : "border-white/15 text-titanium"
                }`}
                data-cursor="interactive"
              >
                {index + 1}. {item.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid gap-4"
            >
              {step === 0 && (
                <>
                  <LuxuryFormInput label="Full Name" placeholder="Your name" />
                  <LuxuryFormInput label="Company" placeholder="Company or portfolio" />
                </>
              )}
              {step === 1 && (
                <>
                  <LuxuryFormInput label="Primary Objective" placeholder="Lead quality, velocity, authority" />
                  <LuxuryFormInput multiline rows={3} label="Market Focus" placeholder="Palm, DIFC, Downtown, global investor corridors" />
                </>
              )}
              {step === 2 && (
                <>
                  <LuxuryFormInput label="Monthly Media Budget" placeholder="AED 100K+" />
                  <LuxuryFormInput label="Decision Timeline" placeholder="Immediate, 30 days, 90 days" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
