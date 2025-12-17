import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CaseTimeline from "@/components/cases/case-timeline";
import CaseActions from "@/components/cases/case-actions";
import CaseAttachments from "@/components/cases/case-attachments";
import { getTranslations } from 'next-intl/server';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('portal.caseDetail');
  const tStatus = await getTranslations('portal.cases.status');
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Get case with related data
  let caseQuery = supabase
    .from("cases")
    .select("*, debtors(*), organizations(*), case_events(*, profiles(full_name)), case_attachments(*)")
    .eq("id", id);

  if (profile.role === "client") {
    caseQuery = caseQuery.eq("organization_id", profile.organization_id);
  }

  const { data: caseItem, error } = await caseQuery.single();

  if (error || !caseItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('notFound')}</h2>
        <Link href="/portal">
          <Button>{t('backToDashboard')}</Button>
        </Link>
      </div>
    );
  }

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
    try {
      return tStatus(status);
    } catch {
      return status;
    }
  };

  const isStaffOrAdmin = profile.role === "admin" || profile.role === "staff";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/portal" className="text-muted-foreground hover:text-primary mb-2 inline-block">
            ← {t('backToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
        {isStaffOrAdmin && <CaseActions caseId={id} currentStatus={caseItem.status} />}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">{t('status')}</div>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-1 ${getStatusColor(
                  caseItem.status
                )}`}
              >
                {getStatusLabel(caseItem.status)}
              </span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('debtor')}</div>
              <div className="font-semibold mt-1">
                {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
              </div>
              <div className="text-sm text-muted-foreground">
                {caseItem.debtors?.email}
              </div>
            </div>
            {caseItem.invoice_number && (
              <div>
                <div className="text-sm text-muted-foreground">{t('invoiceNumber')}</div>
                <div className="font-semibold mt-1">{caseItem.invoice_number}</div>
              </div>
            )}
            {caseItem.structured_reference && (
              <div>
                <div className="text-sm text-muted-foreground">{t('structuredReference')}</div>
                <div className="font-mono mt-1">{caseItem.structured_reference}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('amount')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('principalAmount')}:</span>
              <span className="font-semibold">{formatCurrency(caseItem.principal_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('additionalCosts')}:</span>
              <span className="font-semibold">{formatCurrency(caseItem.additional_costs)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>{t('total')}:</span>
              <span>{formatCurrency(caseItem.total_amount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CaseAttachments caseId={id} attachments={caseItem.case_attachments || []} />

      <Card>
        <CardHeader>
          <CardTitle>{t('timeline')}</CardTitle>
          <CardDescription>{t('timelineDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CaseTimeline
            events={caseItem.case_events || []}
            isStaffOrAdmin={isStaffOrAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}

