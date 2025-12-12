"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  fullName: z.string().min(1, "Naam is verplicht"),
  phone: z.string().optional(),
});

const organizationSchema = z.object({
  name: z.string().min(1, "Bedrijfsnaam is verplicht"),
  vatNumber: z.string().optional(),
  billingEmail: z.string().email("Ongeldig e-mailadres"),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().default("BE"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any>(null);

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
          organizationForm.reset({
            name: profile.organizations.name || "",
            vatNumber: profile.organizations.vat_number || "",
            billingEmail: profile.organizations.billing_email || "",
            addressStreet: profile.organizations.address_street || "",
            addressCity: profile.organizations.address_city || "",
            addressPostalCode: profile.organizations.address_postal_code || "",
            addressCountry: profile.organizations.address_country || "BE",
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
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

  const onOrganizationSubmit = async (data: OrganizationFormData) => {
    if (!organizationData) return;

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: data.name,
          vat_number: data.vatNumber || null,
          billing_email: data.billingEmail,
          address_street: data.addressStreet || null,
          address_city: data.addressCity || null,
          address_postal_code: data.addressPostalCode || null,
          address_country: data.addressCountry,
        })
        .eq("id", organizationData.id);

      if (error) throw error;

      toast({
        title: "Organisatie bijgewerkt",
        description: "De organisatiegegevens zijn succesvol bijgewerkt",
      });
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Instellingen</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profielgegevens</CardTitle>
            <CardDescription>Uw persoonlijke gegevens</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Label htmlFor="billingEmail">Facturatie e-mail</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      {...organizationForm.register("billingEmail")}
                    />
                    {organizationForm.formState.errors.billingEmail && (
                      <p className="text-sm text-destructive">
                        {organizationForm.formState.errors.billingEmail.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Straat</Label>
                  <Input
                    id="addressStreet"
                    {...organizationForm.register("addressStreet")}
                  />
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
                <Button type="submit">Opslaan</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

