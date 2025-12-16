"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
        throw new Error(result.error || "Er is een fout opgetreden bij het inloggen");
      }

      router.push("/otp");
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het inloggen",
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
              Inloggen
            </CardTitle>
            <CardDescription className="font-sans text-center text-muted-foreground">
              Log in op uw klantenportaal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans font-medium">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="uw@email.be"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans font-medium">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="••••••••"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full font-display bg-primary hover:bg-primary/90 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? "Inloggen..." : "Inloggen"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="font-sans text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Terug naar homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

