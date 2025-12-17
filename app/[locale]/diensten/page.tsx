import DienstenPageClient from './page-client';

// Prevent static generation by exporting empty generateStaticParams
export function generateStaticParams() {
  return [];
}

export const dynamic = 'force-dynamic';

export default function DienstenPageWrapper() {
  return <DienstenPageClient />;
}

