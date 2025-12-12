import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .order("created_at", { ascending: false });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Beheerder",
      staff: "Medewerker",
      client: "Klant",
    };
    return labels[role] || role;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gebruikers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles && profiles.length > 0 ? (
            <div className="space-y-4">
              {profiles.map((profile: any) => (
                <div
                  key={profile.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{profile.full_name || "Geen naam"}</div>
                      <div className="text-sm text-muted-foreground">
                        {profile.organizations?.name || "Geen organisatie"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Aangemaakt: {formatDate(profile.created_at)}
                      </div>
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                        {getRoleLabel(profile.role)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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

