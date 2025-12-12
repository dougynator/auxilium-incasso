import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PortalDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile and organization
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (process.env.NODE_ENV === 'development') {
    if (profileError) {
      console.log('❌ Portal page - Profile error:', profileError.message);
    } else {
      console.log('✅ Portal page - Profile found:', profile?.role);
    }
  }

  // Don't redirect if profile doesn't exist - show error instead
  // This allows users to complete their profile setup
  if (!profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Portal page - No profile found for user:', user.id);
    }
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
    .order("created_at", { ascending: false })
    .limit(10);

  if (profile.role === "client") {
    casesQuery = casesQuery.eq("organization_id", profile.organization_id);
  }

  const { data: cases } = await casesQuery;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Concept",
      sent: "Verzonden",
      in_progress: "In behandeling",
      paid: "Betaald",
      closed: "Afgesloten",
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welkom terug, {profile.full_name || user.email}
          </p>
        </div>
        <Link href="/portal/cases/new">
          <Button>Nieuwe opdracht</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totaal opdrachten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cases?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Openstaand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {cases?.filter((c) => c.status !== "paid" && c.status !== "closed").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totaal bedrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                cases?.reduce((sum, c) => sum + Number(c.total_amount || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recente opdrachten</CardTitle>
          <CardDescription>Overzicht van uw recente incassodossiers</CardDescription>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <div className="space-y-4">
              {cases.map((caseItem: any) => (
                <Link
                  key={caseItem.id}
                  href={`/portal/cases/${caseItem.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseItem.invoice_number && `Factuur: ${caseItem.invoice_number} • `}
                        {formatDate(caseItem.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(caseItem.total_amount)}</div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {getStatusLabel(caseItem.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nog geen opdrachten</p>
              <Link href="/portal/cases/new">
                <Button className="mt-4">Maak uw eerste opdracht aan</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

