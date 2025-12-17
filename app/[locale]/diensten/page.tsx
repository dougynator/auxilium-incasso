import { headers } from 'next/headers';
import DienstenPageClient from './page-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Force this to be a dynamic route by using headers
export default async function DienstenPageWrapper() {
  // Access headers to force dynamic rendering
  const headersList = await headers();
  
  return <DienstenPageClient />;
}

