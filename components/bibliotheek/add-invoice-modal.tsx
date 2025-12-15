"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  debtor_address_city: z.string().optional(),
  debtor_address_postal_code: z.string().optional(),
  debtor_address_country: z.string().default("BE"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddInvoiceModal({ open, onOpenChange, onSuccess }: AddInvoiceModalProps) {
  const [step, setStep] = useState(1); // 1 = upload, 2 = verify/edit
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: "EUR",
      debtor_address_country: "BE",
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setFile(null);
      setDocumentUrl(null);
      setInvoiceId(null);
      reset();
    }
  }, [open, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Fout",
        description: "Selecteer eerst een factuur bestand",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setExtracting(true);

    try {
      // Step 1: Upload file and extract data
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch("/api/bibliotheek/invoices", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon factuur niet uploaden");
      }

      const invoice = result.invoice;
      setInvoiceId(invoice.id);

      // Step 2: Get document preview URL
      if (invoice.document_path) {
        const { data } = await supabase.storage
          .from('case-attachments')
          .createSignedUrl(invoice.document_path, 3600);
        
        if (data?.signedUrl) {
          setDocumentUrl(data.signedUrl);
        }
      }

      // Step 3: Fill form with extracted data
      const extractedData = invoice.extracted_data || {};
      
      setValue("invoice_number", invoice.invoice_number || extractedData.invoice_number || "");
      setValue("invoice_date", invoice.invoice_date || extractedData.invoice_date || "");
      setValue("due_date", invoice.due_date || extractedData.due_date || "");
      setValue("amount", invoice.amount?.toString() || extractedData.amount?.toString() || "0");
      setValue("currency", invoice.currency || extractedData.currency || "EUR");
      setValue("debtor_name", invoice.debtor_name || extractedData.debtor_name || "");
      setValue("debtor_email", invoice.debtor_email || extractedData.debtor_email || "");
      setValue("debtor_vat_number", invoice.debtor_vat_number || extractedData.debtor_vat_number || "");
      setValue("debtor_address_street", invoice.debtor_address_street || extractedData.debtor_address_street || "");
      setValue("debtor_address_city", invoice.debtor_address_city || extractedData.debtor_address_city || "");
      setValue("debtor_address_postal_code", invoice.debtor_address_postal_code || extractedData.debtor_address_postal_code || "");
      setValue("debtor_address_country", invoice.debtor_address_country || extractedData.debtor_address_country || "BE");

      // Move to verification step
      setStep(2);
      setExtracting(false);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
      setExtracting(false);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInvoice = async (data: InvoiceFormData) => {
    if (!invoiceId) {
      toast({
        title: "Fout",
        description: "Geen factuur gevonden om op te slaan",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

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
        title: "Factuur opgeslagen",
        description: "De factuur is succesvol toegevoegd aan je bibliotheek",
      });

      setStep(1);
      setFile(null);
      setDocumentUrl(null);
      setInvoiceId(null);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Factuur toevoegen" : "Factuurgegevens verifiëren"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Upload een factuur bestand. Ons AI systeem zal automatisch de gegevens extraheren."
              : "Controleer en bewerk de geëxtraheerde gegevens. Vul ontbrekende velden handmatig in."
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Factuur bestand</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${file ? "border-primary bg-primary/5" : "border-gray-300"}
                `}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-sans font-medium">{file.name}</p>
                        <p className="font-sans text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-sans font-medium mb-1">
                        Sleep een bestand hierheen of klik om te selecteren
                      </p>
                      <p className="font-sans text-sm text-muted-foreground">
                        PDF, JPG, PNG (max. 10MB)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Bestand kiezen
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-sans text-sm text-blue-900">
                <strong>Automatisch geëxtraheerd:</strong> Factuurnummer, factuurdatum, vervaldatum, 
                bedrag, klantgegevens (naam, adres, BTW nummer). Als de klant nog niet bestaat, 
                wordt deze automatisch toegevoegd aan je relaties.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  onOpenChange(false);
                }}
              >
                Annuleren
              </Button>
              <Button
                type="button"
                onClick={handleFileUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {extracting ? "Gegevens extraheren..." : "Uploaden..."}
                  </>
                ) : (
                  <>
                    Uploaden en extraheren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(handleSaveInvoice)} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Linker kolom: Document preview */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Factuur preview</Label>
                  {documentUrl ? (
                    <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: 'calc(90vh - 200px)', minHeight: '600px' }}>
                      <iframe
                        src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`}
                        className="w-full h-full"
                        title="Factuur Preview"
                        style={{ border: 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-12 text-center text-muted-foreground">
                      <p>Preview wordt geladen...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rechter kolom: Formulier */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Factuurgegevens</Label>
                  
                  <div className="space-y-4">
                    {/* Factuur informatie */}
                    <div className="space-y-3">
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
                    </div>

                    {/* Debiteur informatie */}
                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-base font-semibold">Debiteur informatie</Label>
                      
                      <div className="space-y-2">
                        <Label htmlFor="debtor_name">Naam/Bedrijfsnaam</Label>
                        <Input
                          id="debtor_name"
                          {...register("debtor_name")}
                          placeholder="Jan Janssen of BVBA Example"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
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
                  </div>
                </div>
              </div>
            </div>

            {/* Actie knoppen */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setFile(null);
                  setDocumentUrl(null);
                  setInvoiceId(null);
                  reset();
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setFile(null);
                    setDocumentUrl(null);
                    setInvoiceId(null);
                    reset();
                    onOpenChange(false);
                  }}
                >
                  Annuleren
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
