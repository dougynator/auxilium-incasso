"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasesTableProps {
  cases: any[];
}

export default function PortalCasesTable({ cases }: CasesTableProps) {
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

  if (cases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Geen opdrachten gevonden
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-semibold">Debiteur</th>
            <th className="text-left p-4 font-semibold">Factuurnummer</th>
            <th className="text-left p-4 font-semibold">Bedrag</th>
            <th className="text-left p-4 font-semibold">Vervaldatum</th>
            <th className="text-left p-4 font-semibold">Ingediend</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-right p-4 font-semibold">Acties</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem: any) => {
            const displayStatus = getDisplayStatus(caseItem.status);

            return (
              <tr 
                key={caseItem.id} 
                className="border-b hover:bg-muted/50 cursor-pointer"
                onClick={() => window.location.href = `/portal/cases/${caseItem.id}`}
              >
                <td className="p-4">
                  <div className="font-medium">
                    {caseItem.debtors?.name || caseItem.debtors?.company_name || "Onbekend"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-mono">{caseItem.invoice_number || "-"}</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold">{formatCurrency(caseItem.total_amount)}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{caseItem.due_date ? formatDate(caseItem.due_date) : "-"}</div>
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
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/portal/cases/${caseItem.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Actieknop - later te implementeren
                      }}
                    >
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

