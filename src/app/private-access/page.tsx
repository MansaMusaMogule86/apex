import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import RequestAccessForm from "@/components/forms/RequestAccessForm";

export default function PrivateAccessPage() {
  return (
    <main className="min-h-[100dvh] bg-void text-beige">
      <Navbar />
      <div className="pt-28" />
      <section className="mx-auto max-w-335 px-4 pb-6 md:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Private Access</p>
        <h1 className="font-display text-5xl leading-[0.92] text-warm-white md:text-7xl">Invitation-only intelligence onboarding.</h1>
        <p className="mt-6 max-w-[62ch] text-base leading-8 text-titanium md:text-lg">
          Submit your operator profile into the APEX Request Access Intelligence System for executive qualification, authority scoring, and private review routing.
        </p>
      </section>
      <section className="mx-auto max-w-335 px-4 pb-20 md:px-8 md:pb-24">
        <RequestAccessForm />
      </section>
      <Footer />
    </main>
  );
}
