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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const userSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  fullName: z.string().min(1, "Naam is verplicht"),
  role: z.enum(["admin", "staff", "client"]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) {
        toast({
          title: "Fout",
          description: "Gebruiker niet gevonden",
          variant: "destructive",
        });
        router.push("/admin/users");
        return;
      }

      // Get email from auth
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find(u => u.id === userId);

      reset({
        email: user?.email || "",
        fullName: profile.full_name || "",
        role: profile.role as "admin" | "staff" | "client",
      });
    } catch (error: any) {
      console.error("Error loading user:", error);
      toast({
        title: "Fout",
        description: "Kon gebruiker niet laden",
        variant: "destructive",
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      // Update email in auth (if changed)
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const currentUser = users?.find(u => u.id === userId);
      
      if (currentUser?.email !== data.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
          email: data.email,
        });
        if (emailError) throw emailError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          role: data.role,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Gebruiker bijgewerkt",
        description: `${data.fullName} is succesvol bijgewerkt`,
      });

      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het bijwerken van de gebruiker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>Laden...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar gebruikers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Gebruiker bewerken</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gebruikersgegevens</CardTitle>
          <CardDescription>
            Wijzig de gegevens van de gebruiker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
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
              <Label htmlFor="fullName">Volledige naam *</Label>
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
              <Label htmlFor="role">Rol *</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="client">Klant</option>
                <option value="staff">Medewerker</option>
                <option value="admin">Beheerder</option>
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Opslaan..." : "Opslaan"}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  Annuleren
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

