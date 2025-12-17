import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Calendar, Award, Heart, Users, TrendingUp, ArrowRight, ArrowDown } from "lucide-react";

export default async function OverOnsPage() {
  const t = await getTranslations('about');

  const timelineEvents = [
    {
      year: t('timeline.founding.year'),
      title: t('timeline.founding.title'),
      description: t('timeline.founding.description'),
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      side: "left",
    },
    {
      year: t('timeline.trusted.year'),
      title: t('timeline.trusted.title'),
      description: t('timeline.trusted.description'),
      icon: Award,
      color: "bg-green-50 text-green-700 border-green-200",
      side: "right",
    },
    {
      year: t('timeline.anniversary.year'),
      title: t('timeline.anniversary.title'),
      description: t('timeline.anniversary.description'),
      icon: Heart,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      side: "left",
    },
    {
      year: t('timeline.takeover.year'),
      title: t('timeline.takeover.title'),
      description: t('timeline.takeover.description'),
      icon: Users,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      side: "right",
    },
    {
      year: t('timeline.modern.year'),
      title: t('timeline.modern.title'),
      description: t('timeline.modern.description'),
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      side: "left",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="over-ons" />

      <main className="flex-1">
        {/* Hero sectie */}
        <section className="py-8 md:py-10 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
                {t('title')}
              </h1>
              <p className="font-sans text-lg text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Tijdlijn */}
        <section className="py-8 md:py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Verticale stippellijn - precies door het midden van de iconen */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full hidden md:block">
                  {/* Stippellijn - start vanaf het midden van de eerste icon (40px = w-20/2) */}
                  <div className="h-[calc(100%-6rem)] mt-10 border-l-2 border-dashed border-primary/60" />
                  
                  {/* Pijl aan het einde */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                    <ArrowDown className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                {/* Tijdlijn events */}
                <div className="space-y-16 md:space-y-20">
                  {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    return (
                      <div key={index} className="relative">
                        {/* Event content */}
                        <div className={`
                          flex flex-col md:flex-row items-center gap-6
                          ${event.side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}
                        `}>
                          {/* Links/Rechts: Tekst en illustratie */}
                          <div className={`
                            ${event.side === 'left' ? 'md:w-5/12 md:text-right' : 'md:w-5/12 md:text-left'}
                            w-full md:w-5/12
                          `}>
                            <div className={`
                              ${event.color}
                              border-2 rounded-xl p-6
                              transform transition-all duration-300
                              hover:scale-105 hover:shadow-lg
                            `}>
                              {/* Jaar badge */}
                              <div className="mb-3">
                                <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-semibold">
                                  {event.year}
                                </span>
                              </div>
                              
                              {/* Titel */}
                              <h3 className="font-display font-bold text-xl mb-3">
                                {event.title}
                              </h3>
                              
                              {/* Beschrijving */}
                              <p className="font-sans text-sm leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                          </div>

                          {/* Midden: Icon op de lijn - perfect gecentreerd */}
                          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative z-10 flex items-center justify-center">
                            {/* Icon cirkel - lijn gaat precies door het midden */}
                            <div className={`
                              ${event.color.split(' ')[0]}
                              border-4 border-white
                              rounded-full p-4
                              shadow-xl
                              flex items-center justify-center
                              w-full h-full
                              relative z-10
                            `}>
                              <Icon className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                          </div>

                          {/* Rechts/Links: Illustratie placeholder */}
                          <div className={`
                            ${event.side === 'left' ? 'md:w-5/12' : 'md:w-5/12'}
                            w-full md:w-5/12
                          `}>
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 border-2 border-gray-300 h-full flex items-center justify-center min-h-[200px]">
                              <div className="text-center">
                                <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-4 shadow-inner" />
                                <p className="font-sans text-xs text-gray-500">
                                  {t('illustration')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('cta.title')}
              </h2>
              <p className="font-sans text-base md:text-lg text-muted-foreground mb-8">
                {t('cta.description')}
              </p>
              <Link href="/contact" className="group inline-block">
                <div className="relative">
                  {/* Glow effect achtergrond */}
                  <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 group-hover:opacity-75 group-hover:blur-2xl transition-all duration-500 animate-pulse-slow" />
                  
                  {/* Hoofd knop */}
                  <Button
                    size="lg"
                    className="relative font-display text-base md:text-lg px-10 md:px-14 py-7 md:py-8 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500 rounded-2xl hover:scale-110 active:scale-105 border-2 border-white/20 hover:border-white/40 overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative flex items-center gap-3 z-10">
                      <span className="font-bold">{t('cta.button')}</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 group-hover:scale-110" />
                    </span>
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

