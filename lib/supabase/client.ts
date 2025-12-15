import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read all cookies from document.cookie
          const cookies: { name: string; value: string }[] = [];
          if (typeof document !== 'undefined') {
            document.cookie.split(';').forEach((cookie) => {
              const [name, ...rest] = cookie.trim().split('=');
              if (name) {
                cookies.push({ name, value: rest.join('=') });
              }
            });
          }
          return cookies;
        },
        set(name: string, value: string, options?: { path?: string; maxAge?: number; sameSite?: string; secure?: boolean }) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${value}`;
            if (options?.path) cookieString += `; path=${options.path}`;
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
            if (options?.secure) cookieString += `; secure`;
            document.cookie = cookieString;
          }
        },
      },
    }
  )
}

