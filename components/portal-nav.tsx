"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Library, User, Plug, Users } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  iconName: string;
}

interface PortalNavProps {
  items: NavItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileText,
  Library,
  User,
  Plug,
  Users,
};

export default function PortalNav({ items }: PortalNavProps) {
  const pathname = usePathname();

  return (
    <nav className="p-4 pt-8 space-y-2">
      {items.map((item) => {
        const Icon = iconMap[item.iconName] || Home;
        // Special handling for Dashboard (/portal or /admin) - only active on exact match
        // Other routes are active if exact match or starts with route + "/"
        const isActive = item.href === "/portal" || item.href === "/admin"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        
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
            <span className="font-sans">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

