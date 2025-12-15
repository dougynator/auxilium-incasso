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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Upload, File as FileIcon, X, Search, Loader2, Check, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const caseSchema = z.object({
  // Debtor info
  debtorNameOrCompany: z.string().min(1, "Naam/bedrijfsnaam is verplicht"),
  debtorEmail: z.string().email("Ongeldig e-mailadres"),
  debtorVatNumber: z.string().optional(),
  debtorStreet: z.string().optional(),
  debtorCity: z.string().optional(),
  debtorPostalCode: z.string().optional(),
  debtorCountry: z.string().default("BE"),
  debtorType: z.enum(["particular", "company"]).default("particular"),

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

// Invoice Card Component for Modal
function InvoiceCard({ invoice, onSelect, supabase }: { invoice: any; onSelect: () => void; supabase: any }) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  
  const loadDocument = async () => {
    if (invoice.document_path && !documentUrl) {
      setLoadingDoc(true);
      try {
        const { data } = await supabase.storage
          .from('case-attachments')
          .createSignedUrl(invoice.document_path, 3600);
        if (data?.signedUrl) {
          setDocumentUrl(data.signedUrl);
        }
      } catch (error) {
        console.error("Error loading document:", error);
      } finally {
        setLoadingDoc(false);
      }
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <p className="font-semibold font-sans">{invoice.invoice_number || "Geen nummer"}</p>
              <p className="text-sm text-muted-foreground font-sans">
                {invoice.debtor_name || invoice.debtor_email || "Onbekende debiteur"}
              </p>
            </div>
            <div className="text-sm space-y-1 font-sans">
              <p><strong>Datum:</strong> {formatDate(invoice.invoice_date)}</p>
              {invoice.due_date && (
                <p><strong>Vervaldatum:</strong> {formatDate(invoice.due_date)}</p>
              )}
              <p><strong>Bedrag:</strong> {formatCurrency(invoice.amount, invoice.currency)}</p>
            </div>
            <Button
              type="button"
              onClick={onSelect}
              className="w-full mt-4"
            >
              Selecteer deze factuur
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-sans">Preview</Label>
              {invoice.document_path && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadDocument}
                  disabled={loadingDoc || !!documentUrl}
                >
                  {loadingDoc ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : documentUrl ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    "Laad preview"
                  )}
                </Button>
              )}
            </div>
            {documentUrl && (
              <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '300px' }}>
                <iframe
                  src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-width`}
                  className="w-full h-full"
                  title="Factuur Preview"
                  style={{ border: 'none' }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DebtorOption {
  id?: string;
  debtor_id?: string;
  name?: string;
  company_name?: string;
  email: string;
  vat_number?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debtor search state
  const [debtorSearchQuery, setDebtorSearchQuery] = useState("");
  const [debtorOptions, setDebtorOptions] = useState<DebtorOption[]>([]);
  const [isSearchingDebtors, setIsSearchingDebtors] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorOption | null>(null);
  const [showDebtorDropdown, setShowDebtorDropdown] = useState(false);
  const debtorSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debtorInputRef = useRef<HTMLDivElement>(null);
  
  // Invoice search modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      debtorCountry: "BE",
      additionalCosts: "0",
      debtorType: "particular",
    },
  });
  
  // Watch debtor_name field for search
  const debtorNameValue = watch("debtorNameOrCompany");
  
  // Sync debtorSearchQuery with form field value
  useEffect(() => {
    if (debtorNameValue !== undefined) {
      setDebtorSearchQuery(debtorNameValue || "");
    }
  }, [debtorNameValue]);
  
  // Search for existing debtors when typing in debtor_name field
  useEffect(() => {
    if (debtorSearchTimeoutRef.current) {
      clearTimeout(debtorSearchTimeoutRef.current);
    }

    const searchValue = debtorSearchQuery || "";
    
    if (searchValue.length >= 2 && !selectedDebtor) {
      setIsSearchingDebtors(true);
      setShowDebtorDropdown(true);
      debtorSearchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/bibliotheek/debtors/search?q=${encodeURIComponent(searchValue)}`);
          const result = await response.json();
          
          if (response.ok && result.debtors) {
            setDebtorOptions(result.debtors);
          } else {
            setDebtorOptions([]);
          }
        } catch (error) {
          console.error("Search error:", error);
          setDebtorOptions([]);
        } finally {
          setIsSearchingDebtors(false);
        }
      }, 300); // Debounce 300ms
    } else {
      setDebtorOptions([]);
      if (searchValue.length < 2) {
        setShowDebtorDropdown(false);
      }
    }

    return () => {
      if (debtorSearchTimeoutRef.current) {
        clearTimeout(debtorSearchTimeoutRef.current);
      }
    };
  }, [debtorSearchQuery, selectedDebtor]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (debtorInputRef.current && !debtorInputRef.current.contains(event.target as Node)) {
        setShowDebtorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Load invoices for modal
  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const response = await fetch("/api/bibliotheek/invoices");
      const result = await response.json();
      if (result.invoices) {
        setInvoices(result.invoices);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoadingInvoices(false);
    }
  };
  
  useEffect(() => {
    if (invoiceModalOpen) {
      loadInvoices();
    }
  }, [invoiceModalOpen]);

  const principalAmount = parseFloat(watch("principalAmount") || "0");
  const additionalCosts = parseFloat(watch("additionalCosts") || "0");
  const totalAmount = principalAmount + additionalCosts;

  const handleSelectDebtor = (debtor: DebtorOption) => {
    setSelectedDebtor(debtor);
    const displayName = debtor.name || debtor.company_name || "";
    setValue("debtorNameOrCompany", displayName);
    setValue("debtorEmail", debtor.email);
    setValue("debtorVatNumber", debtor.vat_number || "");
    setValue("debtorStreet", debtor.address_street || "");
    setValue("debtorCity", debtor.address_city || "");
    setValue("debtorPostalCode", debtor.address_postal_code || "");
    setValue("debtorCountry", debtor.address_country || "BE");
    setDebtorOptions([]);
    setShowDebtorDropdown(false);
  };
  
  const handleDebtorInputChange = (value: string) => {
    setValue("debtorNameOrCompany", value);
    if (selectedDebtor && value !== (selectedDebtor.name || selectedDebtor.company_name || "")) {
      setSelectedDebtor(null);
      // Clear other debtor fields if a selected debtor is deselected by typing
      setValue("debtorEmail", "");
      setValue("debtorVatNumber", "");
      setValue("debtorStreet", "");
      setValue("debtorCity", "");
      setValue("debtorPostalCode", "");
      setValue("debtorCountry", "BE");
    }
  };

  const handleSelectInvoice = async (invoice: any) => {
    setValue("invoiceNumber", invoice.invoice_number || "");
    setValue("invoiceDate", invoice.invoice_date || "");
    setValue("dueDate", invoice.due_date || "");
    setValue("principalAmount", invoice.amount?.toString() || "");
    
    // Also fill debtor info if available
    if (invoice.debtor_name || invoice.debtor_email) {
      setValue("debtorNameOrCompany", invoice.debtor_name || "");
      setValue("debtorEmail", invoice.debtor_email || "");
      setValue("debtorVatNumber", invoice.debtor_vat_number || "");
      setValue("debtorStreet", invoice.debtor_address_street || "");
      setValue("debtorCity", invoice.debtor_address_city || "");
      setValue("debtorPostalCode", invoice.debtor_address_postal_code || "");
      setValue("debtorCountry", invoice.debtor_address_country || "BE");
    }
    
    // Load the document file from bibliotheek
    if (invoice.document_path && invoice.document_name) {
      try {
        // Get signed URL for the document
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('case-attachments')
          .createSignedUrl(invoice.document_path, 3600);
        
        if (urlError || !signedUrlData?.signedUrl) {
          console.error('Error creating signed URL:', urlError);
          toast({
            title: "Waarschuwing",
            description: "Kon document niet laden uit bibliotheek. Upload het handmatig.",
            variant: "destructive",
          });
        } else {
          // Download the file
          const response = await fetch(signedUrlData.signedUrl);
          if (!response.ok) {
            throw new Error('Failed to download file');
          }
          
          const blob = await response.blob();
          
          // Create a File object from the blob
          const file = new File([blob], invoice.document_name, { 
            type: blob.type || 'application/pdf' 
          });
          
          // Set the file as uploaded
          setUploadedFile(file);
          
          // Create preview
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          } else if (file.type === 'application/pdf') {
            const blobUrl = URL.createObjectURL(file);
            setPdfBlobUrl(blobUrl);
            setFilePreview(blobUrl);
          }
          
          // Update form input
          if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
          }
          
          toast({
            title: "Document geladen",
            description: `Document "${invoice.document_name}" is automatisch geladen uit je bibliotheek`,
          });
        }
      } catch (error: any) {
        console.error('Error loading document from bibliotheek:', error);
        toast({
          title: "Waarschuwing",
          description: "Kon document niet laden uit bibliotheek. Upload het handmatig.",
          variant: "destructive",
        });
      }
    }
    
    setInvoiceModalOpen(false);
  };

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
                <Label htmlFor="debtorType">Type *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="particular"
                      {...register("debtorType")}
                      className="w-4 h-4"
                    />
                    <span className="font-sans">Particulier</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="company"
                      {...register("debtorType")}
                      className="w-4 h-4"
                    />
                    <span className="font-sans">Bedrijf</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 relative" ref={debtorInputRef}>
                <Label htmlFor="debtorNameOrCompany">Naam/bedrijfsnaam *</Label>
                <div className="relative">
                  <Input
                    id="debtorNameOrCompany"
                    {...register("debtorNameOrCompany", {
                      onChange: (e) => {
                        handleDebtorInputChange(e.target.value);
                      }
                    })}
                    onFocus={() => {
                      const currentValue = watch("debtorNameOrCompany") || "";
                      if (currentValue.length >= 2 && debtorOptions.length > 0) {
                        setShowDebtorDropdown(true);
                      }
                    }}
                    placeholder="Typ naam of bedrijfsnaam..."
                  />
                  {isSearchingDebtors && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  
                  {/* Dropdown */}
                  {showDebtorDropdown && (debtorOptions.length > 0 || isSearchingDebtors) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {isSearchingDebtors && debtorOptions.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Zoeken...
                        </div>
                      )}
                      {!isSearchingDebtors && debtorOptions.length === 0 && debtorSearchQuery.length >= 2 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">Geen debiteuren gevonden.</div>
                      )}
                      {debtorOptions.map((debtor, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectDebtor(debtor)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {debtor.name || debtor.company_name || "Geen naam"}
                            </div>
                            {debtor.company_name && debtor.name && (
                              <div className="text-xs text-muted-foreground truncate">
                                {debtor.company_name}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground truncate">
                              {debtor.email}
                            </div>
                          </div>
                          {selectedDebtor?.email === debtor.email && (
                            <Check className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="relative">
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber")}
                    placeholder="INV-2024-001"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setInvoiceModalOpen(true)}
                    title="Zoek in bibliotheek"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
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
      
      {/* Invoice Library Modal */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factuurbibliotheek</DialogTitle>
            <DialogDescription>
              Selecteer een factuur uit je bibliotheek om de gegevens automatisch in te vullen
            </DialogDescription>
          </DialogHeader>
          
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 font-sans">Facturen laden...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-sans text-muted-foreground">Nog geen facturen in je bibliotheek</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onSelect={() => handleSelectInvoice(invoice)}
                  supabase={supabase}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

