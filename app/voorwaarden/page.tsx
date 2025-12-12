import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VoorwaardenPage() {
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
                <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="/voorwaarden" className="hover:text-primary font-semibold">Voorwaarden</Link></li>
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

