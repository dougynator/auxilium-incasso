import { createClient } from "@/lib/supabase/server";
import AdminUsersPageContent from "@/components/admin/users-page-content";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Get all profiles with organizations
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .order("created_at", { ascending: false });

  // Get all auth users to get email addresses
  const { data: { users } } = await supabase.auth.admin.listUsers();

  // Create a map of user IDs to emails
  const userEmailMap = new Map(users?.map(u => [u.id, u.email]) || []);

  // Combine profiles with emails
  const usersWithEmails = profiles?.map(profile => ({
    ...profile,
    email: userEmailMap.get(profile.id) || "Geen email",
  })) || [];

  return <AdminUsersPageContent usersWithEmails={usersWithEmails} />;
}

