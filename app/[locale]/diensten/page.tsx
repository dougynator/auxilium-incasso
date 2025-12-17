import DienstenPageContent from '@/components/diensten-page-content';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Prevent static generation
export function generateStaticParams() {
  return [];
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Laden...</p>
      </div>
    </div>
  );
}

export default function DienstenPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DienstenPageContent />
    </Suspense>
  );
}

