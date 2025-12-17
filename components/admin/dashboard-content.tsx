"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardContentProps {
  profile: any;
  totalCases: number;
  openCases: number;
  totalAmount: number;
  cases: any[];
}

export default function AdminDashboardContent({ 
  profile, 
  totalCases, 
  openCases, 
  totalAmount, 
  cases 
}: DashboardContentProps) {
  const t = useTranslations('admin.dashboard');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('welcomeBack')}, {profile?.full_name || "Admin Gebruiker"}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('totalAssignments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('outstanding')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t('recentAssignments')}</h2>
        <p className="text-muted-foreground mb-4">
          {t('recentAssignmentsDesc')}
        </p>
      </div>

      {cases && cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((caseItem: any) => (
            <Link
              key={caseItem.id}
              href={`/admin/cases/${caseItem.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {caseItem.organizations?.name || "Onbekende klant"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekende debiteur"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseItem.invoice_number && `Factuur: ${caseItem.invoice_number} • `}
                        {formatDate(caseItem.created_at)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-lg mb-2">
                        {formatCurrency(caseItem.total_amount)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        caseItem.status === "paid" 
                          ? "bg-green-100 text-green-800" 
                          : caseItem.status === "bailiff" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {caseItem.status === "paid" ? t('status.paid') : caseItem.status === "bailiff" ? t('status.bailiff') : t('status.open')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t('noAssignments')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

