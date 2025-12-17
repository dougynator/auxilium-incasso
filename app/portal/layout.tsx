import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Logo from "@/components/logo";
import PortalNav from "@/components/portal-nav";
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import PortalLanguageSwitcher from "@/components/portal-language-switcher";
import PortalLanguageProvider from "@/components/portal-language-provider";
import PortalLogoutButton from "@/components/portal-logout-button";

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

  // Redirect admin/staff users to admin portal
  if (profile && (profile.role === "admin" || profile.role === "staff")) {
    redirect("/admin");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const navigationItems = [
    {
      nameKey: "dashboard",
      href: "/portal",
      iconName: "Home",
    },
    {
      nameKey: "assignments",
      href: "/portal/cases",
      iconName: "FileText",
    },
    {
      nameKey: "library",
      href: "/portal/bibliotheek",
      iconName: "Library",
    },
    {
      nameKey: "account",
      href: "/portal/settings",
      iconName: "User",
    },
    {
      nameKey: "integrations",
      href: "/portal/integraties",
      iconName: "Plug",
    },
  ];

  // Get messages for all locales so users can switch languages
  const nlMessages = await getMessages({ locale: 'nl' });
  const enMessages = await getMessages({ locale: 'en' });
  const frMessages = await getMessages({ locale: 'fr' });

  return (
    <PortalLanguageProvider nlMessages={nlMessages} enMessages={enMessages} frMessages={frMessages}>
      <div className="min-h-screen bg-gray-50">
        {/* Top header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Logo href="/portal" />
            </div>
            <div className="flex items-center gap-4">
              <PortalLanguageSwitcher />
              {profile?.role === "admin" || profile?.role === "staff" ? (
                <Link href="/admin" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
                  Admin
                </Link>
              ) : null}
              <PortalLogoutButton onSignOut={handleSignOut} />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar navigation */}
          <aside className="w-64 bg-white border-r fixed top-[73px] left-0 bottom-0 overflow-y-auto">
            <PortalNav items={navigationItems} namespace="portal.nav" />
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 ml-64">{children}</main>
        </div>
      </div>
    </PortalLanguageProvider>
  );
}

