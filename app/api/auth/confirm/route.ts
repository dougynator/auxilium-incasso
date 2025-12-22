import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || !type) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_confirmation_link', request.url)
      );
    }

    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Verify the token and confirm the email
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      console.error('Email confirmation error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, appUrl)
      );
    }

    if (data.user) {
      // Email confirmed successfully
      // Redirect to login with success message
      return NextResponse.redirect(
        new URL('/login?confirmed=true', appUrl)
      );
    }

    // Fallback redirect
    return NextResponse.redirect(
      new URL('/login?confirmed=true', appUrl)
    );
  } catch (error: any) {
    console.error('Confirmation route error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Er is een fout opgetreden')}`, appUrl)
    );
  }
}

