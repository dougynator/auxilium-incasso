import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function PrijzenPage() {
  // Example calculation
  const principalAmount = 1000;
  const additionalCosts = 50; // Example: 5% or fixed fee
  const totalAmount = principalAmount + additionalCosts;

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
            <Link href="/prijzen" className="hover:text-primary font-semibold">Prijzen</Link>
            <Link href="/over-ons" className="hover:text-primary">Over ons</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login">
              <Button variant="outline">Klantenportaal</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Prijzen</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>No cure no pay</CardTitle>
            <CardDescription>Alleen betalen bij succesvolle incasso</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Bij Auxilium Incasso betaalt u alleen wanneer de incasso succesvol is.
              Geen verborgen kosten, geen maandelijkse abonnementskosten.
            </p>
            <p className="mb-4">
              De kosten bestaan uit een percentage van het geïnde bedrag of een vast bedrag,
              afhankelijk van de hoogte van de vordering. Neem contact met ons op voor
              een gedetailleerde offerte.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Voorbeeld berekening</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Hoofdsom:</span>
                  <span>{formatCurrency(principalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incassokosten (5%):</span>
                  <span>{formatCurrency(additionalCosts)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Totaal te betalen door debiteur:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  U betaalt alleen wanneer de debiteur betaalt.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/contact">
            <Button size="lg">Vraag een offerte aan</Button>
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

