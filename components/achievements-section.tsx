"use client";

import Image from "next/image";
import { Star } from "lucide-react";

const achievements = [
  {
    number: "+100",
    title: "bedrijven",
    description: "die door de hulp van Auxilium hun onbetaalde facturen konden innen",
    color: "text-primary",
  },
  {
    number: "€ 1.234.567",
    title: "",
    description: "aan onbetaalde facturen die geïnd werden voor onze klanten",
    color: "text-green-600",
  },
  {
    number: "89%",
    title: "succesrate",
    description: "werken met Auxilium zorgt voor een bijna garantie op betaalde facturen",
    color: "text-orange-600",
  },
  {
    number: "+4,7",
    title: "",
    subtitle: "klantentevredenheid",
    description: "",
    color: "text-purple-600",
    showStars: true,
  },
];

export default function AchievementsSection() {
  return (
    <section className="pt-8 md:pt-12 pb-10 md:pb-12 bg-gradient-to-b from-gray-50/30 via-white to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Links: Overlappende afbeeldingen */}
          <div className="relative h-[280px] md:h-[320px]">
            {/* Eerste afbeelding - achter */}
            <div className="absolute left-0 top-0 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-blue-100 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Image
                      src="/images/logo.png"
                      alt="Auxilium Incasso"
                      width={40}
                      height={40}
                      className="opacity-50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Foto 1</p>
                </div>
              </div>
              {/* 
              <Image
                src="/images/achievement-1.jpg"
                alt="Auxilium realisatie 1"
                fill
                className="object-cover"
              />
              */}
            </div>

            {/* Tweede afbeelding - voor */}
            <div className="absolute right-0 bottom-0 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20">
              <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-300/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Image
                      src="/images/logo.png"
                      alt="Auxilium Incasso"
                      width={40}
                      height={40}
                      className="opacity-50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Foto 2</p>
                </div>
              </div>
              {/* 
              <Image
                src="/images/achievement-2.jpg"
                alt="Auxilium realisatie 2"
                fill
                className="object-cover"
              />
              */}
            </div>

            {/* Decoratieve elementen */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          {/* Rechts: Statistieken */}
          <div className="space-y-5">
            {/* Titel */}
            <div className="mb-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Realisaties
              </h2>
            </div>

            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="border-l-4 border-primary/20 pl-4 py-1.5"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className={`font-display text-2xl md:text-3xl font-bold ${achievement.color}`}>
                    {achievement.number}
                  </span>
                  {achievement.title && (
                    <span className="font-display text-lg md:text-xl font-bold text-foreground">
                      {achievement.title}
                    </span>
                  )}
                  {/* Sterren illustratie naast 4,7 */}
                  {achievement.showStars && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="relative w-4 h-4">
                          {/* Grijze achtergrond ster */}
                          <Star className="absolute inset-0 w-4 h-4 fill-gray-200 text-gray-200" />
                          {/* Gele ster - volledig voor 1-4, gedeeltelijk voor 5 */}
                          {star <= 4 ? (
                            <Star className="absolute inset-0 w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <div className="absolute inset-0 overflow-hidden" style={{ width: "70%" }}>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {achievement.subtitle && (
                  <p className={`font-sans text-sm text-foreground ${index === 3 ? "" : "font-semibold"}`}>
                    {achievement.subtitle}
                  </p>
                )}
                {achievement.description && (
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed mt-1">
                    {achievement.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

