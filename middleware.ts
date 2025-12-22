import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware entirely for static files (videos, images, etc.)
  if (pathname.startsWith('/videos/') || 
      pathname.startsWith('/images/') ||
      pathname.match(/\.(mp4|webm|mov|avi|svg|png|jpg|jpeg|gif|webp|ico)$/i)) {
    return NextResponse.next();
  }
  
  // Skip i18n for portal/admin/api routes (they don't need locale)
  const skipI18n = pathname.startsWith('/portal') || 
                    pathname.startsWith('/admin') || 
                    pathname.startsWith('/api') ||
                    pathname.startsWith('/login') ||
                    pathname.startsWith('/otp') ||
                    pathname.startsWith('/pay');
  
  let intlResponse: NextResponse | null = null;
  
  if (!skipI18n) {
    // Handle internationalization for public routes
    intlResponse = intlMiddleware(request);
  }
  
  // Always handle Supabase session
  const supabaseResponse = await updateSession(request);
  
  // If we have an intl response, merge Supabase cookies into it
  if (intlResponse instanceof NextResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse!.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
      })
    })
    return intlResponse;
  }
  
  // For portal/admin routes, just return Supabase response
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - videos (video files)
     * - images (image files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|videos|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|avi)$).*)',
  ],
}

