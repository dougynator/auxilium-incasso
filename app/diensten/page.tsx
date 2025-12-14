import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FileText, Search, MessageSquare, CreditCard, Clock, Shield, ArrowRight } from "lucide-react";

const incassoServices = [
  {
    icon: FileText,
    title: "Eenvoudige opdracht indiening",
    description: "Dien uw incasso-opdracht eenvoudig in via ons online portaal. Upload de benodigde documenten en geef alle relevante informatie door. Binnen enkele minuten is uw opdracht geregistreerd.",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: Search,
    title: "Automatische controle",
    description: "Ons geavanceerde systeem controleert automatisch alle ingediende informatie op volledigheid en correctheid. We verifiëren de gegevens van de schuldenaar en controleren de geldigheid van de vordering.",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    icon: MessageSquare,
    title: "Professioneel contact",
    description: "We nemen direct contact op met de schuldenaar via verschillende kanalen. Onze ervaren medewerkers werken aan een snelle en vriendelijke oplossing voor uw vordering.",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    icon: CreditCard,
    title: "No cure - no pay",
    description: "U betaalt alleen wanneer de incasso succesvol is. Geen resultaat, geen kosten. Onze transparante prijsstructuur betekent dat u altijd weet waar u aan toe bent.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    icon: Clock,
    title: "Snelle behandeling",
    description: "Binnen 24 uur na het indienen van uw opdracht worden de eerste stappen gezet. Geen wachttijden, geen vertraging - direct resultaat.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: Shield,
    title: "Voor alle bedragen",
    description: "Of het nu gaat om kleine of grote bedragen, wij helpen u bij het innen van uw onbetaalde facturen. Geen minimum of maximum bedrag.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

export default function DienstenPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="diensten" />

      <main className="flex-1">
        {/* Incasso Sectie */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Titel */}
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
                  Incasso
                </h1>
                <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                  Professionele incassodiensten voor het efficiënt innen van uw onbetaalde facturen. 
                  Transparant, snel en betrouwbaar.
                </p>
              </div>

              {/* Service vakken */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {incassoServices.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={index}
                      className={`
                        ${service.color}
                        border-2 rounded-xl p-6
                        transform transition-all duration-300
                        hover:scale-105 hover:shadow-lg
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Icon className="w-6 h-6 mt-1" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg mb-2">
                            {service.title}
                          </h3>
                          <p className="font-sans text-sm leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Call to action */}
              <div className="text-center">
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
          </div>
        </section>

        {/* Debiteurenbeheer Sectie */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-white to-primary/3">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Titel */}
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                  Debiteurenbeheer
                </h2>
                <div className="w-20 h-1 bg-primary/30 rounded-full mx-auto" />
              </div>

              {/* Content in een andere layout */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border-2 border-primary/10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Links: Tekst */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                        Volledig automatisch factuurbeheer
                      </h3>
                      <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed">
                        Bij Auxilium zorgen wij ervoor dat alle aankoopfacturen in uw systeem 
                        automatisch worden onderhouden en opgevolgd. Wij monitoren uw openstaande facturen 
                        en zorgen voor tijdige betaling, zodat u zich geen zorgen hoeft te maken.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <p className="font-sans text-sm md:text-base text-muted-foreground">
                          Automatische opvolging van alle aankoopfacturen
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <p className="font-sans text-sm md:text-base text-muted-foreground">
                          Proactieve monitoring en tijdige betaling
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <p className="font-sans text-sm md:text-base text-muted-foreground">
                          Geen zorgen meer over gemiste betalingen
                        </p>
                      </div>
                    </div>

                    {/* Contact knop */}
                    <div className="pt-6">
                      <Link href="/contact">
                        <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Neem contact met ons op
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Rechts: Visueel element - Openstaande facturen overzicht */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-white rounded-xl p-6 border-2 border-primary/20">
                      {/* Titel */}
                      <div className="mb-4 pb-3 border-b border-primary/20">
                        <h4 className="font-display font-semibold text-sm text-foreground">Openstaande facturen</h4>
                        <p className="font-sans text-xs text-muted-foreground">Klant: ABC Bedrijf BV</p>
                      </div>

                      {/* Facturen lijst */}
                      <div className="space-y-3">
                        {/* Factuur 1 - In behandeling */}
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-orange-400">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="h-2 w-32 bg-gray-300 rounded mb-1.5" />
                              <div className="h-1.5 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="px-2 py-1 bg-orange-100 rounded text-xs font-semibold text-orange-700">
                              In behandeling
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <div className="h-1 w-24 bg-primary/20 rounded" />
                          </div>
                        </div>

                        {/* Factuur 2 - In behandeling */}
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-400">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="h-2 w-28 bg-gray-300 rounded mb-1.5" />
                              <div className="h-1.5 w-24 bg-gray-200 rounded" />
                            </div>
                            <div className="px-2 py-1 bg-blue-100 rounded text-xs font-semibold text-blue-700">
                              In behandeling
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <div className="h-1 w-20 bg-primary/20 rounded" />
                          </div>
                        </div>

                        {/* Factuur 3 - Betaald */}
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-400 opacity-75">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="h-2 w-30 bg-gray-300 rounded mb-1.5" />
                              <div className="h-1.5 w-18 bg-gray-200 rounded" />
                            </div>
                            <div className="px-2 py-1 bg-green-100 rounded text-xs font-semibold text-green-700">
                              Betaald
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <div className="h-1 w-16 bg-green-200 rounded" />
                          </div>
                        </div>
                      </div>

                      {/* Proces indicator */}
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                          <p className="font-sans text-xs text-muted-foreground">
                            Systeem monitort en volgt op
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Decoratieve elementen */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

