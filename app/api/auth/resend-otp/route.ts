import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOTPChallenge, canResendOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Check rate limit
    const canResend = await canResendOTP(user.id);
    if (!canResend) {
      return NextResponse.json(
        { error: "Wacht even voordat u een nieuwe code aanvraagt" },
        { status: 429 }
      );
    }

    // Create OTP challenge
    const code = await createOTPChallenge(user.id);

    // Log OTP code in development (REMOVE IN PRODUCTION!)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 OTP CODE FOR', user.email, ':', code, '\n');
    }

    // Generate OTP email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div>
    <h1 style="color: #2563eb; margin-bottom: 20px;">
      Auxilium Incasso
    </h1>
    
    <p>Beste gebruiker,</p>
    
    <p>
      U heeft ingelogd op het klantenportaal van Auxilium Incasso. 
      Gebruik de onderstaande code om uw aanmelding te voltooien:
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center">
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb">
        ${code}
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666">
      Deze code is 10 minuten geldig. Als u deze aanmelding niet heeft aangevraagd, 
      neem dan contact met ons op.
    </p>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666">
      Met vriendelijke groet,<br />
      Auxilium Incasso
    </p>
  </div>
</body>
</html>`;

    await sendEmail({
      to: user.email!,
      subject: "OTP Code - Auxilium Incasso",
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

