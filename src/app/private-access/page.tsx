import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import RequestAccessForm from "@/components/forms/RequestAccessForm";

export const metadata = {
  title: "Private Access — APEX Intelligence",
  description:
    "Invitation-only intelligence onboarding. Submit your operator profile for executive qualification, authority scoring, and private review routing.",
};

export default function PrivateAccessPage() {
  return (
    <main className="relative min-h-[100dvh] bg-[#030305] text-platinum overflow-x-hidden">
      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E\")",
          opacity: 0.6,
        }}
      />

      {/* Deep ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-[-20%] top-[-15%] h-[900px] w-[900px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(110,140,255,0.055) 0%, transparent 65%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-15%] h-[800px] w-[800px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(201,178,124,0.045) 0%, transparent 65%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="mx-auto max-w-[1340px] px-5 pb-8 pt-32 md:px-8 md:pt-36">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-[#7a6030]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a6030]">
              Private Access
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-display text-[clamp(48px,7vw,88px)] font-light leading-[0.92] tracking-[-0.02em] text-warm-white">
                Invitation-only
                <br />
                <em className="text-gold not-italic">intelligence</em>{" "}
                onboarding.
              </h1>
              <p className="mt-6 max-w-[60ch] text-[15px] leading-8 text-titanium md:text-base">
                Submit your operator profile into the APEX Request Access
                Intelligence System for executive qualification, authority
                scoring, and private review routing.
              </p>
            </div>

            {/* Live indicators — desktop only */}
            <div className="hidden shrink-0 flex-col items-end gap-3 lg:flex">
              <div className="flex items-center gap-2 rounded-sm border border-signal-blue/20 bg-signal-blue/6 px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-signal-blue"
                  style={{ animation: "pulse 1.4s ease-in-out infinite" }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-signal-blue">
                  AI Qualification Active
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-sm border border-gold/18 bg-gold/[0.04] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold/70">
                  Executive Review: 24–48h
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </section>

        {/* Form */}
        <section className="mx-auto max-w-[1340px] px-5 pb-24 pt-8 md:px-8 md:pb-32">
          <RequestAccessForm />
        </section>

        <Footer />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </main>
  );
}
