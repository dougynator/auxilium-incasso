"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DeleteUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
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

      setUserData({
        ...profile,
        email: user?.email || "Geen email",
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

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      return;
    }

    setLoading(true);
    try {
      // Delete user from auth (this will cascade delete the profile due to ON DELETE CASCADE)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) throw deleteError;

      toast({
        title: "Gebruiker verwijderd",
        description: `${userData?.full_name || "Gebruiker"} is succesvol verwijderd`,
      });

      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het verwijderen van de gebruiker",
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

  if (!userData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Gebruiker niet gevonden</h2>
        <Link href="/admin/users">
          <Button variant="outline">Terug naar gebruikers</Button>
        </Link>
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
        <h1 className="text-3xl font-bold">Gebruiker verwijderen</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Waarschuwing
          </CardTitle>
          <CardDescription>
            Je staat op het punt om een gebruiker permanent te verwijderen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="font-semibold mb-2">Gebruikersgegevens:</div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Naam:</span> {userData.full_name || "Geen naam"}</div>
              <div><span className="font-medium">Email:</span> {userData.email}</div>
              <div><span className="font-medium">Rol:</span> {userData.role === "admin" ? "Beheerder" : userData.role === "staff" ? "Medewerker" : "Klant"}</div>
              {userData.organizations && (
                <div><span className="font-medium">Organisatie:</span> {userData.organizations.name}</div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Let op:</strong> Deze actie kan niet ongedaan worden gemaakt. Alle gegevens van deze gebruiker zullen permanent worden verwijderd.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Verwijderen..." : "Gebruiker verwijderen"}
            </Button>
            <Link href="/admin/users">
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

