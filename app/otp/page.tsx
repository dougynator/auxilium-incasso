"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function OTPPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in (only on mount, not during verification)
    if (!loading) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          router.push("/login");
        }
      });
    }

    // Start resend cooldown timer
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [router, supabase, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Cookies after wait:', document.cookie);
        console.log('🔄 Redirecting to /portal...');
      }
      
      // Use router.push first to let Next.js handle it, then fallback to window.location
      try {
        router.push("/portal");
        // Give router.push a moment, then force reload if needed
        setTimeout(() => {
          if (window.location.pathname !== "/portal") {
            window.location.href = "/portal";
          }
        }, 500);
      } catch (error) {
        // Fallback to hard redirect
        window.location.href = "/portal";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">OTP Verificatie</CardTitle>
          <CardDescription className="text-center">
            Voer de 6-cijferige code in die naar uw e-mailadres is verzonden
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

