import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Algemene voorwaarden</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Laatst bijgewerkt: {new Date().toLocaleDateString("nl-BE")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Toepasselijkheid</h2>
          <p>
            Deze algemene voorwaarden zijn van toepassing op alle diensten van Auxilium Incasso.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Diensten</h2>
          <p>
            Auxilium Incasso biedt incassodiensten aan volgens het no cure no pay principe.
            Dit betekent dat u alleen betaalt wanneer de incasso succesvol is.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Verantwoordelijkheden</h2>
          <p>
            De klant is verantwoordelijk voor het verstrekken van correcte en volledige gegevens.
            Auxilium Incasso is niet aansprakelijk voor schade als gevolg van onjuiste gegevens.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Betaling</h2>
          <p>
            Betaling vindt plaats na succesvolle incasso. De kosten worden in rekening gebracht
            volgens de overeengekomen tarieven.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact</h2>
          <p>
            Voor vragen over deze voorwaarden kunt u contact met ons opnemen via{" "}
            <Link href="/contact" className="text-primary">het contactformulier</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

