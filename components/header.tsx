import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { User } from "lucide-react";

interface HeaderProps {
  currentPage?: string;
  showPortalButton?: boolean;
  hideNav?: boolean;
}

export default function Header({ currentPage, showPortalButton = true, hideNav = false }: HeaderProps) {
  return (
    <header className="border-b border-primary/10 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        {!hideNav && (
        <nav className="flex gap-6 items-center">
          <Link 
            href="/diensten" 
            className={`
              font-sans text-sm md:text-base font-medium text-foreground
              transition-all duration-300 ease-out
              hover:text-primary hover:scale-105
              ${currentPage === "diensten" ? "text-primary font-semibold" : ""}
            `}
          >
            Diensten
          </Link>
          <Link 
            href="/werkwijze" 
            className={`
              font-sans text-sm md:text-base font-medium text-foreground
              transition-all duration-300 ease-out
              hover:text-primary hover:scale-105
              ${currentPage === "werkwijze" ? "text-primary font-semibold" : ""}
            `}
          >
            Werkwijze
          </Link>
          <Link 
            href="/prijzen" 
            className={`
              font-sans text-sm md:text-base font-medium text-foreground
              transition-all duration-300 ease-out
              hover:text-primary hover:scale-105
              ${currentPage === "prijzen" ? "text-primary font-semibold" : ""}
            `}
          >
            Prijzen
          </Link>
          <Link 
            href="/over-ons" 
            className={`
              font-sans text-sm md:text-base font-medium text-foreground
              transition-all duration-300 ease-out
              hover:text-primary hover:scale-105
              ${currentPage === "over-ons" ? "text-primary font-semibold" : ""}
            `}
          >
            Over ons
          </Link>
          <Link 
            href="/contact" 
            className={`
              font-sans text-sm md:text-base font-medium text-foreground
              transition-all duration-300 ease-out
              hover:text-primary hover:scale-105
              ${currentPage === "contact" ? "text-primary font-semibold" : ""}
            `}
          >
            Contact
          </Link>
          {showPortalButton && (
            <Link href="/login">
              <button className="
                font-sans text-sm md:text-base font-semibold
                bg-primary text-white px-5 py-2.5 rounded-lg
                transition-all duration-300 ease-out
                hover:bg-primary/90 hover:scale-105 hover:shadow-lg
                active:scale-95
                transform flex items-center gap-2
              ">
                <User className="w-4 h-4" />
                Inloggen
              </button>
            </Link>
          )}
        </nav>
        )}
      </div>
    </header>
  );
}

