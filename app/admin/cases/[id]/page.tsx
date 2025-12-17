import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CaseTimeline from "@/components/cases/case-timeline";
import CaseAttachments from "@/components/cases/case-attachments";
import CaseStatusUpdate from "@/components/admin/case-status-update";
import CommissionCheckbox from "@/components/admin/commission-checkbox";

export default async function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/portal");
  }

  // Get case with all related data
  const { data: caseItem, error } = await supabase
    .from("cases")
    .select("*, debtors(*), organizations(*), case_events(*, profiles(full_name)), case_attachments(*)")
    .eq("id", id)
    .single();

  if (error || !caseItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Dossier niet gevonden</h2>
        <Link href="/admin/cases">
          <Button variant="outline">Terug naar dossiers</Button>
        </Link>
      </div>
    );
  }

  // Map status to display status
  const getDisplayStatus = (status: string) => {
    if (status === "sent" || status === "in_progress" || status === "draft") {
      return { label: "Open", color: "bg-blue-100 text-blue-800", value: "open" };
    }
    if (status === "paid") {
      return { label: "Ontvangen", color: "bg-green-100 text-green-800", value: "ontvangen" };
    }
    if (status === "bailiff") {
      return { label: "Deurwaarder", color: "bg-red-100 text-red-800", value: "deurwaarder" };
    }
    return { label: status, color: "bg-gray-100 text-gray-800", value: status };
  };

  const displayStatus = getDisplayStatus(caseItem.status);

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/cases">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar dossiers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Dossier Details</h1>
      </div>

      <div className="grid gap-6">
        {/* Status and Commission */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Comissiefactuur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <CaseStatusUpdate caseId={id} currentStatus={caseItem.status} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comissiefactuur verzonden</label>
              <CommissionCheckbox 
                caseId={id} 
                currentValue={caseItem.commission_invoice_sent || false}
                canEdit={displayStatus.value === "ontvangen"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Case Information */}
        <Card>
          <CardHeader>
            <CardTitle>Dossier Informatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dossier ID</label>
                <div className="font-mono text-sm">{caseItem.id}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ingediend op</label>
                <div>{formatDate(caseItem.created_at)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Factuurnummer</label>
                <div>{caseItem.invoice_number || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Factuurdatum</label>
                <div>{caseItem.invoice_date ? formatDate(caseItem.invoice_date) : "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vervaldatum</label>
                <div>{caseItem.due_date ? formatDate(caseItem.due_date) : "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gestructureerde referentie</label>
                <div className="font-mono text-sm">{caseItem.structured_reference || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financiële Informatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hoofdsom</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.principal_amount)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bijkomende kosten</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.additional_costs)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Totaal bedrag</label>
                <div className="text-lg font-semibold">{formatCurrency(caseItem.total_amount)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debtor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debiteur Informatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Naam</label>
                <div>{caseItem.debtors?.name || caseItem.debtors?.company_name || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                <div>{caseItem.debtors?.email || "-"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Adres</label>
                <div>
                  {caseItem.debtors?.address_street || ""}
                  {caseItem.debtors?.address_postal_code && `, ${caseItem.debtors.address_postal_code}`}
                  {caseItem.debtors?.address_city && ` ${caseItem.debtors.address_city}`}
                  {!caseItem.debtors?.address_street && "-"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">BTW nummer</label>
                <div>{caseItem.debtors?.vat_number || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Klant Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Organisatie</label>
              <div>{caseItem.organizations?.name || "-"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseTimeline events={caseItem.case_events || []} isStaffOrAdmin={true} />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Bijlagen</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseAttachments caseId={id} attachments={caseItem.case_attachments || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

