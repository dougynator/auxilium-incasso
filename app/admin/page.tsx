import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  // Get all cases for statistics
  const { data: allCases } = await supabase.from("cases").select("status, total_amount");
  const { data: organizations } = await supabase.from("organizations").select("id");
  const { data: profiles } = await supabase.from("profiles").select("role");

  // Get recent cases for display
  const { data: cases } = await supabase
    .from("cases")
    .select("id, status, total_amount, created_at, invoice_number, debtors(name, company_name), organizations(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  const totalCases = allCases?.length || 0;
  const openCases = allCases?.filter((c) => c.status !== "paid" && c.status !== "closed").length || 0;
  const paidCases = allCases?.filter((c) => c.status === "paid").length || 0;
  const totalAmount = allCases?.reduce((sum, c) => sum + Number(c.total_amount || 0), 0) || 0;
  const totalClients = organizations?.length || 0;
  const totalStaff = profiles?.filter((p) => p.role === "staff" || p.role === "admin").length || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welkom terug, {profile?.full_name || "Admin Gebruiker"}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Totaal opdrachten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Openstaand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Totaal bedrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Recente opdrachten</h2>
        <p className="text-muted-foreground mb-4">
          Overzicht van recente incassodossiers
        </p>
      </div>

      {cases && cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((caseItem: any) => (
            <Link
              key={caseItem.id}
              href={`/admin/cases/${caseItem.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {caseItem.organizations?.name || "Onbekende klant"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekende debiteur"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseItem.invoice_number && `Factuur: ${caseItem.invoice_number} • `}
                        {formatDate(caseItem.created_at)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-lg mb-2">
                        {formatCurrency(caseItem.total_amount)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        caseItem.status === "paid" 
                          ? "bg-green-100 text-green-800" 
                          : caseItem.status === "bailiff" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {caseItem.status === "paid" ? "Ontvangen" : caseItem.status === "bailiff" ? "Deurwaarder" : "Open"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Geen opdrachten gevonden
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

