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
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";

const debtorSchema = z.object({
  name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email("Ongeldig e-mailadres"),
  vat_number: z.string().optional(),
  address_street: z.string().optional(),
  address_house_number: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_country: z.string().default("BE"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  debtor_type: z.enum(["particular", "company"]).default("particular"),
});

type DebtorFormData = z.infer<typeof debtorSchema>;

export default function DebtorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debtorId = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DebtorFormData>({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      address_country: "BE",
      debtor_type: "particular",
    },
  });

  const debtorType = watch("debtor_type");

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

      const debtor = result.debtor;
      
      setValue("name", debtor.name || "");
      setValue("company_name", debtor.company_name || "");
      setValue("email", debtor.email);
      setValue("vat_number", debtor.vat_number || "");
      setValue("address_street", debtor.address_street || "");
      setValue("address_city", debtor.address_city || "");
      setValue("address_postal_code", debtor.address_postal_code || "");
      setValue("address_country", debtor.address_country || "BE");
      setValue("phone", debtor.phone || "");
      setValue("notes", debtor.notes || "");
      setValue("debtor_type", debtor.debtor_type || "particular");
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
      // Combine street and house number
      const fullStreet = data.address_house_number 
        ? `${data.address_street || ""} ${data.address_house_number}`.trim()
        : data.address_street || null;
      
      const submitData = {
        ...data,
        address_street: fullStreet,
      };
      delete (submitData as any).address_house_number;
      
      const response = await fetch(`/api/bibliotheek/debtors/${debtorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon relatie niet bijwerken");
      }

      toast({
        title: "Relatie bijgewerkt",
        description: "De relatie is succesvol bijgewerkt",
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

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze relatie wilt verwijderen?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/bibliotheek/debtors/${debtorId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon relatie niet verwijderen");
      }

      toast({
        title: "Relatie verwijderd",
        description: "De relatie is succesvol verwijderd",
      });

      router.push("/portal/bibliotheek");
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Relatiegegevens</CardTitle>
            <CardDescription>
              Bewerk de gegevens van de relatie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="debtor_type">Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="particular"
                    {...register("debtor_type")}
                    onChange={(e) => {
                      if (e.target.value === "particular") {
                        setValue("debtor_type", "particular");
                        setValue("company_name", "");
                        setValue("vat_number", "");
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-sans">Particulier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="company"
                    {...register("debtor_type")}
                    onChange={(e) => {
                      setValue("debtor_type", "company");
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-sans">Bedrijf</span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" {...register("name")} placeholder="Jan Janssen" />
              </div>
              {debtorType === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam</Label>
                  <Input id="company_name" {...register("company_name")} placeholder="BVBA Example" />
                </div>
              )}
            </div>

            <div className={`grid gap-4 ${debtorType === "company" ? "md:grid-cols-2" : ""}`}>
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
              {debtorType === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="vat_number">BTW nummer</Label>
                  <Input id="vat_number" {...register("vat_number")} placeholder="BE0123456789" />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input id="phone" {...register("phone")} placeholder="+32 12 34 56 789" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_street">Straat</Label>
                <Input id="address_street" {...register("address_street")} placeholder="Kerkstraat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_house_number">Huisnummer</Label>
                <Input id="address_house_number" {...register("address_house_number")} placeholder="123" />
              </div>
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

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Verwijderen
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/portal/bibliotheek")}
                >
                  Annuleren
                </Button>
                <Button type="submit" disabled={saving}>
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
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

