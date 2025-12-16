"use client";

import { useState, useEffect, useRef } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Huidig wachtwoord is verplicht"),
  newPassword: z.string().min(8, "Nieuw wachtwoord moet minimaal 8 tekens lang zijn"),
  confirmPassword: z.string().min(1, "Bevestig wachtwoord is verplicht"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  fullName: z.string().min(1, "Naam is verplicht"),
  phone: z.string().optional(),
});

const organizationSchema = z.object({
  name: z.string().min(1, "Bedrijfsnaam is verplicht"),
  vatNumber: z.string().optional(),
  email: z.string().email("Ongeldig e-mailadres"),
  addressStreet: z.string().optional(),
  addressHouseNumber: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().default("BE"),
  bankAccountNumber: z.string().optional(),
  hasInvoiceTerms: z.enum(["yes", "no"]).optional(),
  invoiceTermsFile: z.any().optional(),
  hasDamageClause: z.enum(["yes", "no"]).optional(),
  damageClausePercentage: z.string().optional(),
  hasMinimumDamageClause: z.enum(["yes", "no"]).optional(),
  minimumDamageClauseAmount: z.string().optional(),
  delayInterestType: z.enum(["no", "law_2002", "fixed"]).optional(),
  delayInterestPercentage: z.string().optional(),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [invoiceTermsFile, setInvoiceTermsFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const organizationForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfileData(profile);
        profileForm.reset({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
        });

        if (profile.organizations) {
          setOrganizationData(profile.organizations);
          
          // Split address_street into street and house number if it contains a number
          const addressStreet = profile.organizations.address_street || "";
          const streetMatch = addressStreet.match(/^(.+?)\s+(\d+.*)$/);
          const street = streetMatch ? streetMatch[1] : addressStreet;
          const houseNumber = streetMatch ? streetMatch[2] : "";

          organizationForm.reset({
            name: profile.organizations.name || "",
            vatNumber: profile.organizations.vat_number || "",
            email: profile.organizations.billing_email || "",
            addressStreet: street,
            addressHouseNumber: houseNumber,
            addressCity: profile.organizations.address_city || "",
            addressPostalCode: profile.organizations.address_postal_code || "",
            addressCountry: profile.organizations.address_country || "BE",
            bankAccountNumber: profile.organizations.bank_account_number || "",
            hasInvoiceTerms: profile.organizations.has_invoice_terms ? "yes" : "no",
            hasDamageClause: profile.organizations.has_damage_clause ? "yes" : "no",
            damageClausePercentage: profile.organizations.damage_clause_percentage?.toString() || "",
            hasMinimumDamageClause: profile.organizations.has_minimum_damage_clause ? "yes" : "no",
            minimumDamageClauseAmount: profile.organizations.minimum_damage_clause_amount?.toString() || "",
            delayInterestType: profile.organizations.delay_interest_type || "no",
            delayInterestPercentage: profile.organizations.delay_interest_percentage?.toString() || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Wachtwoord gewijzigd",
        description: "Uw wachtwoord is succesvol gewijzigd",
      });

      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het wijzigen van het wachtwoord",
        variant: "destructive",
      });
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          phone: data.phone || null,
        })
        .eq("id", profileData.id);

      if (error) throw error;

      toast({
        title: "Profiel bijgewerkt",
        description: "Uw profielgegevens zijn succesvol bijgewerkt",
      });
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceTermsFile(file);
      organizationForm.setValue("invoiceTermsFile", file);
    }
  };

  const removeFile = () => {
    setInvoiceTermsFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    organizationForm.setValue("invoiceTermsFile", undefined);
  };

  const onOrganizationSubmit = async (data: OrganizationFormData) => {
    if (!organizationData) return;

    try {
      // Combine street and house number
      const fullStreet = data.addressHouseNumber 
        ? `${data.addressStreet || ""} ${data.addressHouseNumber}`.trim()
        : data.addressStreet || null;

      // Upload invoice terms file if provided
      let invoiceTermsPath = organizationData.invoice_terms_path || null;
      if (invoiceTermsFile) {
        const fileExt = invoiceTermsFile.name.split('.').pop();
        const fileName = `${organizationData.id}-invoice-terms-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('organization-documents')
          .upload(fileName, invoiceTermsFile);

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist')) {
            throw new Error('De storage bucket "organization-documents" bestaat nog niet. Maak deze eerst aan in Supabase Storage.');
          }
          throw uploadError;
        }
        invoiceTermsPath = fileName;
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          name: data.name,
          vat_number: data.vatNumber || null,
          billing_email: data.email,
          address_street: fullStreet,
          address_city: data.addressCity || null,
          address_postal_code: data.addressPostalCode || null,
          address_country: data.addressCountry,
          bank_account_number: data.bankAccountNumber || null,
          has_invoice_terms: data.hasInvoiceTerms ? (data.hasInvoiceTerms === "yes") : null,
          invoice_terms_path: invoiceTermsPath,
          has_damage_clause: data.hasDamageClause ? (data.hasDamageClause === "yes") : null,
          damage_clause_percentage: data.damageClausePercentage ? parseFloat(data.damageClausePercentage) : null,
          has_minimum_damage_clause: data.hasMinimumDamageClause ? (data.hasMinimumDamageClause === "yes") : null,
          minimum_damage_clause_amount: data.minimumDamageClauseAmount ? parseFloat(data.minimumDamageClauseAmount) : null,
          delay_interest_type: data.delayInterestType || null,
          delay_interest_percentage: data.delayInterestPercentage ? parseFloat(data.delayInterestPercentage) : null,
        })
        .eq("id", organizationData.id);

      if (error) throw error;

      toast({
        title: "Organisatie bijgewerkt",
        description: "De organisatiegegevens zijn succesvol bijgewerkt",
      });

      // Reload data to get updated file path
      await loadData();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  const hasInvoiceTerms = organizationForm.watch("hasInvoiceTerms");
  const hasDamageClause = organizationForm.watch("hasDamageClause");
  const hasMinimumDamageClause = organizationForm.watch("hasMinimumDamageClause");
  const delayInterestType = organizationForm.watch("delayInterestType");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Instellingen</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profielgegevens</CardTitle>
            <CardDescription>Uw persoonlijke gegevens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Volledige naam</Label>
                <Input
                  id="fullName"
                  {...profileForm.register("fullName")}
                />
                {profileForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer</Label>
                <Input
                  id="phone"
                  {...profileForm.register("phone")}
                />
              </div>
              <Button type="submit">Opslaan</Button>
            </form>

            <div className="border-t pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Wachtwoord</h3>
                    <p className="text-sm text-muted-foreground">Wijzig uw wachtwoord</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? "Annuleren" : "Wachtwoord wijzigen"}
                  </Button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Huidig wachtwoord</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register("newPassword")}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit">Wachtwoord wijzigen</Button>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {organizationData && (
          <Card>
            <CardHeader>
              <CardTitle>Organisatiegegevens</CardTitle>
              <CardDescription>Gegevens van uw organisatie</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Bedrijfsnaam</Label>
                  <Input
                    id="orgName"
                    {...organizationForm.register("name")}
                  />
                  {organizationForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {organizationForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">BTW-nummer</Label>
                    <Input
                      id="vatNumber"
                      {...organizationForm.register("vatNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...organizationForm.register("email")}
                    />
                    {organizationForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {organizationForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressStreet">Straat</Label>
                    <Input
                      id="addressStreet"
                      {...organizationForm.register("addressStreet")}
                      placeholder="Kerkstraat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressHouseNumber">Huisnummer</Label>
                    <Input
                      id="addressHouseNumber"
                      {...organizationForm.register("addressHouseNumber")}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressPostalCode">Postcode</Label>
                    <Input
                      id="addressPostalCode"
                      {...organizationForm.register("addressPostalCode")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressCity">Stad</Label>
                    <Input
                      id="addressCity"
                      {...organizationForm.register("addressCity")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressCountry">Land</Label>
                    <Input
                      id="addressCountry"
                      {...organizationForm.register("addressCountry")}
                      defaultValue="BE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Bankrekeningnummer</Label>
                  <Input
                    id="bankAccountNumber"
                    {...organizationForm.register("bankAccountNumber")}
                    placeholder="BE68 5390 0754 7034"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dit hebben we nodig om gelden over te maken.
                  </p>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Heb je algemene voorwaarden?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="no"
                          {...organizationForm.register("hasInvoiceTerms", {
                            onChange: (e) => {
                              if (e.target.value === "no") {
                                removeFile();
                                organizationForm.setValue("invoiceTermsFile", undefined);
                              }
                            }
                          })}
                          className="w-4 h-4"
                        />
                        <span>Nee</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="yes"
                          {...organizationForm.register("hasInvoiceTerms")}
                          className="w-4 h-4"
                        />
                        <span>Ja</span>
                      </label>
                    </div>
                  </div>

                  {hasInvoiceTerms === "yes" && (
                    <div className="space-y-2">
                      <Label>Algemene voorwaarden uploaden</Label>
                      {invoiceTermsFile ? (
                        <div className="flex items-center gap-2 p-3 border rounded-lg">
                          <span className="flex-1">{invoiceTermsFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id="invoiceTermsFile"
                          />
                          <label
                            htmlFor="invoiceTermsFile"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Klik om te uploaden of sleep bestand hierheen
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {hasInvoiceTerms === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label>Heb je een schadebeding voorzien?</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="no"
                              {...organizationForm.register("hasDamageClause")}
                              className="w-4 h-4"
                            />
                            <span>Nee</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="yes"
                              {...organizationForm.register("hasDamageClause")}
                              className="w-4 h-4"
                            />
                            <span>Ja</span>
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Dit is het forfaitaire schadebeding dat verschuldigd is bij laattijdige betaling. Het gaat om een percentage. Bijvoorbeeld: "In geval van laattijdige betaling zal een forfaitaire schadevergoeding van 10 % van het factuurbedrag verschuldigd zijn. Indien er ook een vast bedrag bepaald is kun je dat hieronder invullen".
                        </p>
                      </div>

                      {hasDamageClause === "yes" && (
                        <div className="space-y-4 pl-4 border-l-2">
                          <div className="space-y-2">
                            <Label htmlFor="damageClausePercentage">Percentage</Label>
                            <Input
                              id="damageClausePercentage"
                              type="number"
                              step="0.01"
                              {...organizationForm.register("damageClausePercentage")}
                              placeholder="5.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Is er een minimum schadebeding voorzien per factuur?</Label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="no"
                                  {...organizationForm.register("hasMinimumDamageClause")}
                                  className="w-4 h-4"
                                />
                                <span>Nee</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  value="yes"
                                  {...organizationForm.register("hasMinimumDamageClause")}
                                  className="w-4 h-4"
                                />
                                <span>Ja</span>
                              </label>
                            </div>
                          </div>

                          {hasMinimumDamageClause === "yes" && (
                            <div className="space-y-2">
                              <Label htmlFor="minimumDamageClauseAmount">Minimum schadebeding bedrag</Label>
                              <Input
                                id="minimumDamageClauseAmount"
                                type="number"
                                step="0.01"
                                {...organizationForm.register("minimumDamageClauseAmount")}
                                placeholder="40.00"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Zijn er verwijlinterest voorzien?</Label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="no"
                              {...organizationForm.register("delayInterestType")}
                              className="w-4 h-4"
                            />
                            <span>Nee</span>
                          </label>
                          <label className="flex items-start gap-2">
                            <input
                              type="radio"
                              value="law_2002"
                              {...organizationForm.register("delayInterestType")}
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex flex-col">
                              <span>Ja (wet van 2002)</span>
                              <span className="text-xs text-muted-foreground">
                                In te vullen als toepassing wordt gemaakt van de wet ter bestrijding van betalingsachterstand bij handelstransacties van 02/08/2002.
                              </span>
                            </div>
                          </label>
                          <label className="flex items-start gap-2">
                            <input
                              type="radio"
                              value="fixed"
                              {...organizationForm.register("delayInterestType")}
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex flex-col">
                              <span>Ja (vaste interest)</span>
                              <span className="text-xs text-muted-foreground">
                                Kruis dit aan als er een vaste intrestvoet voorzien is in je algemene voorwaarden. (op jaarbasis)
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {delayInterestType === "fixed" && (
                        <div className="space-y-2">
                          <Label htmlFor="delayInterestPercentage">Percentage</Label>
                          <Input
                            id="delayInterestPercentage"
                            type="number"
                            step="0.01"
                            {...organizationForm.register("delayInterestPercentage")}
                            placeholder="10.5"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button type="submit">Opslaan</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
