import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function FAQPage() {
  const t = await getTranslations('faq');
  const tCommon = await getTranslations('common');

  const faqs = t.raw('questions') as Array<{ question: string; answer: string }>;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

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
            {t('moreQuestions')}
          </p>
          <Link href="/contact">
            <Button>{t('contactButton')}</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

