import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

const faqs = [
  {
    question: "Hoe werkt no cure no pay?",
    answer: "Bij no cure no pay betaalt u alleen wanneer de incasso succesvol is. Als de debiteur niet betaalt, betaalt u niets.",
  },
  {
    question: "Hoe snel wordt een opdracht behandeld?",
    answer: "Opdrachten worden binnen 24 uur behandeld. De debiteur ontvangt direct een betalingsverzoek per e-mail.",
  },
  {
    question: "Wat zijn de kosten?",
    answer: "De kosten bestaan uit een percentage van het geïnde bedrag of een vast bedrag, afhankelijk van de hoogte van de vordering. Neem contact met ons op voor een gedetailleerde offerte.",
  },
  {
    question: "Kan ik de status van mijn opdrachten volgen?",
    answer: "Ja, via het klantenportaal heeft u altijd inzicht in de status van uw incassodossiers.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Veelgestelde vragen</h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Heeft u nog vragen? Neem contact met ons op.
          </p>
          <Link href="/contact">
            <Button>Contact opnemen</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

