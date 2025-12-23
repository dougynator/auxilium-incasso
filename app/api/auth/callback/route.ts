import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * This route handles Supabase auth callbacks
 * Supabase redirects here after email confirmation
 * The token is in the URL hash (#access_token=...)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Supabase sends tokens in the hash fragment, not query params
    // We need to extract them from the referrer or handle them client-side
    // For now, we'll redirect to a client-side handler page
    
    // Check if we have type parameter (signup confirmation)
    const type = searchParams.get('type');
    
    if (type === 'signup') {
      // Redirect to a client-side page that will handle the hash
      return NextResponse.redirect(
        new URL('/auth/confirm-email', appUrl)
      );
    }

    // Default redirect to login
    return NextResponse.redirect(
      new URL('/login', appUrl)
    );
  } catch (error: any) {
    console.error('Auth callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL('/login?error=callback_error', appUrl)
    );
  }
}

