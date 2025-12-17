"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', codeLabel: 'NL' },
  { code: 'en', label: 'English', flag: '🇬🇧', codeLabel: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', codeLabel: 'FR' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 font-sans text-sm hover:bg-primary/5"
        >
          <span className="font-semibold text-sm text-foreground">{currentLanguage.codeLabel}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 px-3 py-2 ${
              locale === language.code ? 'bg-primary/10 font-semibold' : ''
            }`}
          >
            <span className="font-semibold text-sm w-6">{language.codeLabel}</span>
            <span className="text-sm">{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

