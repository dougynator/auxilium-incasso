"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Library, User, Plug, Users } from "lucide-react";
import { useTranslations } from 'next-intl';

interface NavItem {
  nameKey?: string; // Translation key instead of name
  name?: string; // Fallback to direct name
  href: string;
  iconName: string;
}

interface PortalNavProps {
  items: NavItem[];
  namespace?: 'portal.nav' | 'admin.nav'; // Which translation namespace to use
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileText,
  Library,
  User,
  Plug,
  Users,
};

export default function PortalNav({ items, namespace = 'portal.nav' }: PortalNavProps) {
  const pathname = usePathname();
  const t = useTranslations(namespace);

  return (
    <nav className="p-4 pt-8 space-y-2">
      {items.map((item) => {
        const Icon = iconMap[item.iconName] || Home;
        // Special handling for Dashboard (/portal or /admin) - only active on exact match
        // Other routes are active if exact match or starts with route + "/"
        const isActive = item.href === "/portal" || item.href === "/admin"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        
        const displayName = item.nameKey ? t(item.nameKey) : (item.name || '');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive 
                ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }
            `}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-sans">{displayName}</span>
          </Link>
        );
      })}
    </nav>
  );
}

