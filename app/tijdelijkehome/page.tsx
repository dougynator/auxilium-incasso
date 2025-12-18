"use client";

import { useEffect, useState } from 'react';
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

export default function TijdelijkeHomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }
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

