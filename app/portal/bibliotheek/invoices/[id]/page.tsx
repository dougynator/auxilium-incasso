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
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Factuurnummer is verplicht"),
  invoice_date: z.string().min(1, "Factuurdatum is verplicht"),
  due_date: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Bedrag moet een positief getal zijn",
  }),
  currency: z.string().default("EUR"),
  debtor_name: z.string().optional(),
  debtor_email: z.string().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  debtor_vat_number: z.string().optional(),
  debtor_address_street: z.string().optional(),
  debtor_address_house_number: z.string().optional(),
  debtor_address_city: z.string().optional(),
  debtor_address_postal_code: z.string().optional(),
  debtor_address_country: z.string().default("BE"),
  debtor_type: z.enum(["particular", "company"]).default("particular"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const invoiceId = params.id as string;
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: "EUR",
      debtor_address_country: "BE",
      debtor_type: "particular",
    },
  });

  const debtorType = watch("debtor_type");

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

      const invoice = result.invoice;
      
      setValue("invoice_number", invoice.invoice_number || "");
      setValue("invoice_date", invoice.invoice_date || "");
      setValue("due_date", invoice.due_date || "");
      setValue("amount", invoice.amount?.toString() || "0");
      setValue("currency", invoice.currency || "EUR");
      setValue("debtor_name", invoice.debtor_name || "");
      setValue("debtor_email", invoice.debtor_email || "");
      setValue("debtor_vat_number", invoice.debtor_vat_number || "");
      setValue("debtor_address_street", invoice.debtor_address_street || "");
      setValue("debtor_address_city", invoice.debtor_address_city || "");
      setValue("debtor_address_postal_code", invoice.debtor_address_postal_code || "");
      setValue("debtor_address_country", invoice.debtor_address_country || "BE");
      
      // Determine debtor type based on whether company_name exists in extracted_data or debtor_name
      const extractedData = invoice.extracted_data || {};
      const hasCompanyName = extractedData.debtor_company_name || invoice.debtor_company_name;
      setValue("debtor_type", hasCompanyName ? "company" : "particular");

      // Load document preview if available
      if (invoice.document_path) {
        try {
          const { data } = await supabase.storage
            .from('case-attachments')
            .createSignedUrl(invoice.document_path, 3600);
          
          if (data?.signedUrl) {
            setDocumentUrl(data.signedUrl);
          }
        } catch (error) {
          console.error("Error loading document:", error);
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
      // Combine street and house number
      const fullStreet = data.debtor_address_house_number 
        ? `${data.debtor_address_street || ""} ${data.debtor_address_house_number}`.trim()
        : data.debtor_address_street || null;
      
      const submitData = {
        ...data,
        amount: parseFloat(data.amount),
        debtor_address_street: fullStreet,
      };
      delete (submitData as any).debtor_address_house_number;
      
      const response = await fetch(`/api/bibliotheek/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon factuur niet bijwerken");
      }

      toast({
        title: "Factuur bijgewerkt",
        description: "De factuur is succesvol bijgewerkt",
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
    if (!confirm("Weet je zeker dat je deze factuur wilt verwijderen?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/bibliotheek/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon factuur niet verwijderen");
      }

      toast({
        title: "Factuur verwijderd",
        description: "De factuur is succesvol verwijderd",
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
    <div className="max-w-6xl mx-auto">
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
          Bewerk de gegevens van deze factuur
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Linker kolom: Document preview */}
          {documentUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Factuur preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: 'calc(90vh - 200px)', minHeight: '600px' }}>
                  <iframe
                    src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`}
                    className="w-full h-full"
                    title="Factuur Preview"
                    style={{ border: 'none' }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rechter kolom: Formulier */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Factuurgegevens</CardTitle>
                <CardDescription>
                  Bewerk de gegevens van de factuur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid md:grid-cols-2 gap-3">
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

                <div className="grid md:grid-cols-2 gap-3">
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

                {/* Debiteur informatie */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-semibold">Debiteur informatie</Label>
                  
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
                              setValue("debtor_vat_number", "");
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

                  <div className="space-y-2">
                    <Label htmlFor="debtor_name">Naam/Bedrijfsnaam</Label>
                    <Input
                      id="debtor_name"
                      {...register("debtor_name")}
                      placeholder="Naam of bedrijfsnaam"
                    />
                  </div>

                  <div className={`grid gap-3 ${debtorType === "company" ? "md:grid-cols-2" : ""}`}>
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
                    {debtorType === "company" && (
                      <div className="space-y-2">
                        <Label htmlFor="debtor_vat_number">BTW nummer</Label>
                        <Input
                          id="debtor_vat_number"
                          {...register("debtor_vat_number")}
                          placeholder="BE0123456789"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_street">Straat</Label>
                      <Input
                        id="debtor_address_street"
                        {...register("debtor_address_street")}
                        placeholder="Kerkstraat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_house_number">Huisnummer</Label>
                      <Input
                        id="debtor_address_house_number"
                        {...register("debtor_address_house_number")}
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
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
          </div>
        </div>
      </form>
    </div>
  );
}

