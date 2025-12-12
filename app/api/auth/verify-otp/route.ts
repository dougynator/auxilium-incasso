import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { verifyOTP } from "@/lib/auth/otp";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore errors in API routes
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore errors in API routes
            }
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Ongeldige OTP code" }, { status: 400 });
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Verifying OTP for user:', user.id);
      console.log('🔍 Code received:', code);
    }

    const isValid = await verifyOTP(user.id, code);

    if (!isValid) {
      // Additional debug info
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ OTP verification failed');
      }
      return NextResponse.json({ error: "OTP code ongeldig of verlopen" }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ OTP verification successful');
    }

    // Refresh the session to ensure cookies are properly set
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Session after OTP:', sessionData?.session ? 'Valid' : 'Invalid');
    }

    // Create response with success
    const response = NextResponse.json({ success: true });
    
    // Copy all Supabase auth cookies to the response
    // These cookies are set by the supabase client during getSession()
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      // Only copy auth-related cookies
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
    });

    return response;
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
