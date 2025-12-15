import { NextRequest, NextResponse } from "next/server";
import { createOTPChallenge, canResendOTP } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/service";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mailadres en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    // Create response first so we can set cookies on it
    const response = NextResponse.next();
    
    // Create Supabase client that sets cookies on the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            const host = request.headers.get('host') || '';
            const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
            
            request.cookies.set({
              name,
              value,
              ...options,
            });
            // Supabase SSR requires cookies to be readable by browser client
            // Don't set httpOnly for auth cookies so browser client can read them
            const isAuthCookie = name.includes('sb-') || name.includes('auth');
            response.cookies.set({
              name,
              value,
              ...options,
              httpOnly: isAuthCookie ? false : (options.httpOnly !== false), // Allow browser to read auth cookies
              secure: process.env.NODE_ENV === 'production' && !isLocalhost,
              sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
              path: options.path || '/',
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

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

    // Get session to ensure cookies are set (this will trigger cookie setting via the client)
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Login successful, session:', sessionData?.session ? 'Valid' : 'Invalid');
      console.log('🍪 Cookies set in response:', response.cookies.getAll().map(c => c.name));
    }
    
    // Create JSON response with the same cookies
    const jsonResponse = NextResponse.json({ success: true, userId: data.user.id });
    
    // Copy all cookies from the response to the JSON response
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    response.cookies.getAll().forEach(cookie => {
      const isAuthCookie = cookie.name.includes('sb-') || cookie.name.includes('auth');
      jsonResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: isAuthCookie ? false : true, // Allow browser to read auth cookies
        secure: process.env.NODE_ENV === 'production' && !isLocalhost,
        sameSite: 'lax',
        path: '/',
      });
    });

    return jsonResponse;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

