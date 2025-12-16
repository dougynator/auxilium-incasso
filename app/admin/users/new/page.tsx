"use client";

import { useState } from "react";
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

const userSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters zijn"),
  fullName: z.string().min(1, "Naam is verplicht"),
  role: z.enum(["admin", "staff"]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "staff",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
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
        });

      if (profileError) {
        // If profile creation fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      toast({
        title: "Gebruiker aangemaakt",
        description: `${data.fullName} is succesvol toegevoegd als ${data.role === "admin" ? "beheerder" : "medewerker"}`,
      });

      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het aanmaken van de gebruiker",
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
            Terug naar gebruikers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nieuwe gebruiker toevoegen</h1>
        <p className="text-muted-foreground mt-2">
          Voeg een nieuwe beheerder of medewerker toe aan het systeem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gebruikersgegevens</CardTitle>
          <CardDescription>
            Vul de gegevens in voor de nieuwe gebruiker
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
              <Label htmlFor="password">Wachtwoord *</Label>
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
                <option value="staff">Medewerker</option>
                <option value="admin">Beheerder</option>
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Aanmaken..." : "Gebruiker aanmaken"}
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

