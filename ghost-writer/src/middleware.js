import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Run middleware on all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yhwhkwveupjzrwdljivn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI4NzgsImV4cCI6MjA4Nzc4ODg3OH0.A5Aj5pSiDEljN0iCve3UlHgXwxCGR_jCpC0lnkIvt3A';
const LOGIN_URL = 'https://rizikecosystem.com/login';

export async function middleware(request) {
  let response = NextResponse.next({ request });

  // ✅ Supabase SSR client — reads cookies from incoming request
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 🛡️ Check session — this is the definitive auth gate
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // User nai logged in — redirect to SaaS login with return URL
    const currentUrl = request.nextUrl.href;
    const redirectTo = new URL(LOGIN_URL);
    redirectTo.searchParams.set('next', currentUrl);
    return NextResponse.redirect(redirectTo);
  }

  // ✅ User authenticated — allow through
  return response;
}
