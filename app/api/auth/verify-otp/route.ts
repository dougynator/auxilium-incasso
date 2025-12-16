import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyOTP } from "@/lib/auth/otp";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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
    // This will update the cookies in the cookieStore
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Session after OTP:', sessionData?.session ? 'Valid' : 'Invalid');
      if (sessionError) {
        console.log('❌ Session error:', sessionError.message);
      }
    }

    // Create response with success
    const response = NextResponse.json({ success: true });
    
    // Get all cookies from cookieStore AFTER getSession() - Supabase should have set them
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 All cookies in cookieStore:', allCookies.map(c => c.name));
    }
    
    // Copy all Supabase auth cookies to the response
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    allCookies.forEach(cookie => {
      // Only copy auth-related cookies
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        // Build cookie string manually to ensure it's set correctly
        const cookieOptions = [
          `Path=/`,
          `SameSite=Lax`,
          // Removed HttpOnly so client-side Supabase can read cookies
          `Max-Age=${60 * 60 * 24 * 7}`, // 7 days
        ];
        
        if (process.env.NODE_ENV === 'production' && !isLocalhost) {
          cookieOptions.push(`Secure`);
        }
        
        const cookieString = `${cookie.name}=${cookie.value}; ${cookieOptions.join('; ')}`;
        
        // Set cookie using both methods to ensure it works
        // Auth cookies should NOT be httpOnly so client-side Supabase can read them
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: false, // Changed to false so client can read
          secure: process.env.NODE_ENV === 'production' && !isLocalhost,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        
        // Also set in response headers directly
        response.headers.append('Set-Cookie', cookieString);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🍪 Setting cookie in response:', cookie.name, 'for host:', host, 'isLocalhost:', isLocalhost);
          console.log('🍪 Cookie string:', cookieString.substring(0, 100) + '...');
        }
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 Cookies in response:', response.cookies.getAll().map(c => c.name));
      console.log('✅ Response cookies set, returning response');
    }

    return response;
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
