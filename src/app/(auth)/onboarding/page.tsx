"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Check,
  Instagram,
  Linkedin,
  Sparkles,
  User,
  Users,
  Youtube,
} from "lucide-react";
import LuxuryButton from "@/components/shared/LuxuryButton";
import LuxuryFormInput from "@/components/shared/LuxuryFormInput";

const SILK = [0.16, 1, 0.3, 1] as const;

type AccountType = "creator" | "brand" | "agency";

const ACCOUNT_TYPES: {
  value: AccountType;
  title: string;
  blurb: string;
  icon: typeof User;
}[] = [
  {
    value: "creator",
    title: "Solo Creator",
    blurb: "An individual voice cultivating a distinct audience.",
    icon: User,
  },
  {
    value: "brand",
    title: "Maison · Brand",
    blurb: "A house orchestrating campaigns at scale.",
    icon: Building2,
  },
  {
    value: "agency",
    title: "Agency",
    blurb: "A studio guiding multiple clients in concert.",
    icon: Users,
  },
];

const GOALS = [
  "Audience growth",
  "Lead generation",
  "Brand awareness",
  "Product launches",
  "Customer retention",
  "International expansion",
  "Community cultivation",
  "Editorial authority",
] as const;

type Goal = (typeof GOALS)[number];

type Integration = "instagram" | "linkedin" | "youtube";

const INTEGRATIONS: {
  id: Integration;
  label: string;
  icon: typeof Instagram;
}[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "youtube", label: "YouTube", icon: Youtube },
];

const STEPS = [
  "Profile",
  "Particulars",
  "Intentions",
  "Channels",
  "Atelier",
] as const;

interface FormData {
  accountType: AccountType | null;
  companyName: string;
  website: string;
  industry: string;
  goals: Goal[];
  integrations: Integration[];
}

