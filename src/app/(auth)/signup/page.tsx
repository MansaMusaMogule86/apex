"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import LuxuryButton from "@/components/shared/LuxuryButton";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

const REVENUE_RANGES = [
  "Under $1M",
  "$1M-$5M",
  "$5M-$25M",
  "$25M-$100M",
  "$100M+",
] as const;

const HOUSES = [
  { name: "Maison Verre", note: "Geneva · horology" },
  { name: "Atelier Noir", note: "Paris · couture" },
  { name: "House of Kuro", note: "Kyoto · ceramics" },
  { name: "Linnaeus & Sons", note: "London · perfumery" },
];

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // Form fields matching RequestAccessInputSchema
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [revenueRange, setRevenueRange] = useState<typeof REVENUE_RANGES[number]>("$1M-$5M");
  const [marketFocus, setMarketFocus] = useState("");
  const [strategicObjective, setStrategicObjective] = useState("");
  const [whyApex, setWhyApex] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          company,
          industry,
          website: website || undefined,
          revenueRange,
          marketFocus,
          strategicObjective,
          whyApex,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setSubmittedEmail(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void text-warm-white">
      {/* grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      {/* gold halos */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: SILK }}
        className="pointer-events-none absolute -top-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-gold/10 blur-[160px]"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: SILK, delay: 0.2 }}
        className="pointer-events-none absolute -bottom-60 left-[-10%] h-[520px] w-[520px] rounded-full bg-gold/[0.06] blur-[180px]"
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* ── Editorial pane ─────────────────────────────────────── */}
        <aside className="hidden border-r border-gold/10 bg-obsidian/80 px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-16">
          <header className="flex items-center justify-between">
            <span className="font-display text-2xl tracking-[0.4em] text-warm-white">APEX</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">MMXXVI · invitation</span>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: SILK, delay: 0.1 }}
            className="max-w-md space-y-10"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/80">An introduction</p>
            <h2 className="font-display text-5xl leading-[1.05] tracking-tight text-warm-white xl:text-6xl">
              Twelve houses.{" "}
              <em className="not-italic text-gold">Eight invitations</em> a year.
            </h2>
            <p className="text-sm leading-relaxed text-titanium">
              APEX is not a marketplace. New clients are welcomed by referral, after a quiet
              conversation. We will read every word you send, and reply within seven days.
            </p>

            <div className="space-y-3 border-t border-gold/10 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-mist">Recently welcomed</p>
              <ul className="space-y-2">
                {HOUSES.map((h, i) => (
                  <motion.li
                    key={h.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: SILK, delay: 0.4 + i * 0.08 }}
                    className="flex items-baseline justify-between gap-6 text-sm"
                  >
                    <span className="text-warm-white">{h.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">{h.note}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <footer className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
            <span>Paris · Geneva · Tokyo</span>
            <span className="text-gold/60">no. 0024 / 0096</span>
          </footer>
        </aside>

        {/* ── Form pane ──────────────────────────────────────────── */}
        <main className="flex min-h-screen items-start justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: SILK }}
            className="w-full max-w-xl space-y-10 py-4"
          >
            <Link href="/" className="inline-flex items-center gap-2 font-display text-xl tracking-[0.4em] text-warm-white lg:hidden">
              APEX
            </Link>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: SILK }}
                  className="space-y-6 border border-gold/20 bg-carbon/40 p-10"
                >
                  <CheckCircle className="h-8 w-8 text-gold" strokeWidth={1.5} />
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">
                      Received · {new Date().toLocaleDateString("en-GB")}
                    </p>
                    <h2 className="font-display text-3xl leading-tight text-warm-white">
                      Thank you,{" "}
                      <em className="not-italic text-gold">
                        {fullName.split(" ")[0] || "we have your letter"}
                      </em>
                      .
                    </h2>
                    <p className="text-sm leading-relaxed text-titanium">
                      A partner will write to{" "}
                      <span className="text-warm-white">{submittedEmail}</span> within seven days.
                      Until then — no automated mail, no follow-up sequences. Only a reply, when it is ready.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <LuxuryButton href="/" variant="ghost" size="sm">
                      Return to the house
                    </LuxuryButton>
                    <Link
                      href="/login"
                      className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist transition-colors hover:text-gold"
                    >
                      Already a client →
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-10">
                  <header className="space-y-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/80">Request an introduction</p>
                    <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-warm-white sm:text-5xl">
                      Quietly, <em className="not-italic text-gold">by referral</em>.
                    </h1>
                    <p className="text-sm leading-relaxed text-titanium">
                      Tell us about the house. We respond by hand, never by form letter.
                    </p>
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Field label="Full name" hint="who we address" value={fullName} onChange={setFullName} placeholder="Élise Marchand" required />
                      <Field label="Company" hint="trading name" value={company} onChange={setCompany} placeholder="Maison Verre" required />
                    </div>

                    <Field label="Email" hint="we reply by hand" type="email" value={email} onChange={setEmail} placeholder="elise@maisonverre.fr" required />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Field label="Industry" hint="sector" value={industry} onChange={setIndustry} placeholder="Luxury real estate" required />
                      <Field label="Website" hint="optional" type="url" value={website} onChange={setWebsite} placeholder="maisonverre.fr" />
                    </div>

                    {/* Revenue range */}
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.4em] text-mist">Annual revenue</label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {REVENUE_RANGES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRevenueRange(r)}
                            className={cn(
                              "rounded-[2px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition-all duration-500",
                              revenueRange === r
                                ? "border-gold/60 bg-gold/[0.06] text-gold-light"
                                : "border-gold/10 text-mist hover:border-gold/30",
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <TextArea
                      label="Market focus"
                      hint="e.g. Dubai ultra-prime, GCC sovereign"
                      value={marketFocus}
                      onChange={setMarketFocus}
                      placeholder="Primary markets and strategic geographies…"
                      rows={2}
                      required
                    />

                    <TextArea
                      label="Strategic objective"
                      hint="what you want APEX to achieve"
                      value={strategicObjective}
                      onChange={setStrategicObjective}
                      placeholder="Scale prestige positioning in GCC while entering European luxury tier…"
                      rows={3}
                      required
                    />

                    <TextArea
                      label="Why APEX"
                      hint="be direct — the team reads every word"
                      value={whyApex}
                      onChange={setWhyApex}
                      placeholder="What convinced you to reach out, and what outcome would change the way you operate…"
                      rows={4}
                      required
                    />

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}

                    <div className="space-y-4 pt-4">
                      <LuxuryButton type="submit" variant="primary" size="lg" withArrow loading={loading} className="w-full">
                        {loading ? "Sending the letter" : "Request an introduction"}
                      </LuxuryButton>
                      <p className="text-[11px] leading-relaxed text-mist">
                        By writing to us you accept that we read carefully, store your note securely, and reply within seven days.
                        No newsletter, no follow-ups.
                      </p>
                    </div>
                  </form>

                  <footer className="flex items-center justify-between border-t border-gold/10 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                    <span>Already a client?</span>
                    <Link href="/login" className="text-warm-white transition-colors hover:text-gold">
                      Sign in →
                    </Link>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function Field({ label, hint, value, onChange, placeholder, type = "text", required }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.4em] text-mist">{label}</label>
        {hint && <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60">{hint}</span>}
      </div>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 border-b border-gold/10 bg-transparent px-0 py-3 text-sm text-warm-white placeholder:text-mist/50 focus:border-gold/40 focus:outline-none"
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

function TextArea({ label, hint, value, onChange, placeholder, rows = 3, required }: TextAreaProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.4em] text-mist">{label}</label>
        {hint && <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60">{hint}</span>}
      </div>
      <textarea
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none border-0 border-b border-gold/10 bg-transparent px-0 py-3 text-sm text-warm-white placeholder:text-mist/50 focus:border-gold/40 focus:outline-none"
      />
    </div>
  );
}
