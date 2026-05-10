import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import FounderSection from "@/components/marketing/FounderSection";
import Testimonials from "@/components/marketing/Testimonials";
import ExecutiveDashboards from "@/components/marketing/ExecutiveDashboards";

export default function FounderAuthorityPage() {
  return (
    <main className="min-h-screen bg-void text-beige">
      <Navbar />
      <div className="pt-28" />
      <section className="mx-auto max-w-335 px-4 pb-10 md:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Founder Authority</p>
        <h1 className="font-display text-5xl leading-[0.92] text-warm-white md:text-7xl">
          Architect the narrative gravity of your market.
        </h1>
        <p className="mt-6 max-w-[56ch] text-base leading-8 text-titanium md:text-lg">
          APEX Founder Authority Systems combine AI content intelligence, trust signal analytics, and influence engineering to convert executive presence into premium demand.
        </p>
      </section>
      <ExecutiveDashboards />
      <FounderSection />
      <Testimonials />
      <Footer />
    </main>
  );
}
