"use client";

import { useState, useRef } from "react";
import { FileText, Search, MessageSquare, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "Dien je opdracht in",
    description: "Log in op je persoonlijke portaal en dien eenvoudig je incasso-opdracht in. Upload de benodigde documenten en geef alle relevante informatie door.",
    icon: FileText,
    color: "bg-primary/10 text-primary border-primary/20",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    id: 2,
    title: "Automatische controle",
    description: "Ons systeem controleert automatisch alle ingediende informatie op volledigheid. We verifiëren de gegevens van de schuldenaar en controleren de geldigheid van de vordering.",
    icon: Search,
    color: "bg-green-50 text-green-700 border-green-200",
    gradient: "from-green-50 to-emerald-100",
  },
  {
    id: 3,
    title: "Contact schuldenaar",
    description: "We nemen direct contact op met de schuldenaar via verschillende kanalen. Onze ervaren medewerkers werken aan een snelle oplossing voor uw vordering.",
    icon: MessageSquare,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    gradient: "from-orange-50 to-amber-100",
  },
  {
    id: 4,
    title: "Betaling ontvangen",
    description: "Zodra de betaling is ontvangen, wordt deze direct aan u overgemaakt. Met ons no cure - no pay principe betaalt u alleen bij succes.",
    icon: CreditCard,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    gradient: "from-purple-50 to-violet-100",
  },
];

export default function StepsCarousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [mouseStart, setMouseStart] = useState(0);
  const [mouseEnd, setMouseEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextStep = () => {
    if (isAnimating || currentStep >= steps.length - 1) return;
    setIsAnimating(true);
    setCurrentStep((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevStep = () => {
    if (isAnimating || currentStep <= 0) return;
    setIsAnimating(true);
    setCurrentStep((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextStep();
    }
    if (isRightSwipe) {
      prevStep();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextStep();
    }
    if (isRightSwipe) {
      prevStep();
    }

    setIsDragging(false);
    setMouseStart(0);
    setMouseEnd(0);
  };

  const getStepPosition = (index: number) => {
    const diff = index - currentStep;
    if (diff === 0) return 0; // Center
    if (diff === 1) return 1; // Right (next)
    if (diff === -1) return -1; // Left (prev)
    return null; // Hidden
  };

  return (
    <section className="pt-8 md:pt-12 pb-10 md:pb-12 bg-gradient-to-b from-primary/5 via-white to-gray-50/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Titel */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Zo werkt het
            </h2>
            <p className="font-sans text-base text-muted-foreground">
              In 4 eenvoudige stappen naar betaalde facturen
            </p>
          </div>

          {/* 3D Carousel Container */}
          <div className="relative">
            <div className="relative h-[280px] md:h-[320px] flex items-center justify-center" style={{ perspective: "1200px" }}>
              <div
                ref={carouselRef}
                className="relative w-full max-w-md mx-auto h-full cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const position = getStepPosition(index);
                  const isActiveStep = position === 0;
                  const isNext = position === 1;
                  const isPrev = position === -1;

                  // Verberg stappen die niet direct naast de huidige zijn
                  if (position === null) return null;

                  return (
                    <div
                      key={step.id}
                      className={`
                        absolute inset-0 transition-all duration-500 ease-out
                        ${isActiveStep ? "z-30" : isNext ? "z-20" : "z-10"}
                      `}
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isActiveStep
                          ? isHovering
                            ? "translateX(0) rotateY(0deg) scale(1) translateZ(20px)"
                            : "translateX(0) rotateY(0deg) scale(1)"
                          : isNext
                          ? isHovering
                            ? "translateX(55%) rotateY(-20deg) scale(0.75)"
                            : "translateX(50%) rotateY(-20deg) scale(0.8)"
                          : isPrev
                          ? isHovering
                            ? "translateX(-55%) rotateY(20deg) scale(0.75)"
                            : "translateX(-50%) rotateY(20deg) scale(0.8)"
                          : "translateX(0) scale(0)",
                        opacity: isActiveStep ? 1 : isHovering ? 0.5 : 0.6,
                        zIndex: isActiveStep ? (isHovering ? 50 : 30) : isNext ? 20 : 10,
                      }}
                      onMouseEnter={() => {
                        if (isActiveStep) {
                          setIsHovering(true);
                        }
                      }}
                      onMouseLeave={() => {
                        setIsHovering(false);
                      }}
                    >
                      <div
                        className={`
                          w-full h-full bg-gradient-to-br ${step.gradient}
                          border-2 ${step.color.split(" ")[2]}
                          rounded-2xl p-5 md:p-6
                          text-center shadow-2xl
                          transition-all duration-300
                          ${isActiveStep && isHovering ? "scale-105 shadow-3xl" : ""}
                        `}
                        style={{
                          transformOrigin: "center center",
                        }}
                      >
                      {/* Stap nummer badge */}
                      <div className="absolute top-3 right-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          font-display font-bold text-sm
                          ${isActiveStep ? "bg-primary text-white shadow-lg" : "bg-white/80 text-gray-600"}
                          transition-all duration-300
                        `}>
                          {step.id}
                        </div>
                      </div>

                      {/* Icon met animatie */}
                      <div className="mb-4 flex justify-center mt-8">
                        <div className={`
                          w-16 h-16 rounded-full bg-white/80 flex items-center justify-center
                          shadow-xl transition-all duration-500
                          ${isActiveStep ? "scale-100 rotate-0" : "scale-90 rotate-12"}
                        `}>
                          <Icon className={`w-8 h-8 transition-all duration-500 ${step.color.split(" ")[1]}`} />
                        </div>
                      </div>

                      {/* Titel */}
                      <h3 className={`
                        font-display text-lg md:text-xl font-bold mb-2
                        transition-all duration-500
                        ${isActiveStep ? "text-foreground" : "text-muted-foreground"}
                      `}>
                        {step.title}
                      </h3>

                      {/* Beschrijving */}
                      <p className={`
                        font-sans text-sm md:text-base max-w-xs mx-auto
                        transition-all duration-500
                        ${isActiveStep ? "text-foreground opacity-100" : "text-muted-foreground opacity-70"}
                      `}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Stippellijn indicators - direct onder de vakken */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    transition-all duration-300
                    ${index === currentStep
                      ? "w-8 h-0.5 bg-primary/60 rounded-full"
                      : "w-1 h-1 bg-gray-200 rounded-full"
                    }
                  `}
                />
              ))}
            </div>

            {/* Stap teller */}
            <div className="text-center mt-3 mb-6">
              <p className="font-sans text-xs text-muted-foreground">
                Stap {currentStep + 1} van {steps.length}
              </p>
            </div>

            {/* Actie knop */}
            <div className="flex justify-center mt-8">
              <Link href="/login" className="group">
                <div className="relative">
                  {/* Glow effect achtergrond */}
                  <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 group-hover:opacity-75 group-hover:blur-2xl transition-all duration-500 animate-pulse-slow" />
                  
                  {/* Hoofd knop */}
                  <Button
                    size="lg"
                    className="relative font-display text-base md:text-lg px-10 md:px-14 py-7 md:py-8 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500 rounded-2xl hover:scale-110 active:scale-105 border-2 border-white/20 hover:border-white/40 overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative flex items-center gap-3 z-10">
                      <span className="font-bold">Dien nu je opdracht in</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 group-hover:scale-110" />
                    </span>
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
