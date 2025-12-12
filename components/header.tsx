import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

interface HeaderProps {
  currentPage?: string;
  showPortalButton?: boolean;
}

export default function Header({ currentPage, showPortalButton = true }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        <nav className="flex gap-6 items-center">
          <Link 
            href="/diensten" 
            className={`hover:text-primary ${currentPage === "diensten" ? "font-semibold" : ""}`}
          >
            Diensten
          </Link>
          <Link 
            href="/werkwijze" 
            className={`hover:text-primary ${currentPage === "werkwijze" ? "font-semibold" : ""}`}
          >
            Werkwijze
          </Link>
          <Link 
            href="/prijzen" 
            className={`hover:text-primary ${currentPage === "prijzen" ? "font-semibold" : ""}`}
          >
            Prijzen
          </Link>
          <Link 
            href="/over-ons" 
            className={`hover:text-primary ${currentPage === "over-ons" ? "font-semibold" : ""}`}
          >
            Over ons
          </Link>
          <Link 
            href="/contact" 
            className={`hover:text-primary ${currentPage === "contact" ? "font-semibold" : ""}`}
          >
            Contact
          </Link>
          {showPortalButton && (
            <Link href="/login">
              <Button variant="outline">Klantenportaal</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

