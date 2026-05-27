"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LuxuryButton from "@/components/shared/LuxuryButton";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;
type Mode = "password" | "letter";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();

    if (mode === "password") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } else {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (otpError) {
        setError(otpError.message);
        setSubmitting(false);
        return;
      }
      setMagicLinkSent(true);
      setSubmitting(false);
    }
  };

  // ── Magic link confirmation ─────────────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-void flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: SILK }}
          className="mx-auto flex w-full max-w-md flex-col gap-8 border border-gold/20 bg-obsidian/80 p-10"
        >
          <CheckCircle className="h-8 w-8 text-gold" strokeWidth={1.5} />
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">Letter dispatched</p>
            <h1 className="font-display text-3xl text-warm-white">Check your inbox.</h1>
            <p className="text-sm leading-relaxed text-titanium">
              We sent a secure entry link to <span className="text-warm-white">{email}</span>.
              It expires in 10 minutes. No password required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setMagicLinkSent(false); setEmail(""); }}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist transition-colors hover:text-gold text-left"
          >
            ← Use a different address
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main login form ─────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-gold/8 blur-3xl" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Editorial pane */}
        <aside className="relative hidden flex-col justify-between border-r border-gold/10 bg-obsidian px-12 py-12 lg:flex xl:px-16 xl:py-16">
          <Link href="/" className="font-display text-2xl tracking-[0.4em] text-gold transition-opacity hover:opacity-70">
            APEX
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: SILK }}
            className="flex flex-col gap-8"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">The house, after hours.</span>
            <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white xl:text-5xl">
              <em className="not-italic text-gold">Discretion</em>, by old habit.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-titanium">
              Twelve houses speak with us in confidence. The door is kept narrow on purpose — keys go only to those expected.
            </p>
            <div className="my-2 h-px w-24 bg-gold/30" />
            <figure className="flex flex-col gap-4">
              <blockquote className="font-display text-lg leading-relaxed font-light text-warm-white italic">
                &ldquo;APEX writes our briefs the way we&rsquo;d hand-set a window: deliberately, and with the lights low.&rdquo;
              </blockquote>
              <figcaption className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                Maison Hermès · Director of editorial
              </figcaption>
            </figure>
          </motion.div>
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            <span>Paris · Geneva · Tokyo</span>
            <span>est · 2021</span>
          </div>
        </aside>

        {/* Form pane */}
        <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: SILK, delay: 0.1 }}
            className="mx-auto flex w-full max-w-md flex-col gap-10"
          >
            <Link href="/" className="font-display text-xl tracking-[0.4em] text-gold lg:hidden">APEX</Link>

            <header className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">Sign in</span>
              <h1 className="font-display text-4xl leading-[1.05] font-light tracking-tight text-warm-white">
                Welcome back, <em className="not-italic text-gold">quietly</em>.
              </h1>
              <p className="text-sm leading-relaxed text-titanium">
                Enter the address we keep on file. We&rsquo;ll let you in by password, or by a single-use letter.
              </p>
            </header>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-px border border-gold/10 bg-gold/10">
              {([
                { id: "password", label: "Password", Icon: KeyRound },
                { id: "letter", label: "Letter to inbox", Icon: Mail },
              ] as { id: Mode; label: string; Icon: typeof KeyRound }[]).map(({ id, label, Icon }) => {
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setMode(id); setError(null); }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-500",
                      active ? "bg-gold/5 text-warm-white" : "bg-obsidian text-titanium hover:text-warm-white",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active ? "text-gold" : "text-mist")} strokeWidth={1.5} />
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="principal@maison.com"
                  className="rounded-[2px] border border-gold/10 bg-obsidian px-4 py-3 text-sm text-warm-white placeholder:text-mist focus:border-gold/30 focus:outline-none"
                />
              </label>

              {/* Password (password mode only) */}
              {mode === "password" && (
                <motion.label
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: SILK }}
                  className="flex flex-col gap-2"
                >
                  <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-[2px] border border-gold/10 bg-obsidian px-4 py-3 pr-12 text-sm text-warm-white placeholder:text-mist focus:border-gold/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-mist transition-colors hover:text-gold"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </motion.label>
              )}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <LuxuryButton variant="primary" size="md" withArrow loading={submitting} className="w-full">
                {mode === "password" ? "Enter the house" : "Send the letter"}
              </LuxuryButton>
            </form>

            <footer className="flex flex-col items-center gap-2 border-t border-gold/10 pt-6">
              <p className="text-xs text-titanium">
                Without a key yet?{" "}
                <Link href="/signup" className="inline-flex items-center gap-1 text-gold transition-colors hover:text-gold-light">
                  Request an introduction
                  <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </p>
              <p className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                Secured by Supabase Auth · encrypted in transit
              </p>
            </footer>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
