import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OverOnsPage() {
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
            <Link href="/over-ons" className="hover:text-primary font-semibold">Over ons</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login">
              <Button variant="outline">Klantenportaal</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Over Auxilium Incasso</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">
            Auxilium Incasso is een professioneel incassobureau dat zich richt op
            snelle en efficiënte incasso met transparante prijzen.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Onze missie</h2>
          <p>
            Wij geloven in transparantie, efficiëntie en klantgerichtheid. Met ons
            no cure no pay principe betaalt u alleen wanneer de incasso succesvol is.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Waarom Auxilium Incasso?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Transparante prijzen zonder verborgen kosten</li>
            <li>Snelle behandeling binnen 24 uur</li>
            <li>Online portaal voor volledige transparantie</li>
            <li>Ervaren team met jarenlange expertise</li>
            <li>No cure no pay principe</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link href="/contact">
            <Button size="lg">Neem contact op</Button>
          </Link>
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

