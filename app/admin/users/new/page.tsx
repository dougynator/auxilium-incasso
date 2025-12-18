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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

const userSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters zijn"),
  fullName: z.string().min(1, "Naam is verplicht"),
  role: z.enum(["admin", "staff", "client"]),
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
}).refine((data) => {
  if (data.role === "client") {
    return !!(data.organizationId || data.organizationName);
  }
  return true;
}, {
  message: "Organisatie is verplicht voor client accounts",
  path: ["organizationId"],
});

type UserFormData = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const t = useTranslations('admin.users.new');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('admin.users.roles');
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "staff",
    },
  });

  const selectedRole = watch("role");

  // Load organizations when component mounts
  useEffect(() => {
    async function loadOrganizations() {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setOrganizations(data || []);
      } catch (error: any) {
        console.error("Error loading organizations:", error);
      } finally {
        setLoadingOrgs(false);
      }
    }
    loadOrganizations();
  }, [supabase]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      let organizationId: string | null = null;

      // If client role, create or get organization
      if (data.role === "client") {
        if (data.organizationId) {
          organizationId = data.organizationId;
        } else if (data.organizationName) {
          // Create new organization
          const { data: newOrg, error: orgError } = await supabase
            .from("organizations")
            .insert({
              name: data.organizationName,
              billing_email: data.email,
              address_country: "BE",
            })
            .select("id")
            .single();

          if (orgError) {
            throw new Error(`Kon organisatie niet aanmaken: ${orgError.message}`);
          }

          organizationId = newOrg.id;
        } else {
          throw new Error("Organisatie is verplicht voor client accounts");
        }
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Gebruiker kon niet worden aangemaakt");
      }

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          role: data.role,
          organization_id: organizationId,
        });

      if (profileError) {
        // If profile creation fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      toast({
        title: t('created'),
        description: `${data.fullName} ${t('createdDesc')} ${tRoles(data.role)}`,
      });

      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: tCommon('error'),
        description: error.message || t('error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToUsers')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tCommon('userData')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="gebruiker@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')} *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Minimaal 8 karakters"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')} *</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Jan Janssen"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('role')} *</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="staff">{tRoles('staff')}</option>
                <option value="admin">{tRoles('admin')}</option>
                <option value="client">{tRoles('client')}</option>
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            {selectedRole === "client" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationId">Bestaande organisatie</Label>
                  <select
                    id="organizationId"
                    {...register("organizationId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Selecteer organisatie --</option>
                    {loadingOrgs ? (
                      <option>Laden...</option>
                    ) : (
                      organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.organizationId && (
                    <p className="text-sm text-destructive">{errors.organizationId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Of nieuwe organisatie naam</Label>
                  <Input
                    id="organizationName"
                    {...register("organizationName")}
                    placeholder="Nieuwe organisatie naam"
                  />
                  <p className="text-sm text-muted-foreground">
                    Laat leeg als je een bestaande organisatie hebt geselecteerd
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? t('creating') : t('create')}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  {tCommon('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

