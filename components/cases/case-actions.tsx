"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CaseActionsProps {
  caseId: string;
  currentStatus: string;
}

export default function CaseActions({ caseId, currentStatus }: CaseActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Kon status niet wijzigen");
      }

      toast({
        title: "Status bijgewerkt",
        description: "De status is succesvol gewijzigd",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/mark-paid`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Kon betaling niet markeren");
      }

      toast({
        title: "Betaling gemarkeerd",
        description: "De betaling is succesvol gemarkeerd",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus !== "paid" && (
        <Button
          variant="outline"
          onClick={handleMarkPaid}
          disabled={loading}
        >
          Markeer als betaald
        </Button>
      )}
      {currentStatus === "draft" && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange("sent")}
          disabled={loading}
        >
          Verzenden
        </Button>
      )}
      {currentStatus === "sent" && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange("in_progress")}
          disabled={loading}
        >
          In behandeling
        </Button>
      )}
      {currentStatus === "paid" && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange("closed")}
          disabled={loading}
        >
          Afsluiten
        </Button>
      )}
    </div>
  );
}

