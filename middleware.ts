import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Check for auth cookie
  const authCookie = request.cookies.get('Authorization');

  if (authCookie) {
    try {
      // Make a test API call to verify token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}v2/settings`, {
        headers: {
          Authorization: `Bearer ${authCookie.value}`
        }
      });

      // If API returns 403, token is expired
      if (response.status === 403) {
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        // Clear the expired auth cookie
        redirectResponse.cookies.delete('Authorization');
        return redirectResponse;
      }
    } catch (error) {
      // On API error, clear cookie and redirect to login
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      redirectResponse.cookies.delete('Authorization');
      return redirectResponse;
    }
  }

  // If on protected route and no auth cookie, redirect to login
  if (isProtectedRoute && !authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If on login page and valid auth cookie exists, redirect to dashboard
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