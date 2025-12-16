"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  debtor_type: z.enum(["particular", "company"]).default("particular"),
});

type DebtorFormData = z.infer<typeof debtorSchema>;

interface AddDebtorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface DebtorOption {
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
}

export function AddDebtorModal({ open, onOpenChange, onSuccess }: AddDebtorModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debtorOptions, setDebtorOptions] = useState<DebtorOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorOption | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
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

  const emailValue = watch("email");
  const debtorType = watch("debtor_type");

  // Search for existing debtors when typing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/bibliotheek/debtors/search?q=${encodeURIComponent(searchQuery)}`);
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
          setIsSearching(false);
        }
      }, 300); // Debounce 300ms
    } else {
      setDebtorOptions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Update search query when email changes
  useEffect(() => {
    if (emailValue && !selectedDebtor) {
      setSearchQuery(emailValue);
    }
  }, [emailValue, selectedDebtor]);

  const handleSelectDebtor = (debtor: DebtorOption) => {
    setSelectedDebtor(debtor);
    setSearchQuery("");
    setDebtorOptions([]);
    
    // Determine debtor type based on company_name
    const isCompany = !!debtor.company_name;
    setValue("debtor_type", isCompany ? "company" : "particular");
    
    // Fill form with selected debtor data
    setValue("name", debtor.name || "");
    setValue("company_name", debtor.company_name || "");
    setValue("email", debtor.email);
    setValue("vat_number", debtor.vat_number || "");
    setValue("address_street", debtor.address_street || "");
    setValue("address_city", debtor.address_city || "");
    setValue("address_postal_code", debtor.address_postal_code || "");
    setValue("address_country", debtor.address_country || "BE");
    setValue("phone", debtor.phone || "");
  };

  const onSubmit = async (data: DebtorFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/bibliotheek/debtors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kon relatie niet toevoegen");
      }

      toast({
        title: "Relatie toegevoegd",
        description: "De relatie is succesvol toegevoegd aan je bibliotheek",
      });

      reset();
      setSelectedDebtor(null);
      setSearchQuery("");
      setDebtorOptions([]);
      onOpenChange(false);
      onSuccess();
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

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedDebtor(null);
      setSearchQuery("");
      setDebtorOptions([]);
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatie toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe relatie toe aan je bibliotheek voor snelle hergebruik
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="debiteur@example.com"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedDebtor(null);
                  register("email").onChange(e);
                }}
                value={emailValue || ""}
              />
              {selectedDebtor && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDebtor(null);
                    setValue("email", "");
                    setValue("name", "");
                    setValue("company_name", "");
                    setValue("vat_number", "");
                    setValue("address_street", "");
                    setValue("address_city", "");
                    setValue("address_postal_code", "");
                    setValue("phone", "");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {debtorOptions.length > 0 && !selectedDebtor && searchQuery.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {debtorOptions.map((debtor) => (
                    <div
                      key={debtor.id}
                      className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectDebtor(debtor)}
                    >
                      <div className="font-medium text-sm">
                        {debtor.company_name || debtor.name || "Geen naam"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {debtor.email}
                      </div>
                      {debtor.vat_number && (
                        <div className="text-xs text-muted-foreground mt-1">
                          BTW: {debtor.vat_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            {selectedDebtor && (
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  ✓ Relatie geselecteerd: {selectedDebtor.company_name || selectedDebtor.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Velden zijn automatisch ingevuld. Je kunt ze nog aanpassen.
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {debtorType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="vat_number">BTW nummer</Label>
                <Input id="vat_number" {...register("vat_number")} placeholder="BE0123456789" />
              </div>
            )}
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Toevoegen..." : "Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

