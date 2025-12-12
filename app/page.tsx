import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroVideo from "@/components/hero-video";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Section met Video */}
        <HeroVideo />

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

      <Footer />
    </div>
  );
}

