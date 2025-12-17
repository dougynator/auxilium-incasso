"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslations } from 'next-intl';

interface PortalLogoutButtonProps {
  onSignOut: () => void;
}

export default function PortalLogoutButton({ onSignOut }: PortalLogoutButtonProps) {
  const t = useTranslations('nav');

  return (
    <form action={onSignOut}>
      <Button type="submit" variant="outline" size="sm" className="font-sans">
        <LogOut className="w-4 h-4 mr-2" />
        {t('logout')}
      </Button>
    </form>
  );
}

