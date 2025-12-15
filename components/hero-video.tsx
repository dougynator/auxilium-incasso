"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroVideo() {
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animatie wanneer component mount
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full min-h-[400px] max-h-[600px] h-[50vh] md:h-[55vh] lg:h-[60vh] overflow-hidden">
      {/* Fallback gradient achtergrond (als video niet beschikbaar is) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
      
      {/* Video achtergrond */}
      {!videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          <source src="/videos/hero-video.webm" type="video/webm" />
        </video>
      )}
      
      {/* Overlay voor betere leesbaarheid */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40" />
      
      {/* Content overlay - vak onderaan, gecentreerd */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-end justify-center pb-4 md:pb-6 lg:pb-8">
        <div className="max-w-4xl w-full">
          {/* Tekst vak met achtergrond - interactief en opvallend */}
          <div 
            className={`
              bg-primary/90 backdrop-blur-sm rounded-2xl 
              p-3 sm:p-4 md:p-4 
              shadow-lg border-2 border-white/30
              transform transition-all duration-500 ease-out
              hover:scale-[1.01] hover:bg-primary/95 hover:shadow-xl
              hover:border-white/50
              cursor-pointer
              ${isVisible ? 'animate-fade-in-up animate-glow' : 'opacity-0 translate-y-8'}
            `}
          >
            {/* Flexbox layout: tekst links, knop rechts */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              {/* Tekst gedeelte */}
              <div className="flex-1">
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight tracking-tight">
                  Onbetaalde facturen?
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-white/95 leading-relaxed font-sans">
                  Laat Auxilium Incasso uw onbetaalde facturen snel en efficiënt innen. 
                  Transparante prijzen, geen verborgen kosten. 
                  <span className="font-semibold text-white"> No cure no pay</span> - u betaalt alleen bij succes.
                </p>
              </div>
              
              {/* Knop rechts */}
              <div className="flex-shrink-0">
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-4 bg-white hover:bg-white/90 text-primary font-display font-semibold shadow-xl hover:shadow-2xl transition-all rounded-xl hover:scale-110 transform animate-bounce-subtle whitespace-nowrap"
                  >
                    Dien nu uw opdracht in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

