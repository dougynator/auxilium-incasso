"use client";

// Tijdelijke placeholder logo's - vervang later met echte logo's
const clientLogos = [
  { id: 1, name: "Client 1", placeholder: "Logo 1" },
  { id: 2, name: "Client 2", placeholder: "Logo 2" },
  { id: 3, name: "Client 3", placeholder: "Logo 3" },
  { id: 4, name: "Client 4", placeholder: "Logo 4" },
  { id: 5, name: "Client 5", placeholder: "Logo 5" },
  { id: 6, name: "Client 6", placeholder: "Logo 6" },
  { id: 7, name: "Client 7", placeholder: "Logo 7" },
  { id: 8, name: "Client 8", placeholder: "Logo 8" },
];

export default function ClientsCarousel() {
  // Dupliceer de logos voor oneindige scroll
  const duplicatedLogos = [...clientLogos, ...clientLogos];

  return (
    <section className="py-10 md:py-12 bg-gradient-to-b from-gray-50/30 via-white to-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center relative">
          {/* Decoratief element */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary/20 rounded-full" />
          <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-2">
            Bedrijven die op ons vertrouwen
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            Wij werken samen met toonaangevende bedrijven
          </p>
        </div>
      </div>

      {/* Eerste rij - scrollt naar links - volledig van rand tot rand */}
      <div className="overflow-hidden mb-6 w-full">
        <div className="flex animate-scroll-left">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`row1-${logo.id}-${index}`}
              className="flex-shrink-0 mx-4 w-32 h-20 md:w-40 md:h-24 flex items-center justify-center"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 grayscale hover:grayscale-0 transition-all duration-300 hover:border-primary/50 hover:scale-105">
                <span className="text-xs md:text-sm font-display font-semibold text-gray-600">
                  {logo.placeholder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tweede rij - scrollt naar rechts - volledig van rand tot rand */}
      <div className="overflow-hidden w-full">
        <div className="flex animate-scroll-right">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`row2-${logo.id}-${index}`}
              className="flex-shrink-0 mx-4 w-32 h-20 md:w-40 md:h-24 flex items-center justify-center"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 grayscale hover:grayscale-0 transition-all duration-300 hover:border-primary/50 hover:scale-105">
                <span className="text-xs md:text-sm font-display font-semibold text-gray-600">
                  {logo.placeholder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

