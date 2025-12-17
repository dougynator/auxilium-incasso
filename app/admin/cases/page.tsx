import { createClient } from "@/lib/supabase/server";
import AdminCasesPageContent from "@/components/admin/cases-page-content";

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

  return <AdminCasesPageContent cases={cases || []} />;
}

