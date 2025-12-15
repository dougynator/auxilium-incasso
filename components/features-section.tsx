"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "No cure - no pay",
    description: "U betaalt alleen bij succes",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    title: "Voor alle bedragen",
    description: "Geen minimum of maximum",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    title: "Onmiddellijk resultaat",
    description: "Direct actie, geen wachttijd",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    title: "B2B & B2C",
    description: "Voor bedrijven én consumenten",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export default function FeaturesSection() {
  return (
    <section className="pt-8 md:pt-12 pb-10 md:pb-12 bg-gradient-to-b from-white via-primary/3 to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center max-w-6xl mx-auto">
          {/* Links: Tekst content */}
          <div className="space-y-6 text-center md:text-left">
            {/* Titel */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl lg:text-3xl font-bold text-foreground mb-3 leading-tight">
                Wij kiezen voor betaalde facturen.
                <br />
                <span className="text-primary">Kies jij voor Auxilium?</span>
              </h2>
            </div>

            {/* Voordelen in gekleurde vakken */}
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`
                    ${feature.color}
                    border-2 rounded-lg p-3
                    transform transition-all duration-300
                    hover:scale-105 hover:shadow-lg
                  `}
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-0.5">
                        {feature.title}
                      </h3>
                      <p className="font-sans text-xs opacity-90">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Integraties tekst */}
            <div className="pt-4">
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Directe actie, geen wachttijd.
                </span>
                <br />
                <span className="mt-1.5 block">
                  Door middel van slimme integraties en geautomatiseerde workflows zorgen wij ervoor dat uw opdracht 
                  <span className="font-semibold text-primary"> meteen in handen wordt genomen</span>. 
                  Van ontvangst tot eerste actie: <span className="font-semibold text-primary">direct resultaat, geen vertraging.</span>
                </span>
              </p>
            </div>
          </div>

          {/* Rechts: Foto met twist */}
          <div className="relative">
            <div className="relative aspect-square w-full max-w-sm mx-auto">
              {/* Decoratieve elementen voor twist */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
              
              {/* Foto container met twist effect */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Placeholder voor foto - vervang met echte foto */}
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-primary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Image
                        src="/images/logo.png"
                        alt="Auxilium Incasso"
                        width={60}
                        height={60}
                        className="opacity-50"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Plaats hier uw foto
                    </p>
                  </div>
                </div>
                
                {/* Alternatief: als je een foto hebt, gebruik dan dit */}
                {/* 
                <Image
                  src="/images/feature-image.jpg"
                  alt="Auxilium Incasso team"
                  fill
                  className="object-cover"
                  priority
                />
                */}
              </div>
              
              {/* Decoratieve hoek accent */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-primary rounded-2xl transform rotate-12 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

