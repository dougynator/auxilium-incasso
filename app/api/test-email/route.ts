import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not set",
        details: "Please set RESEND_API_KEY in Vercel environment variables",
      }, { status: 500 });
    }

    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({
        error: "Email address is required",
      }, { status: 400 });
    }

    console.log('🧪 Testing email to:', to);
    console.log('🧪 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('🧪 RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);

    const testEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Test Email - Auxilium Incasso
    </h1>
    
    <p>Dit is een test email om te controleren of email verzending werkt.</p>
    
    <p>Als je deze email ontvangt, werkt de email configuratie correct!</p>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      Auxilium Incasso
    </p>
  </div>
</body>
</html>`;

    await sendEmail({
      to,
      subject: "Test Email - Auxilium Incasso",
      html: testEmailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      to,
    });
  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return NextResponse.json({
      error: "Failed to send test email",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

