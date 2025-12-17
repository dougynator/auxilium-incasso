"use client";

import { useState, useEffect, useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';

const LOCALE_STORAGE_KEY = 'portal-locale';

interface PortalLanguageProviderProps {
  nlMessages: any;
  enMessages: any;
  frMessages: any;
  children: React.ReactNode;
}

function getInitialLocale(): string {
  if (typeof window === 'undefined') {
    return 'nl';
  }
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale && ['nl', 'en', 'fr'].includes(savedLocale)) {
    return savedLocale;
  }
  return 'nl';
}

export default function PortalLanguageProvider({
  nlMessages,
  enMessages,
  frMessages,
  children,
}: PortalLanguageProviderProps) {
  const [locale, setLocale] = useState<string>(getInitialLocale);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load locale from localStorage or default to 'nl'
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'nl';
    if (['nl', 'en', 'fr'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Get the correct messages for the current locale
  const messages = useMemo(() => {
    switch (locale) {
      case 'en':
        return enMessages;
      case 'fr':
        return frMessages;
      default:
        return nlMessages;
    }
  }, [locale, nlMessages, enMessages, frMessages]);

  // Always render with the current locale (will be 'nl' on server, then update on client)
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

