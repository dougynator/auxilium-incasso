import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Determine if we're on localhost or IP
          const host = request.headers.get('host') || '';
          const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
          
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production' && !isLocalhost, // Don't require secure on localhost
            sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
            path: options.path || '/',
            httpOnly: options.httpOnly !== false, // Default to httpOnly unless explicitly false
          };
          
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
          
          if (process.env.NODE_ENV === 'development' && (name.includes('sb-') || name.includes('auth'))) {
            console.log('🍪 Middleware setting cookie:', name, 'for host:', host, 'isLocalhost:', isLocalhost);
          }
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (process.env.NODE_ENV === 'development') {
    // Only log for portal/admin routes to avoid spam
    if (request.nextUrl.pathname.startsWith('/portal') || request.nextUrl.pathname.startsWith('/admin')) {
      console.log('🔍 Middleware - Path:', request.nextUrl.pathname, 'User:', user ? user.email : 'No user');
    }
  }

  return response
}

