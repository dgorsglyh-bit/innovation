import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'innovation-portal-super-secret-key-12345'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except the login page itself if it's the root of /admin)
  // Actually, the current structure seems to have /admin as the login page.
  // We want to protect everything UNDER /admin EXCEPT the root /admin if it's the login.
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const sessionCookie = request.cookies.get('innovation_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      await jwtVerify(sessionCookie, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
