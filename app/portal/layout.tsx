import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Portal layout - User check:', user ? `User found: ${user.email}` : 'No user');
    if (userError) {
      console.log('❌ Portal layout - Auth error:', userError.message);
    }
  }

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Portal layout - Redirecting to login');
    }
    redirect("/login");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (process.env.NODE_ENV === 'development') {
    if (profileError) {
      console.log('❌ Portal layout - Profile error:', profileError.message);
    } else {
      console.log('✅ Portal layout - Profile found:', profile?.role);
    }
  }

  // Don't redirect if profile doesn't exist - user might be new
  // if (!profile) {
  //   redirect("/login");
  // }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/portal" className="text-2xl font-bold text-primary">
            Auxilium Incasso - Portaal
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/portal" className="hover:text-primary">Dashboard</Link>
            <Link href="/portal/cases/new" className="hover:text-primary">Nieuwe opdracht</Link>
            {profile?.role === "admin" || profile?.role === "staff" ? (
              <Link href="/admin" className="hover:text-primary">Admin</Link>
            ) : null}
            <form action={handleSignOut}>
              <Button type="submit" variant="outline">
                Uitloggen
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

