"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CaseStatusUpdateProps {
  caseId: string;
  currentStatus: string;
}

export default function CaseStatusUpdate({ caseId, currentStatus }: CaseStatusUpdateProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  // Map display statuses to database statuses
  const statusOptions = [
    { label: "Open", value: "sent", color: "bg-blue-100 text-blue-800" },
    { label: "Ontvangen", value: "paid", color: "bg-green-100 text-green-800" },
    { label: "Deurwaarder", value: "bailiff", color: "bg-red-100 text-red-800" },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: newStatus })
        .eq("id", caseId);

      if (error) throw error;

      // Create case event
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("case_events").insert({
          case_id: caseId,
          actor_profile_id: user.id,
          type: "status_changed",
          message: `Status gewijzigd naar ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}`,
          metadata: { old_status: currentStatus, new_status: newStatus },
        });
      }

      toast({
        title: "Status bijgewerkt",
        description: `Status is gewijzigd naar ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}`,
      });

      router.refresh();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Fout",
        description: error.message || "Kon status niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Get current display status
  const getCurrentDisplayStatus = () => {
    if (currentStatus === "sent" || currentStatus === "in_progress" || currentStatus === "draft") {
      return "sent";
    }
    if (currentStatus === "paid") {
      return "paid";
    }
    if (currentStatus === "bailiff") {
      return "bailiff";
    }
    return currentStatus;
  };

  const currentDisplayStatus = getCurrentDisplayStatus();

  return (
    <div className="flex gap-2">
      {statusOptions.map((status) => {
        const isActive = status.value === currentDisplayStatus;
        return (
          <Button
            key={status.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(status.value)}
            disabled={updating || isActive}
            className={isActive ? status.color : ""}
          >
            {status.label}
          </Button>
        );
      })}
    </div>
  );
}

