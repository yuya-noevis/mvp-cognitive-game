import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/onboarding', '/debug-reset'];

/** Cookie name used to track demo-mode login */
const DEMO_SESSION_COOKIE = 'manas_demo_session';

function buildRedirectUrl(path: string, request: NextRequest): URL {
  const url = new URL(path, request.url);
  const debug = request.nextUrl.searchParams.get('debug');
  if (debug) url.searchParams.set('debug', debug);
  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // ------------------------------------------------------------------
  // Demo mode (no Supabase): use cookie to gate access
  // ------------------------------------------------------------------
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const hasDemoSession = request.cookies.has(DEMO_SESSION_COOKIE);

    // Not "logged in" + private route → redirect to /login
    if (!hasDemoSession && !isPublicRoute) {
      return NextResponse.redirect(buildRedirectUrl('/login', request));
    }

    // Already "logged in" + on login/signup → redirect to /
    if (hasDemoSession && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(buildRedirectUrl('/', request));
    }

    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // Supabase mode: full auth check
  // ------------------------------------------------------------------
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in + private route → redirect to /login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(buildRedirectUrl('/login', request));
  }

  // Logged in + public route (login/signup) → redirect to /
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(buildRedirectUrl('/', request));
  }

  // Logged in → check if child record exists (skip for onboarding/consent)
  if (user && !isPublicRoute && pathname !== '/consent') {
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('parent_user_id', user.id)
      .limit(1);

    if (!children || children.length === 0) {
      if (pathname !== '/onboarding') {
        return NextResponse.redirect(buildRedirectUrl('/onboarding', request));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
