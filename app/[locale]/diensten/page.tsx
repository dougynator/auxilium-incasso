import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Dynamically import the client component with no SSR to prevent prerender errors
const DienstenPageClient = dynamic(
  () => import('./diensten-page-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    ),
  }
);

export default async function DienstenPage() {
  // Try to get translations, but if it fails during prerender, the error.tsx will catch it
  let messages;
  
  try {
    const t = await getTranslations('services');
    const tCommon = await getTranslations('common');

    messages = {
      services: {
        title: t('title'),
        subtitle: t('subtitle'),
        easySubmission: {
          title: t('easySubmission.title'),
          description: t('easySubmission.description'),
        },
        autoCheck: {
          title: t('autoCheck.title'),
          description: t('autoCheck.description'),
        },
        professionalContact: {
          title: t('professionalContact.title'),
          description: t('professionalContact.description'),
        },
        noCureNoPay: {
          title: t('noCureNoPay.title'),
          description: t('noCureNoPay.description'),
        },
        fastTreatment: {
          title: t('fastTreatment.title'),
          description: t('fastTreatment.description'),
        },
        allAmounts: {
          title: t('allAmounts.title'),
          description: t('allAmounts.description'),
        },
        debtorManagement: {
          title: t('debtorManagement.title'),
          subtitle: t('debtorManagement.subtitle'),
          description: t('debtorManagement.description'),
          autoFollowup: t('debtorManagement.autoFollowup'),
          proactiveMonitoring: t('debtorManagement.proactiveMonitoring'),
          noWorries: t('debtorManagement.noWorries'),
          contactUs: t('debtorManagement.contactUs'),
          outstandingInvoices: t('debtorManagement.outstandingInvoices'),
          customer: t('debtorManagement.customer'),
          inProgress: t('debtorManagement.inProgress'),
          paid: t('debtorManagement.paid'),
          systemMonitors: t('debtorManagement.systemMonitors'),
        },
      },
      common: {
        submitNow: tCommon('submitNow'),
      },
    };
  } catch (error) {
    // If translations fail during prerender, return null and let error.tsx handle it
    // or return a minimal fallback
    console.error('Error loading translations:', error);
    throw error; // Let error.tsx handle it
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    }>
      <DienstenPageClient messages={messages} />
    </Suspense>
  );
}
