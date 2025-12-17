import DienstenPageClient from './page-client';

// Prevent static generation - this page must be rendered dynamically
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DienstenPageWrapper() {
  return <DienstenPageClient />;
}

