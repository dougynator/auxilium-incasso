"use client";

import dynamic from 'next/dynamic';

// Disable SSR for the diensten page to prevent prerender errors
const DienstenPageClient = dynamic(
  () => import('./page-client'),
  { ssr: false }
);

export default function DienstenPageWrapper() {
  return <DienstenPageClient />;
}
