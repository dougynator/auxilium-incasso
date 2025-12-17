import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-primary/5 to-white">
      <Header showPortalButton={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo of titel */}
          <div className="mb-8">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">
              Binnenkort beschikbaar
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Hoofdtekst */}
          <div className="mb-12">
            <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed">
              We werken hard aan iets geweldigs!
            </p>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Auxilium Incasso lanceert binnenkort een modern incassoplatform waarmee u 
              onbetaalde facturen snel en efficiënt kunt innen. 
              <span className="font-semibold text-primary"> No cure no pay</span> - u betaalt alleen bij succes.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                Snel & Efficiënt
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                Opdrachten worden binnen 24 uur behandeld
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                Transparant
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                Geen verborgen kosten, duidelijke tarieven
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                Modern Platform
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                Eenvoudig online opdrachten indienen en volgen
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="font-sans text-lg font-medium text-foreground mb-6">
              Blijf op de hoogte van onze lancering
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg font-display font-semibold">
                  Neem contact op
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-display font-semibold border-2"
                >
                  Inloggen
                </Button>
              </Link>
            </div>
          </div>

          {/* Countdown of datum (optioneel) */}
          <div className="mt-12 pt-8 border-t border-primary/10">
            <p className="font-sans text-sm text-muted-foreground">
              Verwacht: Q1 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
