import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth-token')?.value;

  // If accessing dashboard without auth cookie, redirect to signin
  if (request.nextUrl.pathname.startsWith('/dashboard') && !authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing root path (/) with valid auth cookie, redirect to dashboard
  if (request.nextUrl.pathname === '/' && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};