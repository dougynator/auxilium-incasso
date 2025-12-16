import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import CaseFilters from "@/components/admin/case-filters";
import CasesTable from "@/components/admin/cases-table";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dossiers</h1>
      </div>

      <Suspense fallback={<div>Laden...</div>}>
        <CaseFilters />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Laden...</div>}>
            <CasesTable cases={cases || []} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

