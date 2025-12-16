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
  email: z.string().email("Ongeldig e-mailadres"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Huidig wachtwoord is verplicht"),
  newPassword: z.string().min(8, "Nieuw wachtwoord moet minimaal 8 karakters zijn"),
  confirmPassword: z.string().min(1, "Bevestig wachtwoord is verplicht"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfileData(profile);
        resetProfile({
          fullName: profile.full_name || "",
          email: user.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Geen gebruiker gevonden");
      }

      // Update email in auth
      const { error: emailError } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (emailError) throw emailError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profiel bijgewerkt",
        description: "Je profielgegevens zijn succesvol bijgewerkt",
      });

      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Fout",
        description: error.message || "Kon profiel niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setChangingPassword(true);
    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("Geen gebruiker gevonden");
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        throw new Error("Huidig wachtwoord is incorrect");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je wachtwoord is succesvol gewijzigd",
      });

      resetPassword();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Fout",
        description: error.message || "Kon wachtwoord niet wijzigen",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Account</h1>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profielgegevens</CardTitle>
            <CardDescription>
              Wijzig je naam en e-mailadres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Volledige naam *</Label>
                <Input
                  id="fullName"
                  {...registerProfile("fullName")}
                  placeholder="Jan Janssen"
                />
                {profileErrors.fullName && (
                  <p className="text-sm text-destructive">{profileErrors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres *</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile("email")}
                  placeholder="gebruiker@example.com"
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Opslaan..." : "Opslaan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord wijzigen</CardTitle>
            <CardDescription>
              Wijzig je wachtwoord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Huidig wachtwoord *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword("currentPassword")}
                  placeholder="Voer je huidige wachtwoord in"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nieuw wachtwoord *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword")}
                  placeholder="Minimaal 8 karakters"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig nieuw wachtwoord *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword("confirmPassword")}
                  placeholder="Herhaal je nieuwe wachtwoord"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Wijzigen..." : "Wachtwoord wijzigen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

