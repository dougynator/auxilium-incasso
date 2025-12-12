import Link from "next/link";
import Logo from "@/components/logo";

export default function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo showText={false} href={null} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Professioneel incassobureau
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="/voorwaarden" className="hover:text-primary">Voorwaarden</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              <Link href="/contact" className="hover:text-primary">Contact opnemen</Link>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Klantenportaal</h3>
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary">Inloggen</Link>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Auxilium Incasso. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}

