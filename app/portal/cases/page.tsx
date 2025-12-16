import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PortalCasesTable from "@/components/portal/cases-table";

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile and organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profiel niet gevonden</h2>
        <p className="text-muted-foreground mb-4">
          Uw profiel kon niet worden gevonden. Neem contact op met de beheerder.
        </p>
        <Link href="/portal/settings">
          <Button>Ga naar instellingen</Button>
        </Link>
      </div>
    );
  }

  // Get cases
  let casesQuery = supabase
    .from("cases")
    .select("*, debtors(*), organizations(*)")
    .order("created_at", { ascending: false });

  if (profile.role === "client") {
    casesQuery = casesQuery.eq("organization_id", profile.organization_id);
  }

  const { data: cases } = await casesQuery;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Jouw opdrachten
          </h1>
          <p className="font-sans text-muted-foreground">
            Overzicht van al je ingediende incasso opdrachten
          </p>
        </div>
        <Link href="/portal/cases/new">
          <Button className="font-display bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe opdracht
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <PortalCasesTable cases={cases} />
          ) : (
            <div className="text-center py-12">
              <p className="font-sans text-muted-foreground mb-4">
                Je hebt nog geen opdrachten ingediend.
              </p>
              <Link href="/portal/cases/new">
                <Button className="font-display bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste opdracht indienen
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


