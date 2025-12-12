import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function OverOnsPage() {
  return (
    <div className="min-h-screen">
      <Header currentPage="over-ons" />

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

      <Footer />
    </div>
  );
}

