import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CasesPageContent from "@/components/portal/cases-page-content";
import ProfileError from "@/components/portal/profile-error";

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
    return <ProfileError />;
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

  return <CasesPageContent cases={cases || []} />;
}


