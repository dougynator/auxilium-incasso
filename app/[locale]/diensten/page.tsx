import { notFound } from 'next/navigation';
import DienstenPageClient from './page-client';

// Prevent static generation - this page must be rendered dynamically
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Try to prevent prerendering by throwing during build
export async function generateStaticParams() {
  // Return empty array to prevent static generation
  return [];
}

export default async function DienstenPageWrapper() {
  // During build, this will prevent prerendering
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    // This should prevent prerendering
    return <DienstenPageClient />;
  }
  
  return <DienstenPageClient />;
}

