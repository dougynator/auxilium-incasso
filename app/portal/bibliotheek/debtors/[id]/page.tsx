"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";

const debtorSchema = z.object({
  name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email("Ongeldig e-mailadres"),
  vat_number: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_country: z.string().default("BE"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type DebtorFormData = z.infer<typeof debtorSchema>;

interface SavedDebtor {
  id: string;
  name?: string;
  company_name?: string;
  email: string;
  vat_number?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  phone?: string;
  notes?: string;
}

export default function DebtorEditPage() {
  const router = useRouter();
  const params = useParams();
  const debtorId = params.id as string;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [debtor, setDebtor] = useState<SavedDebtor | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DebtorFormData>({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      address_country: "BE",
    },
  });

  useEffect(() => {
    loadDebtor();
  }, [debtorId]);

  const loadDebtor = async () => {
    try {
      const response = await fetch(`/api/bibliotheek/debtors/${debtorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon relatie niet laden");
      }

      const debtorData = result.debtor;
      setDebtor(debtorData);

      // Fill form
      setValue("name", debtorData.name || "");
      setValue("company_name", debtorData.company_name || "");
      setValue("email", debtorData.email);
      setValue("vat_number", debtorData.vat_number || "");
      setValue("address_street", debtorData.address_street || "");
      setValue("address_city", debtorData.address_city || "");
      setValue("address_postal_code", debtorData.address_postal_code || "");
      setValue("address_country", debtorData.address_country || "BE");
      setValue("phone", debtorData.phone || "");
      setValue("notes", debtorData.notes || "");
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon relatie niet laden",
        variant: "destructive",
      });
      router.push("/portal/bibliotheek");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DebtorFormData) => {
    setSaving(true);

    try {
      const response = await fetch(`/api/bibliotheek/debtors/${debtorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon relatie niet opslaan");
      }

      toast({
        title: "Opgeslagen",
        description: "Relatiegegevens zijn succesvol opgeslagen",
      });

      router.push("/portal/bibliotheek");
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!debtor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Relatie niet gevonden</p>
        <Button onClick={() => router.push("/portal/bibliotheek")}>
          Terug naar bibliotheek
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/portal/bibliotheek")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar bibliotheek
        </Button>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Relatie bewerken
        </h1>
        <p className="font-sans text-muted-foreground">
          Bewerk de gegevens van deze relatie
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Relatiegegevens</CardTitle>
          <CardDescription className="font-sans">
            Bewerk de gegevens van deze relatie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" {...register("name")} placeholder="Jan Janssen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Bedrijfsnaam</Label>
                <Input id="company_name" {...register("company_name")} placeholder="BVBA Example" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="debiteur@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat_number">BTW nummer</Label>
                <Input id="vat_number" {...register("vat_number")} placeholder="BE0123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input id="phone" {...register("phone")} placeholder="+32 12 34 56 789" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_street">Straat</Label>
              <Input id="address_street" {...register("address_street")} />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_postal_code">Postcode</Label>
                <Input id="address_postal_code" {...register("address_postal_code")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Stad</Label>
                <Input id="address_city" {...register("address_city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_country">Land</Label>
                <Input id="address_country" {...register("address_country")} defaultValue="BE" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notities</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Optionele notities over deze relatie"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/portal/bibliotheek")}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={saving || !isDirty}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Opslaan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

