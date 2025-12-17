import { createClient } from "@/lib/supabase/server";
import AdminDashboardContent from "@/components/admin/dashboard-content";

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
  const totalAmount = allCases?.reduce((sum, c) => sum + Number(c.total_amount || 0), 0) || 0;

  return (
    <AdminDashboardContent 
      profile={profile}
      totalCases={totalCases}
      openCases={openCases}
      totalAmount={totalAmount}
      cases={cases || []}
    />
  );
}

