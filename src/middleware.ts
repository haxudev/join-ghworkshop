import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow passcode verification endpoint and static assets
  if (
    pathname === '/api/verify-passcode' ||
    pathname === '/api/check-auth' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Protect all API routes
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // We can't use Node crypto in Edge middleware, so we do a simple check here.
    // The full HMAC verification happens in the API route handlers via the auth lib.
    // The middleware just checks for cookie presence; the real validation is that
    // the cookie is httpOnly and set only by our verify-passcode endpoint.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
