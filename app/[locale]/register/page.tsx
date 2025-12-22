"use client";

import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Landen lijst met België en Nederland eerst
const countries = [
  { code: 'BE', name: 'België' },
  { code: 'NL', name: 'Nederland' },
  { code: 'FR', name: 'Frankrijk' },
  { code: 'DE', name: 'Duitsland' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'UK', name: 'Verenigd Koninkrijk' },
  { code: 'US', name: 'Verenigde Staten' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australië' },
  { code: 'ES', name: 'Spanje' },
  { code: 'IT', name: 'Italië' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Oostenrijk' },
  { code: 'CH', name: 'Zwitserland' },
  { code: 'SE', name: 'Zweden' },
  { code: 'NO', name: 'Noorwegen' },
  { code: 'DK', name: 'Denemarken' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tsjechië' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    company: "",
    vat: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    country: "BE",
    password: "",
    confirmPassword: "",
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validatie
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Fout",
        description: "Wachtwoorden komen niet overeen",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Fout",
        description: "Wachtwoord moet minimaal 8 tekens lang zijn",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registratie mislukt");
      }

      toast({
        title: "Registratie succesvol!",
        description: "Er is een bevestigingsemail verstuurd naar je email adres. Controleer je inbox.",
      });

      // Redirect naar login na 2 seconden
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij de registratie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 py-8">
      <div className="w-full max-w-2xl px-4">
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader className="space-y-2">
            <CardTitle className="font-display text-3xl md:text-4xl font-bold text-primary text-center">
              Registreer je account
            </CardTitle>
            <CardDescription className="font-sans text-center text-muted-foreground">
              Maak een nieuw account aan om te beginnen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans font-medium">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="jouw@email.com"
                />
              </div>

              {/* Volledige naam */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-sans font-medium">Volledige naam *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="Jan Janssen"
                />
              </div>

              {/* Telefoonnummer */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-sans font-medium">Telefoonnummer *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="+32 123 45 67 89"
                />
              </div>

              {/* Bedrijf */}
              <div className="space-y-2">
                <Label htmlFor="company" className="font-sans font-medium">Bedrijf *</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="Bedrijfsnaam BV"
                />
              </div>

              {/* BTW */}
              <div className="space-y-2">
                <Label htmlFor="vat" className="font-sans font-medium">BTW nummer *</Label>
                <Input
                  id="vat"
                  name="vat"
                  type="text"
                  value={formData.vat}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="BE0123.456.789"
                />
              </div>

              {/* Adres - Straat en Huisnummer in één rij */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street" className="font-sans font-medium">Straat *</Label>
                  <Input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="font-sans h-11"
                    placeholder="Kerkstraat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="font-sans font-medium">Nr. *</Label>
                  <Input
                    id="houseNumber"
                    name="houseNumber"
                    type="text"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="font-sans h-11"
                    placeholder="123"
                  />
                </div>
              </div>

              {/* Postcode en Stad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="font-sans font-medium">Postcode *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="font-sans h-11"
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-sans font-medium">Stad *</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="font-sans h-11"
                    placeholder="Brussel"
                  />
                </div>
              </div>

              {/* Land */}
              <div className="space-y-2">
                <Label htmlFor="country" className="font-sans font-medium">Land *</Label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wachtwoord */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans font-medium">Wachtwoord *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="Minimaal 8 tekens"
                />
              </div>

              {/* Herhaal wachtwoord */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-sans font-medium">Herhaal wachtwoord *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="font-sans h-11"
                  placeholder="Herhaal je wachtwoord"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-display bg-primary hover:bg-primary/90 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                {loading ? "Registreren..." : "Registreer"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="font-sans text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Al een account? Log hier in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

