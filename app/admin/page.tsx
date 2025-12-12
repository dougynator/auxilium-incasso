import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get statistics
  const { data: cases } = await supabase.from("cases").select("status, total_amount");
  const { data: organizations } = await supabase.from("organizations").select("id");
  const { data: profiles } = await supabase.from("profiles").select("role");

  const totalCases = cases?.length || 0;
  const openCases = cases?.filter((c) => c.status !== "paid" && c.status !== "closed").length || 0;
  const paidCases = cases?.filter((c) => c.status === "paid").length || 0;
  const totalAmount = cases?.reduce((sum, c) => sum + Number(c.total_amount || 0), 0) || 0;
  const totalClients = organizations?.length || 0;
  const totalStaff = profiles?.filter((p) => p.role === "staff" || p.role === "admin").length || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totaal opdrachten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCases}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {openCases} openstaand, {paidCases} betaald
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totaal bedrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Klanten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {totalStaff} medewerkers
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Snelle acties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/cases">
              <Button className="w-full" variant="outline">
                Alle opdrachten bekijken
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                Gebruikers beheren
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recente activiteit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Audit log en activiteiten worden hier getoond
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

