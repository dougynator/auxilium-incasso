import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { LogOut } from "lucide-react";
import PortalNav from "@/components/portal-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // First try to get session, then user
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Portal layout - Session check:', sessionData?.session ? 'Valid' : 'Invalid');
  }
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Portal layout - User check:', user ? `User found: ${user.email}` : 'No user');
    if (userError) {
      console.log('❌ Portal layout - Auth error:', userError.message);
    }
    // Log all cookies for debugging
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('🍪 Portal layout - All cookies:', allCookies.map(c => c.name));
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

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/portal",
      iconName: "Home",
    },
    {
      name: "Jouw opdrachten",
      href: "/portal/cases",
      iconName: "FileText",
    },
    {
      name: "Bibliotheek",
      href: "/portal/bibliotheek",
      iconName: "Library",
    },
    {
      name: "Account",
      href: "/portal/settings",
      iconName: "User",
    },
    {
      name: "Integraties",
      href: "/portal/integraties",
      iconName: "Plug",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo href="/portal" />
            <span className="font-sans text-lg text-muted-foreground ml-2">- Portaal</span>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === "admin" || profile?.role === "staff" ? (
              <Link href="/admin" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            ) : null}
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
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <PortalNav items={navigationItems} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

