"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CaseTimeline from "@/components/cases/case-timeline";
import CaseAttachments from "@/components/cases/case-attachments";
import CaseStatusUpdate from "@/components/admin/case-status-update";
import CommissionCheckbox from "@/components/admin/commission-checkbox";

interface CaseDetailContentProps {
  caseId: string;
  caseItem: any;
  displayStatus: { label: string; color: string; value: string };
}

export default function AdminCaseDetailContent({ caseId, caseItem, displayStatus }: CaseDetailContentProps) {
  const t = useTranslations('admin.caseDetail');
  const tCommon = useTranslations('common');

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/cases">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToCases')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <div className="grid gap-6">
        {/* Status and Commission */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statusAndCommission')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('status')}</label>
              <CaseStatusUpdate caseId={caseId} currentStatus={caseItem.status} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('commissionInvoiceSent')}</label>
              <CommissionCheckbox 
                caseId={caseId} 
                currentValue={caseItem.commission_invoice_sent || false}
                canEdit={displayStatus.value === "ontvangen"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Case Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('caseInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('caseId')}</label>
                <div className="font-mono text-sm">{caseItem.id}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('submittedOn')}</label>
                <div>{formatDate(caseItem.created_at)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('invoiceNumber')}</label>
                <div>{caseItem.invoice_number || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('invoiceDate')}</label>
                <div>{caseItem.invoice_date ? formatDate(caseItem.invoice_date) : "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('dueDate')}</label>
                <div>{caseItem.due_date ? formatDate(caseItem.due_date) : "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('structuredReference')}</label>
                <div className="font-mono text-sm">{caseItem.structured_reference || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('financial')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('principalAmount')}</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.principal_amount)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('additionalCosts')}</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.additional_costs)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('totalAmount')}</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.total_amount)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debtor Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('debtor')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
                <div>{caseItem.debtors?.name || caseItem.debtors?.company_name || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                <div>{caseItem.debtors?.email || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('address')}</label>
                <div>
                  {caseItem.debtors?.address_street || ""}
                  {caseItem.debtors?.address_postal_code && `, ${caseItem.debtors.address_postal_code}`}
                  {caseItem.debtors?.address_city && ` ${caseItem.debtors.address_city}`}
                  {!caseItem.debtors?.address_street && "-"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('vatNumber')}</label>
                <div>{caseItem.debtors?.vat_number || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('client')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('organization')}</label>
              <div>{caseItem.organizations?.name || "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>{t('timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseTimeline events={caseItem.case_events || []} isStaffOrAdmin={true} />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>{t('attachments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseAttachments caseId={caseId} attachments={caseItem.case_attachments || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

