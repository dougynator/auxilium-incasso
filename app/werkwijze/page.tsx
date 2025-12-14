import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Search, MessageSquare, Mail, Phone, FileText, AlertTriangle, CheckCircle2, Clock, Send, Scale, ArrowRight } from "lucide-react";

const werkwijzeSteps = [
  {
    number: 1,
    title: "Gevoeligheidsscan",
    description: "Na het ontvangen van ieder dossier laten wij eerst de gevoeligheid hiervan scannen. Zijn het vaste klanten waar men goede relaties mee heeft? Is de factuur recent vervallen? Aan de hand van deze factoren kan ons systeem uitmaken of we beginnen met een reminder zonder bijkomende kosten of niet.",
    icon: Search,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    illustration: "scan",
  },
  {
    number: 2,
    title: "Eerste aanspreking",
    description: "Nadat ons systeem de gevoeligheid heeft bepaald, gaan we de klant voor de eerste keer aanspreken. Dit gebeurt op een vriendelijke en professionele manier, afgestemd op de relatie en situatie.",
    icon: MessageSquare,
    color: "bg-green-50 text-green-700 border-green-200",
    illustration: "contact",
  },
  {
    number: 3,
    title: "Intensieve opvolging",
    description: "Nog steeds geen betaling na 3-5 werkdagen? Dan gaan we over tot een intensievere opvolging: we sturen een reminder, een aangetekende zending en voeren een persoonlijke call uit. We blijven professioneel maar maken duidelijk dat betaling verwacht wordt.",
    icon: Phone,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    illustration: "followup",
  },
  {
    number: 4,
    title: "Ultimatum en juridische stappen",
    description: "Nog steeds geen betaling? Dan gaan we over tot een ultimatum waarbij we duidelijk maken dat de volgende stappen juridisch zullen zijn. We geven een laatste kans, maar maken ook duidelijk dat we niet aarzelen om juridische stappen te ondernemen indien nodig.",
    icon: Scale,
    color: "bg-red-50 text-red-700 border-red-200",
    illustration: "ultimatum",
  },
];

export default function WerkwijzePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="werkwijze" />

      <main className="flex-1">
        {/* Hero sectie */}
        <section className="py-8 md:py-10 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
                Onze werkwijze
              </h1>
              <p className="font-sans text-lg text-muted-foreground">
                Een transparant en professioneel proces voor het innen van uw onbetaalde facturen
              </p>
            </div>
          </div>
        </section>

        {/* Stappen */}
        <section className="py-8 md:py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              {werkwijzeSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {/* Verbindingslijn tussen stappen */}
                    {index < werkwijzeSteps.length - 1 && (
                      <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-primary/30 to-transparent z-0" />
                    )}

                    <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-6 p-6">
                        {/* Links: Tekst */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full ${step.color.split(' ')[0]} flex items-center justify-center flex-shrink-0 border-4 border-white shadow-lg`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-0.5">
                                Stap {step.number}
                              </div>
                              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                                {step.title}
                              </h2>
                            </div>
                          </div>
                          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Rechts: Illustratie */}
                        <div className="flex items-center justify-center">
                          {step.illustration === "scan" && (
                            <div className="w-full max-w-sm">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                                      <Search className="w-10 h-10 text-blue-700" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="h-3 bg-blue-200 rounded w-full" />
                                    <div className="h-3 bg-blue-200 rounded w-3/4" />
                                    <div className="h-3 bg-blue-200 rounded w-5/6" />
                                  </div>
                                  <div className="flex gap-2 justify-center mt-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.illustration === "contact" && (
                            <div className="w-full max-w-sm">
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-green-200">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center">
                                      <MessageSquare className="w-10 h-10 text-green-700" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-md" />
                                    <div className="flex flex-col gap-2">
                                      <div className="h-2 bg-green-200 rounded w-24" />
                                      <div className="h-2 bg-green-200 rounded w-16" />
                                    </div>
                                  </div>
                                  <div className="mt-4 flex justify-center">
                                    <Mail className="w-6 h-6 text-green-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.illustration === "followup" && (
                            <div className="w-full max-w-sm">
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border-2 border-orange-200">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-center mb-4 gap-3">
                                    <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                                      <Phone className="w-8 h-8 text-orange-700" />
                                    </div>
                                    <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                                      <Send className="w-8 h-8 text-orange-700" />
                                    </div>
                                    <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                                      <Mail className="w-8 h-8 text-orange-700" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="h-2 bg-orange-200 rounded w-full" />
                                    <div className="h-2 bg-orange-200 rounded w-4/5" />
                                  </div>
                                  <div className="flex items-center justify-center gap-2 mt-4">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <span className="text-xs font-semibold text-orange-700">3-5 werkdagen</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.illustration === "ultimatum" && (
                            <div className="w-full max-w-sm">
                              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8 border-2 border-red-200">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-red-200 rounded-full flex items-center justify-center">
                                      <Scale className="w-10 h-10 text-red-700" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center mb-2">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="h-3 bg-red-200 rounded w-full" />
                                    <div className="h-3 bg-red-200 rounded w-3/4 mx-auto" />
                                  </div>
                                  <div className="mt-4 text-center">
                                    <div className="inline-block px-4 py-2 bg-red-200 rounded-lg">
                                      <span className="text-xs font-bold text-red-700">ULTIMATUM</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                Dien nu uw opdracht in en laat ons professioneel te werk gaan
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

