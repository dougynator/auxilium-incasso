import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCaseDetailContent from "@/components/admin/case-detail-content";
import CaseDetailError from "@/components/admin/case-detail-error";

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
    return <CaseDetailError />;
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
    <AdminCaseDetailContent 
      caseId={id}
      caseItem={caseItem}
      displayStatus={displayStatus}
    />
  );
}

