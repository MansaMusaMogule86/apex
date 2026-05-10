"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

type Mode = "password" | "letter";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      {/* Background grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      {/* Slow gold halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-160 w-160 rounded-full bg-gold/8 blur-3xl"
      />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Editorial pane */}
        <aside className="relative hidden flex-col justify-between border-r border-gold/10 bg-obsidian px-12 py-12 lg:flex xl:px-16 xl:py-16">
          <Link
            href="/"
            className="font-display text-2xl tracking-[0.4em] text-gold transition-opacity hover:opacity-70"
          >
            APEX
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: SILK }}
            className="flex flex-col gap-8"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
              The house, after hours.
            </span>
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
            <Link
              href="/"
              className="font-display text-xl tracking-[0.4em] text-gold lg:hidden"
            >
              APEX
            </Link>

            <header className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
                Sign in
              </span>
              <h1 className="font-display text-4xl leading-[1.05] font-light tracking-tight text-warm-white">
                Welcome back,{" "}
                <em className="not-italic text-gold">quietly</em>.
              </h1>
              <p className="text-sm leading-relaxed text-titanium">
                Enter the address we keep on file. We&rsquo;ll let you in by password, or by a single-use letter.
              </p>
            </header>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-px border border-gold/10 bg-gold/10">
              {(
                [
                  { id: "password", label: "Password", Icon: KeyRound },
                  { id: "letter", label: "Letter to inbox", Icon: Mail },
                ] as { id: Mode; label: string; Icon: typeof KeyRound }[]
              ).map(({ id, label, Icon }) => {
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-500",
                      active
                        ? "bg-gold/5 text-warm-white"
                        : "bg-obsidian text-titanium hover:text-warm-white",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        active ? "text-gold" : "text-mist",
                      )}
                      strokeWidth={1.5}
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email */}
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                  Email
                </span>
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

              {/* Password (only in password mode) */}
              {mode === "password" && (
                <motion.label
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: SILK }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                      Password
                    </span>
                    <Link
                      href="/forgot-password"
                      className="font-mono text-[10px] tracking-[0.2em] text-gold/80 uppercase transition-colors hover:text-gold"
                    >
                      Forgot ·
                    </Link>
                  </div>
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
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </motion.label>
              )}

              <LuxuryButton
                variant="primary"
                size="md"
                withArrow
                loading={submitting}
                className="w-full"
              >
                {mode === "password" ? "Enter the house" : "Send the letter"}
              </LuxuryButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gold/10" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-mist uppercase">
                or by introduction
              </span>
              <div className="h-px flex-1 bg-gold/10" />
            </div>

            {/* SSO */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-[2px] border border-gold/15 bg-obsidian px-4 py-3 font-mono text-[10px] tracking-[0.25em] text-warm-white uppercase transition-all duration-500 hover:border-gold/35 hover:bg-gold/5"
              >
                <GoogleMark />
                Continue with Google
              </button>
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-[2px] border border-gold/15 bg-obsidian px-4 py-3 font-mono text-[10px] tracking-[0.25em] text-warm-white uppercase transition-all duration-500 hover:border-gold/35 hover:bg-gold/5"
              >
                <AppleMark />
                Continue with Apple
              </button>
            </div>

            <footer className="flex flex-col items-center gap-2 border-t border-gold/10 pt-6">
              <p className="text-xs text-titanium">
                Without a key yet?{" "}
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 text-gold transition-colors hover:text-gold-light"
                >
                  Request an introduction
                  <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </p>
              <p className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                Protected by hardware key · 2FA on every session
              </p>
            </footer>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path
        fill="#C8A96E"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
      />
      <path
        fill="#9A9A9A"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.7 8.1 22 12 22z"
      />
      <path
        fill="#5A5A6A"
        d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z"
      />
      <path
        fill="#E2C99A"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.4 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.1.7c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.7-1-2.7-3.7zM14 5.4c.6-.8 1.1-1.9 1-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.5 2.7-1.3z" />
    </svg>
  );
}
