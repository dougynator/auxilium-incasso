import dynamic from 'next/dynamic';

// Dynamically import the client component with no SSR to completely prevent prerendering
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

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DienstenPage() {
  return <DienstenPageClient />;
}
