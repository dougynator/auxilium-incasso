"use client";

import { useState, useRef } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    id: 1,
    question: "Wat kost Auxilium?",
    answer: "Wij werken met vaste commissies per opgelost dossier. U betaalt alleen bij succes - geen resultaat, geen kosten. Onze transparante prijsstructuur betekent dat u altijd weet waar u aan toe bent, zonder verborgen kosten of verrassingen.",
  },
  {
    id: 2,
    question: "Kan Auxilium al mijn aankoopfacturen innen?",
    answer: "Absoluut! Voor klanten die hun volledige aankoopfacturatie aan ons willen overhandigen, zitten we eerst samen om de beste aanpak te bepalen. We hebben speciale formules ontwikkeld en kijken ook naar uw specifieke manier van werken, zodat we een op maat gemaakte oplossing kunnen bieden die perfect aansluit bij uw bedrijfsvoering.",
  },
  {
    id: 3,
    question: "Hoe verloopt het proces tot innen?",
    answer: "Bij elke opdracht gaat ons geavanceerde integratiesysteem eerst automatisch scannen of alle gegevens compleet en correct zijn. Vervolgens bepalen we de ernstgraad van de opdracht: is uw factuur nog maar net vervallen, dan sturen we een vriendelijke reminder. Is ze al langer vervallen, dan kiezen we voor een directere en krachtigere aanpak om snel resultaat te boeken.",
  },
  {
    id: 4,
    question: "Hoe snel kan Auxilium actie ondernemen?",
    answer: "Onmiddellijk! Zodra u uw opdracht indient via ons portaal, wordt deze meteen in ons systeem opgenomen. Onze geautomatiseerde workflows zorgen ervoor dat er binnen 24 uur al eerste stappen worden gezet. Geen wachttijden, geen vertraging - direct resultaat.",
  },
  {
    id: 5,
    question: "Werkt Auxilium voor zowel B2B als B2C?",
    answer: "Ja, wij helpen zowel bedrijven (B2B) als consumenten (B2C) met het innen van onbetaalde facturen. Onze ervaring en expertise strekt zich uit over beide markten, waardoor we voor elke situatie de juiste aanpak kunnen bieden. Of het nu gaat om zakelijke facturen of consumentenvorderingen, wij zorgen voor professionele behandeling.",
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleItem = (id: number) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setCursorPos({ x: -1000, y: -1000 });
  };

  return (
    <section className="py-8 md:py-10">
      <div className="w-full relative overflow-hidden">
        {/* Decoratieve achtergrond elementen */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Groot blauw vak container met dynamisch cursor effect */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          {/* Witte achtergrond (basis) */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/50 border-y-2 border-primary/10" />
          
          {/* Blauwe achtergrond met radial gradient mask rond cursor */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-y-2 border-primary/30 transition-opacity duration-200"
            style={{
              maskImage: `radial-gradient(circle 400px at ${cursorPos.x}px ${cursorPos.y}px, transparent 0%, black 30%)`,
              WebkitMaskImage: `radial-gradient(circle 400px at ${cursorPos.x}px ${cursorPos.y}px, transparent 0%, black 30%)`,
            }}
          />
          
          <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Titel */}
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Veelgestelde vragen
                </h2>
                <p className="font-sans text-sm text-muted-foreground">
                  Alles wat u wilt weten over Auxilium Incasso
                </p>
              </div>

              {/* FAQ Items - 2 kolommen op desktop */}
              <div className="flex flex-col md:flex-row md:gap-3">
                {/* Linker kolom */}
                <div className="flex-1 space-y-3">
                  {faqs.filter((_, index) => index % 2 === 0).map((faq) => {
                    const isOpen = openItem === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`
                          bg-white/90 backdrop-blur-sm border-2 border-primary/20 rounded-lg overflow-hidden
                          transition-all duration-500 ease-out relative z-10
                          ${isOpen 
                            ? "border-primary/60 shadow-lg scale-[1.01]" 
                            : "hover:border-primary/40 hover:shadow-md"
                          }
                        `}
                      >
                      {/* Vraag - klikbaar */}
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left group"
                      >
                        <h3 className={`
                          font-display text-sm md:text-base font-semibold flex-1 transition-colors duration-300 leading-tight
                          ${isOpen 
                            ? "text-primary" 
                            : "text-foreground group-hover:text-primary"
                          }
                        `}>
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            transition-all duration-500 ease-out
                            ${isOpen
                              ? "bg-primary text-white rotate-180 scale-105"
                              : "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-105"
                            }
                          `}>
                            {isOpen ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Antwoord - accordion met soepele animatie */}
                      <div
                        className={`
                          grid transition-all duration-300 ease-in-out
                          ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                        `}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div className="px-4 pb-4 pt-2">
                            <p className="font-sans text-xs md:text-sm leading-relaxed text-muted-foreground">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Rechter kolom */}
                <div className="flex-1 space-y-3">
                  {faqs.filter((_, index) => index % 2 === 1).map((faq) => {
                    const isOpen = openItem === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`
                          bg-white/90 backdrop-blur-sm border-2 border-primary/20 rounded-lg overflow-hidden
                          transition-all duration-500 ease-out relative z-10
                          ${isOpen 
                            ? "border-primary/60 shadow-lg scale-[1.01]" 
                            : "hover:border-primary/40 hover:shadow-md"
                          }
                        `}
                      >
                        {/* Vraag - klikbaar */}
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left group"
                        >
                          <h3 className={`
                            font-display text-sm md:text-base font-semibold flex-1 transition-colors duration-300 leading-tight
                            ${isOpen 
                              ? "text-primary" 
                              : "text-foreground group-hover:text-primary"
                            }
                          `}>
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              transition-all duration-500 ease-out
                              ${isOpen
                                ? "bg-primary text-white rotate-180 scale-105"
                                : "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-105"
                              }
                            `}>
                              {isOpen ? (
                                <Minus className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Antwoord - accordion met soepele animatie */}
                        <div
                          className={`
                            grid transition-all duration-300 ease-in-out
                            ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                          `}
                        >
                          <div className="overflow-hidden min-h-0">
                            <div className="px-4 pb-4 pt-2">
                              <p className="font-sans text-xs md:text-sm leading-relaxed text-muted-foreground">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

