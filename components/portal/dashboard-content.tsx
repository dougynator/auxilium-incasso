"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardContentProps {
  profile: any;
  user: any;
  cases: any[];
}

export default function DashboardContent({ 
  profile, 
  user, 
  cases
}: DashboardContentProps) {
  const t = useTranslations('portal.dashboard');
  const tCommon = useTranslations('common');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Concept",
      sent: "Verzonden",
      in_progress: "In behandeling",
      paid: "Betaald",
      closed: "Afgesloten",
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('welcomeBack')}, {profile.full_name || user.email}
          </p>
        </div>
        <Link href="/portal/cases/new">
          <Button>{t('newAssignment')}</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('totalAssignments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cases?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('outstanding')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {cases?.filter((c) => c.status !== "paid" && c.status !== "closed").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                cases?.reduce((sum, c) => sum + Number(c.total_amount || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('recentAssignments')}</CardTitle>
          <CardDescription>{t('recentAssignmentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <div className="space-y-4">
              {cases.map((caseItem: any) => (
                <Link
                  key={caseItem.id}
                  href={`/portal/cases/${caseItem.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseItem.invoice_number && `Factuur: ${caseItem.invoice_number} • `}
                        {formatDate(caseItem.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(caseItem.total_amount)}</div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {getStatusLabel(caseItem.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('noAssignments')}</p>
              <Link href="/portal/cases/new">
                <Button className="mt-4">{t('createFirstAssignment')}</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

