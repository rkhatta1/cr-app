import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('better-auth.session_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/upload') ||
    request.nextUrl.pathname.startsWith('/videos');

  // If trying to access protected page without session
  if (isProtectedPage && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page with session
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/videos/:path*', '/login'],
};
