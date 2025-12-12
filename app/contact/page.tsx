"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Kon bericht niet verzenden");
      }

      toast({
        title: "Bericht verzonden",
        description: "We nemen zo snel mogelijk contact met u op",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header currentPage="contact" />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Contact</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Neem contact op</CardTitle>
              <CardDescription>Stuur ons een bericht</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Bericht</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={loading}
                    rows={6}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Verzenden..." : "Verzenden"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Contactgegevens</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">E-mail</h3>
                <p className="text-muted-foreground">info@auxilium-incasso.be</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Telefoon</h3>
                <p className="text-muted-foreground">+32 XXX XXX XXX</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adres</h3>
                <p className="text-muted-foreground">
                  België
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

