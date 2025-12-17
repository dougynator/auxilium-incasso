import DienstenPageContent from '@/components/diensten-page-content';

// Prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DienstenPage() {
  return <DienstenPageContent />;
}

