import Link from "next/link";
import Logo from "@/components/logo";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-primary/95 via-primary to-primary/90 text-white rounded-t-3xl flex flex-col min-h-[200px]">
      <div className="container mx-auto px-4 py-12 md:py-16 flex-1">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo en contactgegevens */}
          <div className="md:col-span-1">
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-5 inline-block">
              <Logo showText={false} href={undefined} className="brightness-0 invert" height={60} />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/80" />
                <p className="text-white/90">
                  Kerkstraat 123<br />
                  1000 Brussel<br />
                  België
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-white/80" />
                <a href="tel:+32123456789" className="text-white/90 hover:text-white transition-colors">
                  +32 12 34 56 789
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-white/80" />
                <a href="mailto:info@auxiliumincasso.com" className="text-white/90 hover:text-white transition-colors">
                  info@auxiliumincasso.com
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-white">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-white/90 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/90 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/voorwaarden" className="text-white/90 hover:text-white transition-colors">
                  Voorwaarden
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-white/90 hover:text-white transition-colors">
                  Contact opnemen
                </Link>
              </li>
            </ul>
          </div>

          {/* Klantenportaal en Social Media */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-white">Klantenportaal</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link href="/login" className="text-white/90 hover:text-white transition-colors">
                  Inloggen
                </Link>
              </li>
            </ul>
            
            {/* Social Media */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-4 text-white">Volg ons</h3>
              <div className="flex gap-4">
                <a
                  href="https://linkedin.com/company/auxilium-incasso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/auxiliumincasso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/auxiliumincasso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/auxiliumincasso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-1 border-t border-white/20 pb-1 mt-auto">
        <div className="max-w-fit mx-auto text-center text-xs text-white/80 px-4">
          © {new Date().getFullYear()} Auxilium Incasso. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}

