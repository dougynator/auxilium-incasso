"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

const caseSchema = z.object({
  // Debtor info
  debtorName: z.string().min(1, "Naam is verplicht"),
  debtorCompanyName: z.string().optional(),
  debtorEmail: z.string().email("Ongeldig e-mailadres"),
  debtorStreet: z.string().optional(),
  debtorCity: z.string().optional(),
  debtorPostalCode: z.string().optional(),
  debtorCountry: z.string().default("BE"),

  // Invoice info
  invoiceNumber: z.string().min(1, "Factuurnummer is verplicht"),
  invoiceDate: z.string().min(1, "Factuurdatum is verplicht"),
  dueDate: z.string().optional(),
  principalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Bedrag moet een positief getal zijn",
  }),

  // Additional costs
  additionalCosts: z.string().default("0"),
});

type CaseFormData = z.infer<typeof caseSchema>;

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      debtorCountry: "BE",
      additionalCosts: "0",
    },
  });

  const principalAmount = parseFloat(watch("principalAmount") || "0");
  const additionalCosts = parseFloat(watch("additionalCosts") || "0");
  const totalAmount = principalAmount + additionalCosts;

  const onSubmit = async (data: CaseFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          principalAmount: parseFloat(data.principalAmount),
          additionalCosts: parseFloat(data.additionalCosts || "0"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Er is een fout opgetreden");
      }

      toast({
        title: "Opdracht aangemaakt",
        description: "De opdracht is succesvol aangemaakt en de debiteur is gecontacteerd",
      });

      router.push(`/portal/cases/${result.caseId}`);
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nieuwe opdracht aanmaken</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Stap 1: Debiteurgegevens</CardTitle>
              <CardDescription>Gegevens van de debiteur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debtorName">Naam *</Label>
                  <Input
                    id="debtorName"
                    {...register("debtorName")}
                    placeholder="Jan Janssen"
                  />
                  {errors.debtorName && (
                    <p className="text-sm text-destructive">{errors.debtorName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debtorCompanyName">Bedrijfsnaam (optioneel)</Label>
                  <Input
                    id="debtorCompanyName"
                    {...register("debtorCompanyName")}
                    placeholder="BVBA Example"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtorEmail">E-mailadres *</Label>
                <Input
                  id="debtorEmail"
                  type="email"
                  {...register("debtorEmail")}
                  placeholder="debiteur@example.com"
                />
                {errors.debtorEmail && (
                  <p className="text-sm text-destructive">{errors.debtorEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtorStreet">Straat</Label>
                <Input id="debtorStreet" {...register("debtorStreet")} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debtorPostalCode">Postcode</Label>
                  <Input id="debtorPostalCode" {...register("debtorPostalCode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debtorCity">Stad</Label>
                  <Input id="debtorCity" {...register("debtorCity")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debtorCountry">Land</Label>
                  <Input id="debtorCountry" {...register("debtorCountry")} defaultValue="BE" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  Volgende
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Stap 2: Factuurgegevens</CardTitle>
              <CardDescription>Gegevens van de factuur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Factuurnummer *</Label>
                <Input
                  id="invoiceNumber"
                  {...register("invoiceNumber")}
                  placeholder="INV-2024-001"
                />
                {errors.invoiceNumber && (
                  <p className="text-sm text-destructive">{errors.invoiceNumber.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Factuurdatum *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...register("invoiceDate")}
                  />
                  {errors.invoiceDate && (
                    <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Vervaldatum (optioneel)</Label>
                  <Input id="dueDate" type="date" {...register("dueDate")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalAmount">Hoofdsom (EUR) *</Label>
                <Input
                  id="principalAmount"
                  type="number"
                  step="0.01"
                  {...register("principalAmount")}
                  placeholder="1000.00"
                />
                {errors.principalAmount && (
                  <p className="text-sm text-destructive">{errors.principalAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalCosts">Bijkomende kosten (EUR)</Label>
                <Input
                  id="additionalCosts"
                  type="number"
                  step="0.01"
                  {...register("additionalCosts")}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Standaard incassokosten worden automatisch berekend
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Hoofdsom:</span>
                  <span>{formatCurrency(principalAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Bijkomende kosten:</span>
                  <span>{formatCurrency(additionalCosts)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Totaal:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Vorige
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Volgende
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Stap 3: Overzicht</CardTitle>
              <CardDescription>Controleer de gegevens voordat u de opdracht aanmaakt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Debiteur</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p>{watch("debtorName")}</p>
                    {watch("debtorCompanyName") && <p>{watch("debtorCompanyName")}</p>}
                    <p>{watch("debtorEmail")}</p>
                    {(watch("debtorStreet") || watch("debtorCity")) && (
                      <p>
                        {watch("debtorStreet")}
                        {watch("debtorStreet") && watch("debtorCity") && ", "}
                        {watch("debtorPostalCode")} {watch("debtorCity")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Factuur</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p>
                      <strong>Factuurnummer:</strong> {watch("invoiceNumber")}
                    </p>
                    <p>
                      <strong>Factuurdatum:</strong> {watch("invoiceDate")}
                    </p>
                    {watch("dueDate") && (
                      <p>
                        <strong>Vervaldatum:</strong> {watch("dueDate")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Bedrag</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Hoofdsom:</span>
                      <span>{formatCurrency(principalAmount)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Bijkomende kosten:</span>
                      <span>{formatCurrency(additionalCosts)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Totaal:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Vorige
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Aanmaken..." : "Opdracht aanmaken"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

