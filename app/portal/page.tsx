import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/portal/dashboard-content";
import ProfileError from "@/components/portal/profile-error";

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

  // Redirect admin/staff users to admin portal
  if (profile && (profile.role === "admin" || profile.role === "staff")) {
    redirect("/admin");
  }

  // Don't redirect if profile doesn't exist - show error instead
  // This allows users to complete their profile setup
  if (!profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Portal page - No profile found for user:', user.id);
    }
    return <ProfileError />;
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

  return (
    <DashboardContent 
      profile={profile}
      user={user}
      cases={cases || []}
    />
  );
}

