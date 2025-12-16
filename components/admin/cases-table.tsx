"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasesTableProps {
  cases: any[];
}

export default function CasesTable({ cases }: CasesTableProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [updatingCommission, setUpdatingCommission] = useState<string | null>(null);

  // Map status to display status
  const getDisplayStatus = (status: string) => {
    // Map existing statuses to new display statuses
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

  const handleCommissionToggle = async (caseId: string, currentValue: boolean) => {
    setUpdatingCommission(caseId);
    try {
      const { error } = await supabase
        .from("cases")
        .update({ commission_invoice_sent: !currentValue })
        .eq("id", caseId);

      if (error) throw error;

      toast({
        title: "Bijgewerkt",
        description: `Comissiefactuur status is ${!currentValue ? "aangevinkt" : "uitgevinkt"}`,
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating commission invoice:", error);
      toast({
        title: "Fout",
        description: error.message || "Kon comissiefactuur status niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setUpdatingCommission(null);
    }
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Geen dossiers gevonden
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-semibold">Klant / Debiteur</th>
            <th className="text-left p-4 font-semibold">Factuurnummer</th>
            <th className="text-left p-4 font-semibold">Bedrag</th>
            <th className="text-left p-4 font-semibold">Ingediend</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Comissiefactuur</th>
            <th className="text-right p-4 font-semibold">Acties</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem: any) => {
            const displayStatus = getDisplayStatus(caseItem.status);
            const canSetCommission = displayStatus.value === "ontvangen";
            const isUpdating = updatingCommission === caseItem.id;

            return (
              <tr key={caseItem.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <div className="font-medium">
                    {caseItem.organizations?.name || "Onbekende klant"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekende debiteur"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-mono">{caseItem.invoice_number || "-"}</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold">{formatCurrency(caseItem.total_amount)}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{formatDate(caseItem.created_at)}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${displayStatus.color}`}>
                    {displayStatus.label}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <Checkbox
                      checked={caseItem.commission_invoice_sent || false}
                      disabled={!canSetCommission || isUpdating}
                      onCheckedChange={() => handleCommissionToggle(caseItem.id, caseItem.commission_invoice_sent || false)}
                      className={!canSetCommission ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    {!canSetCommission && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Alleen bij "Ontvangen"
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/cases/${caseItem.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

