import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import PrivateAccessOnboarding from "@/components/marketing/PrivateAccessOnboarding";

export default function PrivateAccessPage() {
  return (
    <main className="min-h-screen bg-void text-beige">
      <Navbar />
      <div className="pt-28" />
      <section className="mx-auto max-w-300 px-4 pb-2 md:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Private Access</p>
        <h1 className="font-display text-5xl leading-[0.92] text-warm-white md:text-7xl">Invitation-only intelligence onboarding.</h1>
        <p className="mt-6 max-w-[56ch] text-base leading-8 text-titanium md:text-lg">
          This is a strategic qualification flow for operators who need private AI intelligence infrastructure, not generic agency execution.
        </p>
      </section>
      <PrivateAccessOnboarding />
      <Footer />
    </main>
  );
}
