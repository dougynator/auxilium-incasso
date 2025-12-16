import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { LogOut } from "lucide-react";
import PortalNav from "@/components/portal-nav";

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

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      iconName: "Home",
    },
    {
      name: "Dossiers",
      href: "/admin/cases",
      iconName: "FileText",
    },
    {
      name: "Gebruikers",
      href: "/admin/users",
      iconName: "Users",
    },
    {
      name: "Account",
      href: "/admin/account",
      iconName: "User",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo href="/admin" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
              Portaal
            </Link>
            <form action={handleSignOut}>
              <Button type="submit" variant="outline" size="sm" className="font-sans">
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar navigation */}
        <aside className="w-64 bg-white border-r fixed top-[73px] left-0 bottom-0 overflow-y-auto">
          <PortalNav items={navigationItems} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 ml-64">{children}</main>
      </div>
    </div>
  );
}

