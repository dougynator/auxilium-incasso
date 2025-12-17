import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  const tCommon = await getTranslations('common');

  const dataCollectionItems = t.raw('dataCollection.items') as string[];
  const dataUsageItems = t.raw('dataUsage.items') as string[];
  const rightsItems = t.raw('rights.items') as string[];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            {tCommon('lastUpdated')}: {new Date().toLocaleDateString("nl-BE")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('introduction.title')}</h2>
          <p>
            {t('introduction.content')}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('dataCollection.title')}</h2>
          <p>
            {t('dataCollection.content')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {dataCollectionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('dataUsage.title')}</h2>
          <p>
            {t('dataUsage.content')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {dataUsageItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('rights.title')}</h2>
          <p>
            {t('rights.content')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {rightsItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

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

