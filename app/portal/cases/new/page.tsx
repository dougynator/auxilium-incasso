"use client";

import { useState, useRef, useEffect } from "react";
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
import { Upload, File as FileIcon, X } from "lucide-react";

const caseSchema = z.object({
  // Debtor info
  debtorNameOrCompany: z.string().min(1, "Naam/bedrijfsnaam is verplicht"),
  debtorEmail: z.string().email("Ongeldig e-mailadres"),
  debtorVatNumber: z.string().optional(),
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
  
  // Document upload - validation is handled manually in the component
  document: z.any().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    console.log('🔍 handleFileChange called');
    console.log('📁 Files:', e.target.files);
    console.log('📄 Selected file:', file);
    console.log('📄 File details:', file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : 'No file');
    
    if (file) {
      console.log('✅ File selected:', file.name, file.size, file.type);
      setUploadedFile(file);
      console.log('✅ State updated with file');
      
      // Create preview for images and PDFs
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('✅ Image preview created');
          setFilePreview(reader.result as string);
        };
        reader.onerror = () => {
          console.error('❌ Error reading image file');
          setFilePreview(null);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Create blob URL for PDF preview (works better than data URL)
        const blobUrl = URL.createObjectURL(file);
        console.log('✅ PDF blob URL created:', blobUrl);
        setPdfBlobUrl(blobUrl);
        setFilePreview(blobUrl);
        
        // Also create data URL as fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('✅ PDF data URL also created as fallback');
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      
      // Also update the form value for react-hook-form
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    } else {
      console.log('❌ No file selected');
      setUploadedFile(null);
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview for images and PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      
      // Update form value
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    // Clean up blob URL if it exists
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CaseFormData) => {
    console.log('🚀 Form submitted!');
    console.log('📋 Form data:', data);
    console.log('📄 Uploaded file:', uploadedFile);
    console.log('📋 Form errors:', errors);
    
    // Check for form validation errors
    if (Object.keys(errors).length > 0) {
      console.error('❌ Form validation errors:', errors);
      toast({
        title: "Validatiefout",
        description: "Controleer alle velden en probeer opnieuw",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadedFile) {
      console.error('❌ No file uploaded!');
      toast({
        title: "Fout",
        description: "Document upload is verplicht",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Preparing form submission...');
      console.log('📄 File to upload:', uploadedFile ? `${uploadedFile.name} (${uploadedFile.size} bytes, type: ${uploadedFile.type})` : 'No file');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("document", uploadedFile);
      formData.append("data", JSON.stringify({
        ...data,
        principalAmount: parseFloat(data.principalAmount),
        additionalCosts: parseFloat(data.additionalCosts || "0"),
      }));

      console.log('📦 FormData created');
      // Log FormData entries safely
      const entries: Array<[string, any]> = [];
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
          entries.push([key, `${(value as File).name} (${(value as File).size} bytes)`]);
        } else {
          entries.push([key, value]);
        }
      }
      console.log('📦 FormData entries:', entries);
      console.log('📤 Sending request to /api/cases/create...');

      const response = await fetch("/api/cases/create", {
        method: "POST",
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      let result;
      try {
        const text = await response.text();
        console.log('📥 Response text:', text);
        result = JSON.parse(text);
      } catch (jsonError) {
        console.error('❌ Error parsing JSON response:', jsonError);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      console.log('📥 Response data:', result);

      if (!response.ok) {
        console.error('❌ Response not OK:', result);
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.caseId) {
        console.error('❌ No caseId in response:', result);
        throw new Error('Geen case ID ontvangen van server');
      }

      console.log('✅ Case created successfully:', result.caseId);

      toast({
        title: "Opdracht aangemaakt",
        description: "De opdracht is succesvol aangemaakt en de debiteur is gecontacteerd",
      });

      router.push(`/portal/cases/${result.caseId}`);
    } catch (error: any) {
      console.error('❌ Error in onSubmit:', error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het aanmaken van de opdracht",
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
              <div className="space-y-2">
                <Label htmlFor="debtorNameOrCompany">Naam/bedrijfsnaam *</Label>
                <Input
                  id="debtorNameOrCompany"
                  {...register("debtorNameOrCompany")}
                  placeholder="Jan Janssen of BVBA Example"
                />
                {errors.debtorNameOrCompany && (
                  <p className="text-sm text-destructive">{errors.debtorNameOrCompany.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label htmlFor="debtorVatNumber">BTW nummer (optioneel)</Label>
                  <Input
                    id="debtorVatNumber"
                    {...register("debtorVatNumber")}
                    placeholder="BE0123456789"
                  />
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="document">Document upload *</Label>
                <input
                  ref={(e) => {
                    fileInputRef.current = e;
                    register("document").ref(e);
                  }}
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,image/*,application/pdf"
                  onChange={(e) => {
                    handleFileChange(e);
                    register("document").onChange(e);
                  }}
                  className="hidden"
                />
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${uploadedFile 
                      ? "border-primary bg-primary/5" 
                      : errors.document 
                        ? "border-destructive bg-destructive/5" 
                        : "border-gray-300"
                    }
                  `}
                >
                  {uploadedFile ? (
                    <div className="space-y-3">
                      {filePreview ? (
                        <div className="relative">
                          {uploadedFile.type.startsWith('image/') ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded-lg border border-gray-200"
                            />
                          ) : uploadedFile.type === 'application/pdf' ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              <iframe
                                src={`${filePreview}#toolbar=1&navpanes=1&scrollbar=1&zoom=page-width`}
                                className="w-full h-[600px]"
                                title="PDF Preview"
                                style={{ border: 'none' }}
                              />
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors z-10"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <FileIcon className="w-8 h-8 text-primary" />
                          <div className="text-left">
                            <p className="font-sans font-medium">{uploadedFile.name}</p>
                            <p className="font-sans text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="ml-2 p-1 hover:bg-destructive/10 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-sans font-medium mb-1">
                          Sleep een bestand hierheen of klik op de knop hieronder
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">
                          PDF, DOC, DOCX, JPG, PNG (max. 10MB)
                        </p>
                      </div>
                      <label htmlFor="document" className="inline-block cursor-pointer">
                        <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-sans">
                          <Upload className="w-4 h-4 mr-2" />
                          Bestand kiezen
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                {errors.document && (
                  <p className="text-sm text-destructive">{errors.document.message as string}</p>
                )}
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
                <Button 
                  type="button" 
                  onClick={() => {
                    if (!uploadedFile) {
                      toast({
                        title: "Document verplicht",
                        description: "Upload een document om door te gaan",
                        variant: "destructive",
                      });
                      return;
                    }
                    setStep(3);
                  }}
                >
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
                    <p>{watch("debtorNameOrCompany")}</p>
                    <p>{watch("debtorEmail")}</p>
                    {watch("debtorVatNumber") && <p>BTW: {watch("debtorVatNumber")}</p>}
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

                {uploadedFile && (
                  <div>
                    <h3 className="font-semibold mb-2">Bijgevoegd document</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      {filePreview ? (
                        <div className="space-y-3">
                          {uploadedFile.type.startsWith('image/') ? (
                            <div className="relative">
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-lg border border-gray-200"
                              />
                            </div>
                          ) : uploadedFile.type === 'application/pdf' ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              <iframe
                                src={`${filePreview}#toolbar=1&navpanes=1&scrollbar=1&zoom=page-width`}
                                className="w-full h-[600px]"
                                title="PDF Preview"
                                style={{ border: 'none' }}
                              />
                            </div>
                          ) : null}
                          <div className="text-center">
                            <p className="font-sans font-medium">{uploadedFile.name}</p>
                            <p className="font-sans text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-sans font-medium">{uploadedFile.name}</p>
                            <p className="font-sans text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                <Button 
                  type="submit" 
                  disabled={loading}
                  onClick={async (e) => {
                    console.log('🔘 Submit button clicked');
                    console.log('📋 Current step:', step);
                    console.log('📄 Uploaded file:', uploadedFile);
                    console.log('⏳ Loading state:', loading);
                    
                    // Trigger validation
                    const isValid = await trigger();
                    console.log('✅ Form validation result:', isValid);
                    console.log('❌ Form errors:', errors);
                    
                    if (!isValid) {
                      console.error('❌ Form is not valid, errors:', errors);
                      toast({
                        title: "Validatiefout",
                        description: "Controleer alle velden en probeer opnieuw",
                        variant: "destructive",
                      });
                    }
                  }}
                >
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

