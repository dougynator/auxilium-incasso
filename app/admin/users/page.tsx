import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Get all profiles with organizations
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .order("created_at", { ascending: false });

  // Get all auth users to get email addresses
  const { data: { users } } = await supabase.auth.admin.listUsers();

  // Create a map of user IDs to emails
  const userEmailMap = new Map(users?.map(u => [u.id, u.email]) || []);

  // Combine profiles with emails
  const usersWithEmails = profiles?.map(profile => ({
    ...profile,
    email: userEmailMap.get(profile.id) || "Geen email",
  })) || [];

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Beheerder",
      staff: "Medewerker",
      client: "Klant",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      staff: "bg-blue-100 text-blue-800",
      client: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gebruikers</h1>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Gebruiker toevoegen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          {usersWithEmails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Naam</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Rol</th>
                    <th className="text-left p-4 font-semibold">Organisatie</th>
                    <th className="text-left p-4 font-semibold">Aangemaakt</th>
                    <th className="text-right p-4 font-semibold">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithEmails.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{user.full_name || "Geen naam"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{user.organizations?.name || "-"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/users/${user.id}/delete`}>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Geen gebruikers gevonden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

