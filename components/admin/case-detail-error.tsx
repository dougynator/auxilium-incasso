"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CaseDetailError() {
  const t = useTranslations('admin.caseDetail');
  const tCommon = useTranslations('common');

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">{t('notFound')}</h2>
      <Link href="/admin/cases">
        <Button variant="outline">{t('backToCases')}</Button>
      </Link>
    </div>
  );
}

