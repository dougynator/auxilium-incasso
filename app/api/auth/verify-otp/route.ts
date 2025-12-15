import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Ongeldige OTP code" }, { status: 400 });
    }

    // Create response first so we can set cookies on it
    const jsonResponse = NextResponse.json({ success: false }); // Temporary, will be replaced
    
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
            jsonResponse.cookies.set({
              name,
              value,
              ...options,
              httpOnly: false, // Allow browser client to read auth cookies
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
            jsonResponse.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );
    
    // Try to get user from session
    let { data: { user }, error: userError } = await supabase.auth.getUser();

    // If no user but we have email, try to sign in again with email
    // This handles the case where cookies weren't set properly during login
    if (!user && email) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ No user found, but email provided. Checking if we can verify OTP by email...');
      }
      
      // We can't verify OTP without a user session, so we need to return an error
      // But first, let's check if there's a session we can refresh
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        return NextResponse.json({ 
          error: "Sessie verlopen. Log opnieuw in." 
        }, { status: 401 });
      }
      
      // If we have a session, get user from it
      user = sessionData.session.user;
    }

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No user found in session');
      }
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

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
    // This will update the cookies in the cookieStore
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Session after OTP:', sessionData?.session ? 'Valid' : 'Invalid');
      if (sessionError) {
        console.log('❌ Session error:', sessionError.message);
      }
    }

    // Update response with success
    const successResponse = NextResponse.json({ success: true });
    
    // Copy all cookies from jsonResponse (which were set during Supabase operations)
    jsonResponse.cookies.getAll().forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: false, // Allow browser client to read auth cookies
        secure: process.env.NODE_ENV === 'production' && !request.headers.get('host')?.includes('localhost'),
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 Cookies in success response:', successResponse.cookies.getAll().map(c => c.name));
      console.log('✅ Response cookies set, returning response');
    }

    return successResponse;
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
