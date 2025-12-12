import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DienstenPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Auxilium Incasso
          </Link>
          <nav className="flex gap-6">
            <Link href="/diensten" className="hover:text-primary font-semibold">Diensten</Link>
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

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Onze diensten</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Incasso</CardTitle>
              <CardDescription>Professionele incassodienst</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Wij helpen u bij het innen van openstaande facturen. Met jarenlange ervaring
                en een transparante werkwijze zorgen wij voor een efficiënte afhandeling van
                uw incassodossiers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No cure no pay</CardTitle>
              <CardDescription>Alleen betalen bij succes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                U betaalt alleen wanneer de incasso succesvol is. Geen verborgen kosten,
                geen maandelijkse abonnementskosten. Transparant en eerlijk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Snelle behandeling</CardTitle>
              <CardDescription>Binnen 24 uur actie</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Na het indienen van een opdracht wordt deze binnen 24 uur behandeld.
                De debiteur ontvangt direct een betalingsverzoek per e-mail.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Online portaal</CardTitle>
              <CardDescription>Altijd inzicht in uw dossiers</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Via ons klantenportaal heeft u altijd inzicht in de status van uw
                incassodossiers. U kunt nieuwe opdrachten indienen en de voortgang volgen.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button size="lg">Start nu met incasso</Button>
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

