import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/portal");
  }

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
          <div className="flex items-center">
            <Logo href="/admin" />
            <span className="text-lg text-muted-foreground ml-2">- Admin</span>
          </div>
          <nav className="flex gap-6 items-center">
            <Link href="/admin" className="hover:text-primary">Dashboard</Link>
            <Link href="/admin/cases" className="hover:text-primary">Opdrachten</Link>
            <Link href="/admin/users" className="hover:text-primary">Gebruikers</Link>
            <Link href="/portal" className="hover:text-primary">Portaal</Link>
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

