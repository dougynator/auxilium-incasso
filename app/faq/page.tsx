import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                <li><Link href="/faq" className="hover:text-primary font-semibold">FAQ</Link></li>
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

