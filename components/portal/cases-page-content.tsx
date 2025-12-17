"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PortalCasesTable from "@/components/portal/cases-table";

interface CasesPageContentProps {
  cases: any[];
}

export default function CasesPageContent({ cases }: CasesPageContentProps) {
  const t = useTranslations('portal.cases');
  const tCommon = useTranslations('common');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h1>
          <p className="font-sans text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/portal/cases/new">
          <Button className="font-display bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            {t('newAssignment')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview')}</CardTitle>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <PortalCasesTable cases={cases} />
          ) : (
            <div className="text-center py-12">
              <p className="font-sans text-muted-foreground mb-4">
                {t('noAssignments')}
              </p>
              <Link href="/portal/cases/new">
                <Button className="font-display bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('submitFirstAssignment')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

