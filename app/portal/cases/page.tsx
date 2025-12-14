import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Betaald";
      case "sent":
        return "Verzonden";
      case "pending":
        return "In behandeling";
      case "closed":
        return "Gesloten";
      default:
        return status;
    }
  };

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

      {cases && cases.length > 0 ? (
        <div className="grid gap-4">
          {cases.map((caseItem: any) => (
            <Link key={caseItem.id} href={`/portal/cases/${caseItem.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-display text-xl mb-2">
                        {caseItem.debtors?.name || "Onbekende debiteur"}
                      </CardTitle>
                      <CardDescription className="font-sans">
                        Factuurnummer: {caseItem.invoice_number || "N/A"}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {getStatusLabel(caseItem.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 font-sans">
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrag</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(caseItem.total_amount, caseItem.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aangemaakt</p>
                      <p className="text-lg font-semibold">
                        {formatDate(caseItem.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vervaldatum</p>
                      <p className="text-lg font-semibold">
                        {caseItem.due_date ? formatDate(caseItem.due_date) : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-sans text-muted-foreground mb-4">
              Je hebt nog geen opdrachten ingediend.
            </p>
            <Link href="/portal/cases/new">
              <Button className="font-display bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Eerste opdracht indienen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

