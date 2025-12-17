"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

function OTPPageContent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const email = searchParams.get("email");

  useEffect(() => {
    // Check if user is logged in with retry logic
    // Cookies might not be set immediately after redirect
    const checkAuth = async () => {
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (user) {
            setCheckingAuth(false);
            return;
          }
          
          // If no user but we have email param, wait a bit and retry
          if (!user && email) {
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
          
          // If no user and no email param, redirect to login
          if (!user && !email) {
            router.push("/login");
            return;
          }
          
          // If we have email but no user after retries, still allow OTP entry
          // (user might need to resend OTP)
          setCheckingAuth(false);
          return;
        } catch (error) {
          console.error("Auth check error:", error);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            setCheckingAuth(false);
          }
        }
      }
      
      setCheckingAuth(false);
    };

    checkAuth();

    // Start resend cooldown timer
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [router, supabase, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to get user with retry logic
      let user = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          user = authUser;
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!user) {
        throw new Error("Niet ingelogd. Probeer opnieuw in te loggen.");
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "OTP code ongeldig");
      }

      // The cookies are set by the server in the response headers
      // We need to wait for them to be processed by the browser
      // Then do a hard redirect which will trigger middleware and server-side auth check
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ OTP verified, waiting for cookies to be set...');
        console.log('🔍 Current cookies:', document.cookie);
      }
      
      // Wait a bit longer to ensure cookies are set and processed by browser
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check user role to determine redirect destination
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let redirectPath = "/portal";
      
      if (authUser) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();
        
        if (profile && (profile.role === "admin" || profile.role === "staff")) {
          redirectPath = "/admin";
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Cookies after wait:', document.cookie);
        console.log('🔄 Redirecting to', redirectPath);
      }
      
      // Use router.push first to let Next.js handle it, then fallback to window.location
      try {
        router.push(redirectPath);
        // Give router.push a moment, then force reload if needed
        setTimeout(() => {
          if (window.location.pathname !== redirectPath) {
            window.location.href = redirectPath;
          }
        }, 500);
      } catch (error) {
        // Fallback to hard redirect
        window.location.href = redirectPath;
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "OTP code ongeldig",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      // Try to get user with retry logic
      let user = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          user = authUser;
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!user) {
        throw new Error("Niet ingelogd. Probeer opnieuw in te loggen.");
      }

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        throw new Error("Kon OTP niet opnieuw verzenden");
      }

      setResendCooldown(60); // 1 minute cooldown
      toast({
        title: "OTP verzonden",
        description: "Er is een nieuwe OTP code naar uw e-mailadres verzonden",
      });
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon OTP niet opnieuw verzenden",
        variant: "destructive",
      });
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-sans text-muted-foreground">Laden...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">OTP Verificatie</CardTitle>
          <CardDescription className="text-center">
            Voer de 6-cijferige code in die naar uw e-mailadres is verzonden
            {email && <span className="block mt-2 text-sm">({email})</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">OTP Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifiëren..." : "Verifiëren"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0
                ? `Opnieuw verzenden (${resendCooldown}s)`
                : "Code opnieuw verzenden"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-sans text-muted-foreground">Laden...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <OTPPageContent />
    </Suspense>
  );
}

