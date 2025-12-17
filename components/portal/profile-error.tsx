"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileError() {
  const t = useTranslations('portal.dashboard');
  const tCommon = useTranslations('common');

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">{t('profileNotFound')}</h2>
      <p className="text-muted-foreground mb-4">
        {t('profileNotFoundDesc')}
      </p>
      <Link href="/portal/settings">
        <Button>{t('goToSettings')}</Button>
      </Link>
    </div>
  );
}

