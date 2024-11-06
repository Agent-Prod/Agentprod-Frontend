import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for Authorization cookie
  const authCookie = request.cookies.get('Authorization')?.value;
  
  // If accessing dashboard without auth cookie, redirect to signin
  if (request.nextUrl.pathname.startsWith('/dashboard') && !authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing auth pages with valid auth cookie, redirect to dashboard
  if ((request.nextUrl.pathname.startsWith('/signin') || 
       request.nextUrl.pathname.startsWith('/signup')) && 
       authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
