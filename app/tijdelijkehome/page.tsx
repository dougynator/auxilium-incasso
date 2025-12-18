"use client";

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from "@/components/header";
import Footer from "@/components/footer";

// Dynamically import all components to prevent SSR issues
const ScrollFadeOverlay = dynamic(() => import("@/components/scroll-fade-overlay"), { ssr: false });
const HeroVideo = dynamic(() => import("@/components/hero-video"), { ssr: false });
const FeaturesSection = dynamic(() => import("@/components/features-section"), { ssr: false });
const ClientsCarousel = dynamic(() => import("@/components/clients-carousel"), { ssr: false });
const StepsCarousel = dynamic(() => import("@/components/steps-carousel"), { ssr: false });
const AchievementsSection = dynamic(() => import("@/components/achievements-section"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/faq-section"), { ssr: false });
const IntegrationsCarousel = dynamic(() => import("@/components/integrations-carousel"), { ssr: false });

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Laden...</p>
    </div>
  </div>
);

export default function TijdelijkeHomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <Suspense fallback={<LoadingFallback />}>
        <ScrollFadeOverlay />
      </Suspense>
      <Header />

      <main className="relative z-10 flex-1">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <HeroVideo />
        </Suspense>

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[300px]" />}>
          <ClientsCarousel />
        </Suspense>

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <StepsCarousel />
        </Suspense>

        <Suspense fallback={<div className="min-h-[300px]" />}>
          <AchievementsSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[300px]" />}>
          <IntegrationsCarousel />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

