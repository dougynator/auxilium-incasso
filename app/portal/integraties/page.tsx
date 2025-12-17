import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import IntegratiesContent from "@/components/portal/integraties-content";
import ProfileError from "@/components/portal/profile-error";

export default async function IntegratiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <ProfileError />;
  }

  return <IntegratiesContent />;
}


