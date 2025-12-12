import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PrijzenPage() {
  // Example calculation
  const principalAmount = 1000;
  const additionalCosts = 50; // Example: 5% or fixed fee
  const totalAmount = principalAmount + additionalCosts;

  return (
    <div className="min-h-screen">
      <Header currentPage="prijzen" />

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

      <Footer />
    </div>
  );
}

