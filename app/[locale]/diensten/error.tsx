'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Diensten page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Er ging iets mis
        </h2>
        <p className="text-muted-foreground mb-6">
          Er is een fout opgetreden bij het laden van deze pagina.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Probeer opnieuw
          </Button>
          <Link href="/">
            <Button variant="outline">
              Terug naar home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

