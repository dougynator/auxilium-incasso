import { getTranslations } from 'next-intl/server';
import Header from "@/components/header";
import { Mail, Clock, ArrowRight } from "lucide-react";

export default async function Home() {
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-primary/5 to-white">
      <Header showPortalButton={false} hideNav={true} />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo of titel */}
          <div className="mb-8">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">
              {t('comingSoon')}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Hoofdtekst */}
          <div className="mb-12">
            <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed">
              {t('workingHard')}
            </p>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('description')}{' '}
              <span className="font-semibold text-primary">{t('noCureNoPay')}</span> {t('onlyPayOnSuccess')}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                {t('fastEfficient')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                {t('fastEfficientDesc')}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                {t('transparent')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                {t('transparentDesc')}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                {t('modernPlatform')}
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                {t('modernPlatformDesc')}
              </p>
            </div>
          </div>

          {/* Countdown of datum (optioneel) */}
          <div className="mt-12 pt-8 border-t border-primary/10">
            <p className="font-sans text-sm text-muted-foreground">
              {t('expected')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

