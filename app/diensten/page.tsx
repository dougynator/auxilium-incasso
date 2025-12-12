import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function DienstenPage() {
  return (
    <div className="min-h-screen">
      <Header currentPage="diensten" />

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

      <Footer />
    </div>
  );
}

