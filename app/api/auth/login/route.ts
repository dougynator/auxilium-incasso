import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOTPChallenge, canResendOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/service";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mailadres en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Inloggen mislukt" }, { status: 401 });
    }

    // Check if we can send OTP (rate limiting)
    const canResend = await canResendOTP(data.user.id);
    if (!canResend) {
      return NextResponse.json(
        { error: "Wacht even voordat u een nieuwe code aanvraagt" },
        { status: 429 }
      );
    }

    // Create and send OTP
    const code = await createOTPChallenge(data.user.id);

    // Log OTP code in development (REMOVE IN PRODUCTION!)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 OTP CODE FOR', data.user.email, ':', code, '\n');
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
      to: data.user.email!,
      subject: "OTP Code - Auxilium Incasso",
      html: emailHtml,
    });

    // Get session to ensure cookies are set
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Create response
    const response = NextResponse.json({ success: true, userId: data.user.id });
    
    // Copy all Supabase auth cookies to the response
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    allCookies.forEach(cookie => {
      // Only copy auth-related cookies
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        // Determine if we're on localhost or IP
        const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                           request.headers.get('host')?.includes('127.0.0.1');
        
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' && !isLocalhost,
          sameSite: 'lax',
          path: '/',
        });
      }
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

