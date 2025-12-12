import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Auxilium Incasso
          </Link>
          <nav className="flex gap-6">
            <Link href="/diensten" className="hover:text-primary">Diensten</Link>
            <Link href="/werkwijze" className="hover:text-primary">Werkwijze</Link>
            <Link href="/prijzen" className="hover:text-primary">Prijzen</Link>
            <Link href="/over-ons" className="hover:text-primary">Over ons</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login">
              <Button variant="outline">Klantenportaal</Button>
            </Link>
          </nav>
        </div>
      </header>

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

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Auxilium Incasso</h3>
              <p className="text-sm text-muted-foreground">
                Professioneel incassobureau
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-primary font-semibold">Privacy</Link></li>
                <li><Link href="/voorwaarden" className="hover:text-primary">Voorwaarden</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">
                <Link href="/contact" className="hover:text-primary">Contact opnemen</Link>
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Klantenportaal</h3>
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="hover:text-primary">Inloggen</Link>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Auxilium Incasso. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
}

