"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MapPin, Phone, Mail } from "lucide-react";

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
    <div className="min-h-screen flex flex-col">
      <Header currentPage="contact" />

      <main className="flex-1">
        {/* Hero sectie */}
        <section className="py-8 md:py-10 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
                Contacteer ons
              </h1>
            </div>
          </div>
        </section>

        {/* Kaart en contactgegevens */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Links: Kaart */}
                <div className="rounded-xl overflow-hidden shadow-lg border-2 border-primary/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2519.5!2d4.3528!3d50.8503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDUxJzAxLjEiTiA0wrAyMScxMC4xIkU!5e0!3m2!1snl!2sbe!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ minHeight: "400px", border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  />
                </div>

                {/* Rechts: Contactgegevens */}
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-6">
                      Contactgegevens
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg mb-1">Adres</h3>
                          <p className="font-sans text-muted-foreground">
                            Kerkstraat 15<br />
                            2000 Antwerpen<br />
                            België
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg mb-1">Telefoon</h3>
                          <p className="font-sans text-muted-foreground">
                            <a href="tel:+3231234567" className="hover:text-primary transition-colors">
                              +32 3 123 45 67
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg mb-1">E-mail</h3>
                          <p className="font-sans text-muted-foreground">
                            <a href="mailto:info@auxilium-incasso.be" className="hover:text-primary transition-colors">
                              info@auxilium-incasso.be
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contactformulier */}
                  <div className="mt-8 pt-8 border-t border-primary/10">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-primary mb-4">
                      Stuur ons een bericht
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-sans">Naam</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          disabled={loading}
                          className="font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-sans">E-mailadres</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          disabled={loading}
                          className="font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message" className="font-sans">Bericht</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          disabled={loading}
                          rows={6}
                          className="font-sans"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="font-display bg-primary hover:bg-primary/90 text-white"
                      >
                        {loading ? "Verzenden..." : "Verzenden"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team profielen */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-primary/3 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-center mb-12">
                Ons team
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Profiel 1 - Gebruiker */}
                <div className="bg-gradient-to-br from-orange-50/80 via-orange-50/60 to-orange-50/80 rounded-2xl p-6 border-2 border-orange-100/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/30">
                  <div className="flex items-center gap-6">
                    {/* Foto - rond, links, overlappend */}
                    <div className="flex-shrink-0 -ml-4">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-display text-3xl font-bold">
                          DL
                        </div>
                      </div>
                    </div>
                    {/* Tekst rechts */}
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-primary mb-1">
                        Douglas Laureys
                      </h3>
                      <p className="font-sans text-sm text-muted-foreground mb-4">
                        General Manager / Co-Owner
                      </p>
                      <div className="space-y-2.5">
                        <a href="tel:+32470123456" className="flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-colors">
                          <Phone className="w-4 h-4" />
                          +32 470 12 34 56
                        </a>
                        <a href="mailto:douglas@auxilium-incasso.be" className="flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-colors">
                          <Mail className="w-4 h-4" />
                          douglas@auxilium-incasso.be
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profiel 2 - Zus */}
                <div className="bg-gradient-to-br from-orange-50/80 via-orange-50/60 to-orange-50/80 rounded-2xl p-6 border-2 border-orange-100/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/30">
                  <div className="flex items-center gap-6">
                    {/* Foto - rond, links, overlappend */}
                    <div className="flex-shrink-0 -ml-4">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-display text-3xl font-bold">
                          DL
                        </div>
                      </div>
                    </div>
                    {/* Tekst rechts */}
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-primary mb-1">
                        Deborah Laureys
                      </h3>
                      <p className="font-sans text-sm text-muted-foreground mb-4">
                        Co-Owner
                      </p>
                      <div className="space-y-2.5">
                        <a href="tel:+32470123457" className="flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-colors">
                          <Phone className="w-4 h-4" />
                          +32 470 12 34 57
                        </a>
                        <a href="mailto:deborah@auxilium-incasso.be" className="flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-colors">
                          <Mail className="w-4 h-4" />
                          deborah@auxilium-incasso.be
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

