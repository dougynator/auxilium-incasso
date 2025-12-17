import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function VoorwaardenPage() {
  const t = await getTranslations('terms');
  const tCommon = await getTranslations('common');

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            {tCommon('lastUpdated')}: {new Date().toLocaleDateString("nl-BE")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('applicability.title')}</h2>
          <p>
            {t('applicability.content')}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('services.title')}</h2>
          <p>
            {t('services.content')}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('responsibilities.title')}</h2>
          <p>
            {t('responsibilities.content')}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('payment.title')}</h2>
          <p>
            {t('payment.content')}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('contact.title')}</h2>
          <p>
            {t('contact.content')}{" "}
            <Link href="/contact" className="text-primary">{tCommon('contactForm')}</Link>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

