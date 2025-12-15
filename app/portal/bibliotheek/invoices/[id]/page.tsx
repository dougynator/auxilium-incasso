"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, X, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Factuurnummer is verplicht"),
  invoice_date: z.string().min(1, "Factuurdatum is verplicht"),
  due_date: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Bedrag moet een positief getal zijn",
  }),
  currency: z.string().default("EUR"),
  
  // Debtor info
  debtor_name: z.string().optional(),
  debtor_email: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  debtor_vat_number: z.string().optional(),
  debtor_address_street: z.string().optional(),
  debtor_address_city: z.string().optional(),
  debtor_address_postal_code: z.string().optional(),
  debtor_address_country: z.string().default("BE"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface SavedInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  amount: number;
  currency: string;
  debtor_name?: string;
  debtor_email?: string;
  debtor_vat_number?: string;
  debtor_address_street?: string;
  debtor_address_city?: string;
  debtor_address_postal_code?: string;
  debtor_address_country?: string;
  document_path?: string;
  document_name?: string;
  extracted_data?: any;
}

export default function InvoiceEditPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<SavedInvoice | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isExtracted, setIsExtracted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: "EUR",
      debtor_address_country: "BE",
    },
  });

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/bibliotheek/invoices/${invoiceId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon factuur niet laden");
      }

      const invoiceData = result.invoice;
      setInvoice(invoiceData);
      setIsExtracted(!!invoiceData.extracted_data && Object.keys(invoiceData.extracted_data).length > 0);

      // Fill form with invoice data
      setValue("invoice_number", invoiceData.invoice_number || "");
      setValue("invoice_date", invoiceData.invoice_date || "");
      setValue("due_date", invoiceData.due_date || "");
      setValue("amount", invoiceData.amount?.toString() || "0");
      setValue("currency", invoiceData.currency || "EUR");
      setValue("debtor_name", invoiceData.debtor_name || "");
      setValue("debtor_email", invoiceData.debtor_email || "");
      setValue("debtor_vat_number", invoiceData.debtor_vat_number || "");
      setValue("debtor_address_street", invoiceData.debtor_address_street || "");
      setValue("debtor_address_city", invoiceData.debtor_address_city || "");
      setValue("debtor_address_postal_code", invoiceData.debtor_address_postal_code || "");
      setValue("debtor_address_country", invoiceData.debtor_address_country || "BE");

      // Load document preview
      if (invoiceData.document_path) {
        const { data } = await supabase.storage
          .from('case-attachments')
          .createSignedUrl(invoiceData.document_path, 3600);
        
        if (data?.signedUrl) {
          setDocumentUrl(data.signedUrl);
        }
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon factuur niet laden",
        variant: "destructive",
      });
      router.push("/portal/bibliotheek");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setSaving(true);

    try {
      const response = await fetch(`/api/bibliotheek/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon factuur niet opslaan");
      }

      toast({
        title: "Opgeslagen",
        description: "Factuurgegevens zijn succesvol opgeslagen",
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

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Factuur niet gevonden</p>
        <Button onClick={() => router.push("/portal/bibliotheek")}>
          Terug naar bibliotheek
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
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
          Factuur bewerken
        </h1>
        <p className="font-sans text-muted-foreground">
          Controleer en bewerk de geëxtraheerde gegevens van de factuur
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Linker kolom: Document preview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Factuur preview</CardTitle>
            <CardDescription className="font-sans">
              {invoice.document_name || "Geüpload document"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documentUrl ? (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=page-width`}
                  className="w-full h-[600px]"
                  title="Factuur Preview"
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Preview niet beschikbaar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rechter kolom: Formulier */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Factuurgegevens</CardTitle>
            <CardDescription className="font-sans">
              {isExtracted 
                ? "Gegevens automatisch geëxtraheerd - controleer en pas aan indien nodig"
                : "Vul de factuurgegevens handmatig in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Factuur gegevens */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Factuur informatie</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Factuurnummer *</Label>
                  <Input
                    id="invoice_number"
                    {...register("invoice_number")}
                    placeholder="INV-2024-001"
                  />
                  {errors.invoice_number && (
                    <p className="text-sm text-destructive">{errors.invoice_number.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_date">Factuurdatum *</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      {...register("invoice_date")}
                    />
                    {errors.invoice_date && (
                      <p className="text-sm text-destructive">{errors.invoice_date.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Vervaldatum</Label>
                    <Input
                      id="due_date"
                      type="date"
                      {...register("due_date")}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Bedrag *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register("amount")}
                      placeholder="1000.00"
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive">{errors.amount.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Valuta</Label>
                    <Input
                      id="currency"
                      {...register("currency")}
                      placeholder="EUR"
                    />
                  </div>
                </div>
              </div>

              {/* Debiteur gegevens */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-display font-semibold text-lg">Debiteur informatie</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="debtor_name">Naam/Bedrijfsnaam</Label>
                  <Input
                    id="debtor_name"
                    {...register("debtor_name")}
                    placeholder="Jan Janssen of BVBA Example"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debtor_email">E-mailadres</Label>
                    <Input
                      id="debtor_email"
                      type="email"
                      {...register("debtor_email")}
                      placeholder="debiteur@example.com"
                    />
                    {errors.debtor_email && (
                      <p className="text-sm text-destructive">{errors.debtor_email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="debtor_vat_number">BTW nummer</Label>
                    <Input
                      id="debtor_vat_number"
                      {...register("debtor_vat_number")}
                      placeholder="BE0123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debtor_address_street">Straat</Label>
                  <Input
                    id="debtor_address_street"
                    {...register("debtor_address_street")}
                    placeholder="Kerkstraat 123"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debtor_address_postal_code">Postcode</Label>
                    <Input
                      id="debtor_address_postal_code"
                      {...register("debtor_address_postal_code")}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="debtor_address_city">Stad</Label>
                    <Input
                      id="debtor_address_city"
                      {...register("debtor_address_city")}
                      placeholder="Brussel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="debtor_address_country">Land</Label>
                    <Input
                      id="debtor_address_country"
                      {...register("debtor_address_country")}
                      placeholder="BE"
                    />
                  </div>
                </div>
              </div>

              {/* Actie knoppen */}
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
    </div>
  );
}

