"use client";

import { useEffect, useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const supabase = createClient();

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        
        if (!hash) {
          throw new Error('Geen bevestigingstoken gevonden');
        }

        // Extract token from hash
        const params = new URLSearchParams(hash.substring(1)); // Remove #
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (!accessToken || type !== 'signup') {
          throw new Error('Ongeldige bevestigingslink');
        }

        // Set the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Email confirmed successfully
          setStatus('success');
          toast({
            title: "Email bevestigd!",
            description: "Uw email adres is succesvol bevestigd. U wordt doorgestuurd naar de login pagina.",
          });

          // Wait a bit for the toast to show, then redirect
          setTimeout(() => {
            router.push('/login?confirmed=true');
          }, 2000);
        } else {
          throw new Error('Kon gebruiker niet verifiëren');
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        toast({
          title: "Bevestiging mislukt",
          description: error.message || "Er is een fout opgetreden bij het bevestigen van uw email.",
          variant: "destructive",
        });

        setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent(error.message || 'confirmation_failed'));
        }, 3000);
      }
    };

    handleConfirmation();
  }, [router, toast, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Email bevestigen...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-semibold">Email succesvol bevestigd!</p>
            <p className="text-sm text-muted-foreground mt-2">U wordt doorgestuurd...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold">Bevestiging mislukt</p>
            <p className="text-sm text-muted-foreground mt-2">U wordt doorgestuurd naar de login pagina...</p>
          </>
        )}
      </div>
    </div>
  );
}

