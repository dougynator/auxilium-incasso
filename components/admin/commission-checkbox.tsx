"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface CommissionCheckboxProps {
  caseId: string;
  currentValue: boolean;
  canEdit: boolean;
}

export default function CommissionCheckbox({ caseId, currentValue, canEdit }: CommissionCheckboxProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [checked, setChecked] = useState(currentValue);

  const handleToggle = async (newValue: boolean) => {
    if (!canEdit) {
      toast({
        title: "Niet mogelijk",
        description: "Status moet 'Ontvangen' zijn om comissiefactuur aan te kunnen vinken",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("cases")
        .update({ commission_invoice_sent: newValue })
        .eq("id", caseId);

      if (error) throw error;

      setChecked(newValue);
      toast({
        title: "Bijgewerkt",
        description: `Comissiefactuur status is ${newValue ? "aangevinkt" : "uitgevinkt"}`,
      });

      router.refresh();
    } catch (error: any) {
      console.error("Error updating commission invoice:", error);
      toast({
        title: "Fout",
        description: error.message || "Kon comissiefactuur status niet bijwerken",
        variant: "destructive",
      });
      // Revert checkbox state on error
      setChecked(currentValue);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        disabled={!canEdit || updating}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        className={!canEdit ? "opacity-50 cursor-not-allowed" : ""}
      />
      <span className="text-sm text-muted-foreground">
        {canEdit 
          ? "Kan alleen worden aangevinkt wanneer status 'Ontvangen' is"
          : "Status moet 'Ontvangen' zijn om comissiefactuur aan te kunnen vinken"}
      </span>
    </div>
  );
}

