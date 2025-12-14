import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CheckCircle2, TrendingDown, ArrowRight } from "lucide-react";

const pricingTiers = [
  {
    range: "Tot €500",
    from: 0,
    to: 500,
    percentage: 10,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    range: "€500 - €5.000",
    from: 500,
    to: 5000,
    percentage: 8,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    range: "€5.000 - €15.000",
    from: 5000,
    to: 15000,
    percentage: 6,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    range: "€15.000 - €25.000",
    from: 15000,
    to: 25000,
    percentage: 4,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    range: "Boven €25.000",
    from: 25000,
    to: null,
    percentage: 3,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

export default function PrijzenPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="prijzen" />

      <main className="flex-1">
        {/* Hero sectie */}
        <section className="py-8 md:py-10 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
                Onze prijzen
              </h1>
              <p className="font-sans text-lg text-muted-foreground mb-4">
                Transparante en eerlijke prijzen - alleen betalen bij succes
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-sans font-semibold text-green-700">Geen resultaat, geen commissie</span>
              </div>
            </div>
          </div>
        </section>

        {/* Prijzen tabel */}
        <section className="py-8 md:py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Intro tekst */}
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Onze tarieven
                </h2>
                <p className="font-sans text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Wij werken met een progressief tarief. Hoe hoger het factuurbedrag, hoe lager het percentage. 
                  Dit maakt onze dienst voordelig voor zowel kleine als grote bedragen.
                </p>
              </div>

              {/* Prijzen grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {pricingTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`
                      ${tier.color}
                      border-2 rounded-lg p-4
                      transform transition-all duration-300
                      hover:scale-105 hover:shadow-lg
                      flex flex-col items-center text-center
                    `}
                  >
                    {/* Range eerst */}
                    <h3 className="font-display font-semibold text-base mb-3">
                      {tier.range}
                    </h3>

                    {/* Percentage badge */}
                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/90 rounded-full shadow-sm">
                        <span className="font-display font-bold text-2xl">{tier.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra info */}
              <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-white rounded-2xl p-6 border-2 border-primary/10">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                      No cure - no pay
                    </h3>
                    <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">
                      Bij Auxilium betaalt u alleen wanneer de incasso succesvol is. Geen resultaat, 
                      geen kosten. Dit betekent dat u geen risico loopt - wij delen het risico met u.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="font-sans text-sm text-muted-foreground">
                        Geen vooruitbetalingen of maandelijkse kosten
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="font-sans text-sm text-muted-foreground">
                        Transparante prijzen zonder verborgen kosten
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="font-sans text-sm text-muted-foreground">
                        Progressief tarief - voordeliger bij hogere bedragen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-8 md:py-10 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Klaar om te starten?
              </h2>
              <p className="font-sans text-base md:text-lg text-muted-foreground mb-6">
                Dien nu uw opdracht in en betaal alleen bij succes
              </p>
              <Link href="/login" className="group inline-block">
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
