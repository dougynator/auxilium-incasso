import { NextRequest, NextResponse } from "next/server";
import { sendCaseEmails } from "@/lib/email/send-case-emails";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = id;
    
    console.log('📧 [EMAIL API] Starting email send for case:', caseId);
    
    await sendCaseEmails(caseId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ [EMAIL API] Error sending emails:', error);
    return NextResponse.json(
      { error: error.message || "Failed to send emails" },
      { status: 500 }
    );
  }
}

