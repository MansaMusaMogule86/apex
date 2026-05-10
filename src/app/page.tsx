import "@/styles/apex.css";
import CustomCursor from "@/components/shared/CustomCursor";
import ParticleBackground from "@/components/shared/ParticleBackground";
import SmoothScroll from "@/components/marketing/SmoothScroll";
import AmbientIntelligenceScene from "@/components/marketing/AmbientIntelligenceScene";
import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import PrestigeMetrics from "@/components/marketing/PrestigeMetrics";
import IntelligenceSystems from "@/components/marketing/IntelligenceSystems";
import Services from "@/components/marketing/Services";
import AISuite from "@/components/marketing/AISuite";
import LuxuryDashboardDemo from "@/components/marketing/LuxuryDashboardDemo";
import ExecutiveDashboards from "@/components/marketing/ExecutiveDashboards";
import CaseStudies from "@/components/marketing/CaseStudies";
import InfluencerNetwork from "@/components/marketing/InfluencerNetwork";
import FounderSection from "@/components/marketing/FounderSection";
import Testimonials from "@/components/marketing/Testimonials";
import PrivateAccessOnboarding from "@/components/marketing/PrivateAccessOnboarding";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/marketing/Footer";

export default function Page() {
  return (
    <main className="apex-shell bg-void text-beige">
      <SmoothScroll />
      <AmbientIntelligenceScene />
      <CustomCursor />
      <ParticleBackground />
      <Navbar />
      <Hero />
      <PrestigeMetrics />
      <IntelligenceSystems />
      <Services />
      <AISuite />
      <LuxuryDashboardDemo />
      <ExecutiveDashboards />
      <CaseStudies />
      <InfluencerNetwork />
      <FounderSection />
      <Testimonials />
      <PrivateAccessOnboarding />
      <CTASection />
      <Footer />
    </main>
  );
}
