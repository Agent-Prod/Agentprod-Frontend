import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Check for auth cookie
  const authCookie = request.cookies.get('Authorization');

  // If on protected route and no auth cookie, redirect to login
  if (isProtectedRoute && !authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If on login page and auth cookie exists, redirect to dashboard
  if (request.nextUrl.pathname === '/' && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
