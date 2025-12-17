"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import CaseFilters from "@/components/admin/case-filters";
import CasesTable from "@/components/admin/cases-table";

interface CasesPageContentProps {
  cases: any[];
}

export default function AdminCasesPageContent({ cases }: CasesPageContentProps) {
  const t = useTranslations('admin.cases');
  const tCommon = useTranslations('common');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Suspense fallback={<div>{t('loading')}</div>}>
        <CaseFilters />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>{t('loading')}</div>}>
            <CasesTable cases={cases || []} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

