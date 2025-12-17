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
import { useTranslations } from 'next-intl';

export default function InvoiceDetailPage() {
  const t = useTranslations('portal.library.invoiceDetail');
  const tCommon = useTranslations('common');
  
  const invoiceSchema = z.object({
    invoice_number: z.string().min(1, t('invoiceNumberRequired')),
    invoice_date: z.string().min(1, t('invoiceDateRequired')),
    due_date: z.string().optional(),
    amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: t('amountInvalid'),
    }),
    currency: z.string().default("EUR"),
    debtor_name: z.string().optional(),
    debtor_email: z.string().email(t('emailInvalid')).optional().or(z.literal("")),
    debtor_vat_number: z.string().optional(),
    debtor_address_street: z.string().optional(),
    debtor_address_house_number: z.string().optional(),
    debtor_address_city: z.string().optional(),
    debtor_address_postal_code: z.string().optional(),
    debtor_address_country: z.string().default("BE"),
    debtor_type: z.enum(["particular", "company"]).default("particular"),
  });

  type InvoiceFormData = z.infer<typeof invoiceSchema>;
  
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
        throw new Error(result.error || t('loadingError'));
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
        title: tCommon('error'),
        description: error.message || t('loadingError'),
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
        throw new Error(result.error || t('error'));
      }

      toast({
        title: t('saved'),
        description: t('savedDesc'),
      });

      router.push("/portal/bibliotheek");
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.message || t('error'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/bibliotheek/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error'));
      }

      toast({
        title: t('saved'),
        description: t('savedDesc'),
      });

      router.push("/portal/bibliotheek");
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error.message || t('error'),
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
          {t('backToLibrary')}
        </Button>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="font-sans text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Linker kolom: Document preview */}
          {documentUrl && (
            <Card>
              <CardHeader>
                <CardTitle>{t('preview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: 'calc(90vh - 200px)', minHeight: '600px' }}>
                  <iframe
                    src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`}
                    className="w-full h-full"
                    title={t('preview')}
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
                <CardTitle>{t('invoiceData')}</CardTitle>
                <CardDescription>
                  {t('invoiceDataDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">{t('invoiceNumber')}</Label>
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
                    <Label htmlFor="invoice_date">{t('invoiceDate')}</Label>
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
                    <Label htmlFor="due_date">{t('dueDate')}</Label>
                    <Input
                      id="due_date"
                      type="date"
                      {...register("due_date")}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t('amount')}</Label>
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
                    <Label htmlFor="currency">{t('currency')}</Label>
                    <Input
                      id="currency"
                      {...register("currency")}
                      placeholder="EUR"
                    />
                  </div>
                </div>

                {/* Debiteur informatie */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-semibold">{t('debtorInfo')}</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="debtor_type">{t('type')}</Label>
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
                        <span className="font-sans">{t('particular')}</span>
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
                        <span className="font-sans">{t('company')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debtor_name">{t('name')}</Label>
                    <Input
                      id="debtor_name"
                      {...register("debtor_name")}
                      placeholder="Naam of bedrijfsnaam"
                    />
                  </div>

                  <div className={`grid gap-3 ${debtorType === "company" ? "md:grid-cols-2" : ""}`}>
                    <div className="space-y-2">
                      <Label htmlFor="debtor_email">{t('email')}</Label>
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
                        <Label htmlFor="debtor_vat_number">{t('vatNumber')}</Label>
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
                      <Label htmlFor="debtor_address_street">{t('street')}</Label>
                      <Input
                        id="debtor_address_street"
                        {...register("debtor_address_street")}
                        placeholder="Kerkstraat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_house_number">{t('houseNumber')}</Label>
                      <Input
                        id="debtor_address_house_number"
                        {...register("debtor_address_house_number")}
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_postal_code">{t('postalCode')}</Label>
                      <Input
                        id="debtor_address_postal_code"
                        {...register("debtor_address_postal_code")}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_city">{t('city')}</Label>
                      <Input
                        id="debtor_address_city"
                        {...register("debtor_address_city")}
                        placeholder="Brussel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debtor_address_country">{t('country')}</Label>
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
                        {t('deleting')}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('delete')}
                      </>
                    )}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/portal/bibliotheek")}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('saving')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('save')}
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

