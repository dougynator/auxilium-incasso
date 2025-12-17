import { getTranslations } from 'next-intl/server';
import DienstenPageClient from './diensten-page-client';

export const dynamic = 'force-dynamic';

export default async function DienstenPage() {
  const t = await getTranslations('services');
  const tCommon = await getTranslations('common');

  const messages = {
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

  return <DienstenPageClient messages={messages} />;
}
