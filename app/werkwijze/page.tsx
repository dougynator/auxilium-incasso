import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function WerkwijzePage() {
  const steps = [
    {
      number: 1,
      title: "Opdracht indienen",
      description: "Log in op het klantenportaal en dien een nieuwe opdracht in met de gegevens van de debiteur en factuur.",
    },
    {
      number: 2,
      title: "Automatische verzending",
      description: "Het systeem stuurt automatisch een betalingsverzoek naar de debiteur per e-mail met een PDF bijlage.",
    },
    {
      number: 3,
      title: "Betaling volgen",
      description: "U kunt de status van de opdracht volgen via het klantenportaal. De debiteur kan direct betalen via de link.",
    },
    {
      number: 4,
      title: "Afhandeling",
      description: "Zodra de betaling is ontvangen, wordt de opdracht afgesloten. U betaalt alleen bij succesvolle incasso.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header currentPage="werkwijze" />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Onze werkwijze</h1>

        <div className="space-y-8 mb-12">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

