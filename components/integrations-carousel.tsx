"use client";

// Tijdelijke placeholder logo's - vervang later met echte logo's
const integrations = [
  { id: 1, name: "Integration 1" },
  { id: 2, name: "Integration 2" },
  { id: 3, name: "Integration 3" },
  { id: 4, name: "Integration 4" },
  { id: 5, name: "Integration 5" },
  { id: 6, name: "Integration 6" },
  { id: 7, name: "Integration 7" },
  { id: 8, name: "Integration 8" },
];

export default function IntegrationsCarousel() {
  // Dupliceer de integraties voor oneindige scroll
  const duplicatedIntegrations = [...integrations, ...integrations];

  return (
    <section className="py-6 md:py-8 bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Titel */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
              Integratiepartners
            </h2>
            <p className="font-sans text-base text-muted-foreground">
              Wij werken samen met
            </p>
          </div>

        </div>
      </div>

      {/* Scrollende logo's container - volledig van rand tot rand */}
      <div className="relative overflow-hidden w-full">
        {/* Scrollende logo's - één lijn, scrollt naar links (logo's komen van rechts) */}
        <div className="flex animate-scroll-left">
          {duplicatedIntegrations.map((integration, index) => (
            <div
              key={`${integration.id}-${index}`}
              className="flex-shrink-0 mx-4 w-32 h-20 md:w-40 md:h-24 flex items-center justify-center"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 grayscale hover:grayscale-0 transition-all duration-300 hover:border-primary/50 hover:scale-105">
                <span className="text-xs md:text-sm font-display font-semibold text-gray-600">
                  {integration.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

