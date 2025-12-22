import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Supabase sends token_hash in the URL, not token
    if (!token_hash && !token) {
      console.error('No token or token_hash provided');
      return NextResponse.redirect(
        new URL('/login?error=invalid_confirmation_link', appUrl)
      );
    }

    const supabase = await createClient();

    // Try to verify with token_hash first (Supabase format)
    if (token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token_hash,
        type: (type as any) || 'signup',
      });

      if (error) {
        console.error('Email confirmation error (token_hash):', error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, appUrl)
        );
      }

      if (data.user) {
        console.log('✅ Email confirmed successfully:', data.user.email);
        return NextResponse.redirect(
          new URL('/login?confirmed=true', appUrl)
        );
      }
    }

    // Fallback: try with token if token_hash didn't work
    if (token) {
      const { data, error } = await supabase.auth.verifyOtp({
        token: token,
        type: (type as any) || 'signup',
      });

      if (error) {
        console.error('Email confirmation error (token):', error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, appUrl)
        );
      }

      if (data.user) {
        console.log('✅ Email confirmed successfully:', data.user.email);
        return NextResponse.redirect(
          new URL('/login?confirmed=true', appUrl)
        );
      }
    }

    // If we get here, something went wrong
    return NextResponse.redirect(
      new URL('/login?error=confirmation_failed', appUrl)
    );
  } catch (error: any) {
    console.error('Confirmation route error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Er is een fout opgetreden')}`, appUrl)
    );
  }
}

