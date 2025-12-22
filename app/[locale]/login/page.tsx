"use client";

import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('loginError'));
      }

      // Pass email as URL parameter to persist across redirects
      router.push(`/otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.message || t('loginError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader className="space-y-2">
            <CardTitle className="font-display text-3xl md:text-4xl font-bold text-primary text-center">
              {t('title')}
            </CardTitle>
            <CardDescription className="font-sans text-center text-muted-foreground">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans font-medium">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full font-display bg-primary hover:bg-primary/90 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? t('loggingIn') : t('login')}
              </Button>
            </form>
            <div className="mt-6 space-y-3 text-center">
              <div>
                <Link 
                  href="/register" 
                  className="font-sans text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Nog geen account? Registreer hier
                </Link>
              </div>
              <div>
                <Link 
                  href="/" 
                  className="font-sans text-sm text-muted-foreground hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  {t('backToHome')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

