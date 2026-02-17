import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/onboarding', '/'];

export async function middleware(request: NextRequest) {
  // Local/demo mode: if Supabase env vars are missing, disable auth middleware entirely.
  // This corresponds to the "未認証でも動作" option.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const { pathname } = request.nextUrl;

  // Get current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Not logged in + private route → redirect to /login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in + public route (login/signup) → redirect to /select
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/select', request.url));
  }

  // Logged in → check if child record exists (skip for onboarding/consent)
  if (user && !isPublicRoute && pathname !== '/consent') {
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('parent_user_id', user.id)
      .limit(1);

    if (!children || children.length === 0) {
      // No child record → redirect to onboarding
      if (pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
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
