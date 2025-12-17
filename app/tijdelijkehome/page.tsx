import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroVideo from "@/components/hero-video";
import FeaturesSection from "@/components/features-section";
import ClientsCarousel from "@/components/clients-carousel";
import StepsCarousel from "@/components/steps-carousel";
import AchievementsSection from "@/components/achievements-section";
import FAQSection from "@/components/faq-section";
import IntegrationsCarousel from "@/components/integrations-carousel";
import ScrollFadeOverlay from "@/components/scroll-fade-overlay";

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

export default function TijdelijkeHomePage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <ScrollFadeOverlay />
      <Header />

      <main className="relative z-10 flex-1">
        {/* Hero Section met Video */}
        <HeroVideo />

        {/* Features Section met foto en voordelen */}
        <FeaturesSection />

        {/* Klantenreferenties Carousel */}
        <ClientsCarousel />

        {/* Stappenplan Carousel */}
        <StepsCarousel />

        {/* Realisaties Sectie */}
        <AchievementsSection />

        {/* FAQ Sectie */}
        <FAQSection />

        {/* Integratiepartners Carousel */}
        <IntegrationsCarousel />
      </main>

      <Footer />
    </div>
  );
}

