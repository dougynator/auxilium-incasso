"use client";

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'nl', label: 'Nederlands', codeLabel: 'NL' },
  { code: 'en', label: 'English', codeLabel: 'EN' },
  { code: 'fr', label: 'Français', codeLabel: 'FR' },
];

const LOCALE_STORAGE_KEY = 'portal-locale';

export default function PortalLanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<string>('nl');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load locale from localStorage or default to 'nl'
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'nl';
    if (languages.some(lang => lang.code === savedLocale)) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // Reload the page to apply the new locale
    window.location.reload();
  };

  if (!isClient) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 font-sans text-sm hover:bg-primary/5"
        disabled
      >
        <span className="font-semibold text-sm text-foreground">NL</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </Button>
    );
  }

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
      <DropdownMenuContent align="end" className="min-w-[80px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center justify-center px-3 py-2 ${
              currentLocale === language.code ? 'bg-primary/10 font-semibold' : ''
            }`}
          >
            <span className="font-semibold text-sm">{language.codeLabel}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

