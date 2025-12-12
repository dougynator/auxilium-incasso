import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import CaseFilters from "@/components/admin/case-filters";

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const supabase = await createClient();

  let casesQuery = supabase
    .from("cases")
    .select("*, debtors(*), organizations(*)")
    .order("created_at", { ascending: false });

  if (searchParams.status) {
    casesQuery = casesQuery.eq("status", searchParams.status);
  }

  if (searchParams.search) {
    // Search in invoice number, debtor name, or structured reference
    casesQuery = casesQuery.or(
      `invoice_number.ilike.%${searchParams.search}%,debtors.name.ilike.%${searchParams.search}%,debtors.company_name.ilike.%${searchParams.search}%,structured_reference.ilike.%${searchParams.search}%`
    );
  }

  const { data: cases } = await casesQuery.limit(50);

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
        <h1 className="text-3xl font-bold">Opdrachten</h1>
      </div>

      <Suspense fallback={<div>Laden...</div>}>
        <CaseFilters />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht</CardTitle>
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
                    <div className="flex-1">
                      <div className="font-semibold">
                        {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseItem.organizations?.name} • {caseItem.invoice_number && `Factuur: ${caseItem.invoice_number} • `}
                        {formatDate(caseItem.created_at)}
                      </div>
                      {caseItem.structured_reference && (
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {caseItem.structured_reference}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold mb-2">{formatCurrency(caseItem.total_amount)}</div>
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
              Geen opdrachten gevonden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

