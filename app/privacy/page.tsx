import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacybeleid</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Laatst bijgewerkt: {new Date().toLocaleDateString("nl-BE")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Inleiding</h2>
          <p>
            Auxilium Incasso respecteert uw privacy en zet zich in voor de bescherming van uw
            persoonlijke gegevens. Dit privacybeleid legt uit hoe wij uw gegevens verzamelen,
            gebruiken en beschermen.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Gegevens die wij verzamelen</h2>
          <p>
            Wij verzamelen gegevens die u aan ons verstrekt wanneer u:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Een account aanmaakt</li>
            <li>Een opdracht indient</li>
            <li>Contact met ons opneemt</li>
            <li>Onze website bezoekt</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Hoe wij uw gegevens gebruiken</h2>
          <p>
            Wij gebruiken uw gegevens om:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Onze diensten te leveren</li>
            <li>Met u te communiceren</li>
            <li>Onze diensten te verbeteren</li>
            <li>Te voldoen aan wettelijke verplichtingen</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Uw rechten</h2>
          <p>
            U heeft het recht om:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Toegang te krijgen tot uw gegevens</li>
            <li>Uw gegevens te corrigeren</li>
            <li>Uw gegevens te verwijderen</li>
            <li>Bezwaar te maken tegen de verwerking</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact</h2>
          <p>
            Voor vragen over dit privacybeleid kunt u contact met ons opnemen via{" "}
            <Link href="/contact" className="text-primary">het contactformulier</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