const INITIAL: FormData = {
  accountType: null,
  companyName: "",
  website: "",
  industry: "",
  goals: [],
  integrations: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [generating, setGenerating] = useState(false);

  const canAdvance = useMemo(() => {
    if (step === 0) return data.accountType !== null;
    if (step === 1) return data.companyName.trim().length >= 2;
    if (step === 2) return data.goals.length >= 1;
    return true;
  }, [step, data]);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setGenerating(true);
    // Stub for AI profile generation. Persist + redirect.
    setTimeout(() => router.push("/dashboard"), 2200);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function toggleGoal(goal: Goal) {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(goal)
        ? d.goals.filter((g) => g !== goal)
        : [...d.goals, goal],
    }));
  }

  function toggleIntegration(id: Integration) {
    setData((d) => ({
      ...d,
      integrations: d.integrations.includes(id)
        ? d.integrations.filter((i) => i !== id)
        : [...d.integrations, id],
    }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-warm-white">
      {/* Gold halo blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-1/4 h-[520px] w-[520px] rounded-full bg-gold/10 blur-[160px]"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 h-[480px] w-[480px] rounded-full bg-gold/[0.06] blur-[180px]"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grain */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
      >
        <filter id="onboardingGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#onboardingGrain)" />
      </svg>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 lg:px-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">
            APEX · Onboarding
          </span>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-mono text-[10px] uppercase tracking-[0.32em] text-mist transition-colors duration-500 hover:text-gold"
          >
            Skip for now
          </button>
        </header>

        {/* Progress */}
        <div className="mt-12 flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col gap-2">
              <div className="relative h-[2px] w-full overflow-hidden bg-gold/10">
                <motion.div
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.7, ease: SILK }}
                  style={{ originX: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-gold/60 to-gold-light"
                />
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.32em] transition-colors duration-500 ${
                  i <= step ? "text-gold" : "text-mist"
                }`}
              >
                {String(i + 1).padStart(2, "0")} · {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step body */}
        <section className="relative mt-16 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: SILK }}
              className="flex flex-col gap-10"
            >
              {step === 0 ? (
                <StepShell
                  kicker="Step one · Profile"
                  title={
                    <>
                      How shall we <em className="not-italic text-gold">address</em> you?
                    </>
                  }
                  body="The shape of your atelier informs every recommendation we'll make."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    {ACCOUNT_TYPES.map((t) => {
                      const Icon = t.icon;
                      const active = data.accountType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            setData((d) => ({ ...d, accountType: t.value }))
                          }
                          className={`group relative flex flex-col items-start gap-4 rounded-[2px] border bg-obsidian/60 p-6 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            active
                              ? "border-gold/60 bg-obsidian/90 shadow-[0_30px_80px_-40px_rgba(200,169,110,0.4)]"
                              : "border-gold/10 hover:border-gold/30"
                          }`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-gold/20 bg-void/60 text-gold">
                            <Icon className="h-4 w-4" strokeWidth={1.5} />
                          </span>
                          <div className="flex flex-col gap-1.5">
                            <span className="font-display text-2xl text-warm-white">
                              {t.title}
                            </span>
                            <span className="text-sm leading-relaxed text-titanium">
                              {t.blurb}
                            </span>
                          </div>
                          {active ? (
                            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-void">
                              <Check className="h-3 w-3" strokeWidth={2} />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              ) : null}

              {step === 1 ? (
                <StepShell
                  kicker="Step two · Particulars"
                  title={
                    <>
                      The <em className="not-italic text-gold">house</em> behind the work.
                    </>
                  }
                  body="A few details — kept private, used to tailor your AI advisor."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <LuxuryFormInput
                      label="Company / Atelier name"
                      value={data.companyName}
                      onChange={(e) =>
                        setData((d) => ({ ...d, companyName: e.target.value }))
                      }
                      autoFocus
                    />
                    <LuxuryFormInput
                      label="Website"
                      type="url"
                      placeholder="https://"
                      value={data.website}
                      onChange={(e) =>
                        setData((d) => ({ ...d, website: e.target.value }))
                      }
                    />
                    <LuxuryFormInput
                      label="Industry / Category"
                      value={data.industry}
                      onChange={(e) =>
                        setData((d) => ({ ...d, industry: e.target.value }))
                      }
                      hint="Fashion, hospitality, fragrance, automotive…"
                      className="md:col-span-2"
                    />
                  </div>
                </StepShell>
              ) : null}

              {step === 2 ? (
                <StepShell
                  kicker="Step three · Intentions"
                  title={
                    <>
                      What shall we <em className="not-italic text-gold">cultivate</em>?
                    </>
                  }
                  body="Choose every intention that matters this season. We'll calibrate accordingly."
                >
                  <div className="flex flex-wrap gap-3">
                    {GOALS.map((g) => {
                      const active = data.goals.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGoal(g)}
                          className={`rounded-[2px] border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.32em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            active
                              ? "border-gold bg-gold/10 text-gold-light"
                              : "border-gold/15 bg-void/40 text-titanium hover:border-gold/40 hover:text-warm-white"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              ) : null}

              {step === 3 ? (
                <StepShell
                  kicker="Step four · Channels"
                  title={
                    <>
                      Connect your <em className="not-italic text-gold">presences</em>.
                    </>
                  }
                  body="Optional. Granting read access lets APEX surface insights from your existing audience."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    {INTEGRATIONS.map((i) => {
                      const Icon = i.icon;
                      const active = data.integrations.includes(i.id);
                      return (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => toggleIntegration(i.id)}
                          className={`group flex items-center justify-between rounded-[2px] border bg-obsidian/60 p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            active
                              ? "border-gold/60 bg-obsidian/90"
                              : "border-gold/10 hover:border-gold/30"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon
                              className={`h-4 w-4 ${active ? "text-gold" : "text-titanium"}`}
                              strokeWidth={1.5}
                            />
                            <span className="font-display text-lg text-warm-white">
                              {i.label}
                            </span>
                          </span>
                          <span
                            className={`font-mono text-[9px] uppercase tracking-[0.32em] ${
                              active ? "text-gold" : "text-mist"
                            }`}
                          >
                            {active ? "Connected" : "Connect"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              ) : null}

              {step === 4 ? (
                <StepShell
                  kicker="Step five · Atelier"
                  title={
                    <>
                      Composing your <em className="not-italic text-gold">profile</em>.
                    </>
                  }
                  body="APEX is preparing a bespoke advisor calibrated to your house. A moment."
                >
                  <div className="flex flex-col items-center gap-8 py-8">
                    <motion.div
                      className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gold/20"
                      animate={{
                        boxShadow: generating
                          ? [
                              "0 0 0 0 rgba(200,169,110,0.4)",
                              "0 0 0 24px rgba(200,169,110,0)",
                            ]
                          : "0 0 0 0 rgba(200,169,110,0)",
                      }}
                      transition={{
                        duration: 2,
                        repeat: generating ? Infinity : 0,
                        ease: "easeOut",
                      }}
                    >
                      <motion.div
                        animate={
                          generating
                            ? { rotate: 360 }
                            : { rotate: 0 }
                        }
                        transition={{
                          duration: 4,
                          repeat: generating ? Infinity : 0,
                          ease: "linear",
                        }}
                      >
                        <Sparkles
                          className="h-8 w-8 text-gold"
                          strokeWidth={1.2}
                        />
                      </motion.div>
                    </motion.div>
                    <Summary data={data} />
                  </div>
                </StepShell>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Footer controls */}
        <footer className="mt-12 flex items-center justify-between border-t border-gold/10 pt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || generating}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-titanium transition-colors duration-500 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            Back
          </button>
          <LuxuryButton
            onClick={next}
            disabled={!canAdvance || generating}
            loading={generating}
            withArrow
            size="md"
          >
            {step === STEPS.length - 1
              ? generating
                ? "Composing"
                : "Enter the atelier"
              : "Continue"}
          </LuxuryButton>
        </footer>
      </div>
    </main>
  );
}

function StepShell({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/80">
          {kicker}
        </span>
        <h1 className="font-display text-5xl tracking-tight text-warm-white">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-titanium">{body}</p>
      </div>
      {children}
    </div>
  );
}

function Summary({ data }: { data: FormData }) {
  const account = ACCOUNT_TYPES.find((a) => a.value === data.accountType);
  return (
    <div className="grid w-full max-w-2xl gap-3 rounded-[2px] border border-gold/15 bg-obsidian/70 p-6">
      <SummaryRow label="Profile" value={account?.title ?? "—"} />
      <SummaryRow label="House" value={data.companyName || "—"} />
      <SummaryRow label="Industry" value={data.industry || "—"} />
      <SummaryRow
        label="Intentions"
        value={data.goals.length > 0 ? data.goals.join(" · ") : "—"}
      />
      <SummaryRow
        label="Channels"
        value={
          data.integrations.length > 0
            ? data.integrations
                .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
                .join(" · ")
            : "—"
        }
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-gold/5 pb-2 last:border-0 last:pb-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-mist">
        {label}
      </span>
      <span className="text-right text-sm text-warm-white">{value}</span>
    </div>
  );
}
