import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCaseEvent } from "@/lib/cases/events";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    // Get current case
    const { data: currentCase } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentCase) {
      return NextResponse.json({ error: "Opdracht niet gevonden" }, { status: 404 });
    }

    // Update status to paid
    const { data: updatedCase, error } = await supabase
      .from("cases")
      .update({ status: "paid" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Kon betaling niet markeren" },
        { status: 500 }
      );
    }

    // Create event
    await createCaseEvent({
      caseId: id,
      actorProfileId: user.id,
      type: "payment_marked",
      message: "Betaling gemarkeerd door medewerker",
    });

    // Log audit
    await logAuditEvent({
      actorProfileId: user.id,
      action: "case_payment_marked",
      entityType: "cases",
      entityId: id,
      before: { status: currentCase.status },
      after: { status: "paid" },
    });

    return NextResponse.json({ success: true, case: updatedCase });
  } catch (error: any) {
    console.error("Mark paid error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

