import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
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

      <main>
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Professioneel incassobureau
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Snelle en efficiënte incasso met transparante prijzen. 
              No cure no pay principe.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Dien opdracht in
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Waarom Auxilium Incasso?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Snel</h3>
                <p className="text-muted-foreground">
                  Snelle behandeling van uw incassodossiers
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-semibold mb-2">Professioneel</h3>
                <p className="text-muted-foreground">
                  Ervaren team met jarenlange expertise
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Transparant</h3>
                <p className="text-muted-foreground">
                  Geen verborgen kosten, duidelijke prijzen
                </p>
              </div>
            </div>
          </div>
        </section>
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

