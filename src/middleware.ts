import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require an authenticated session in strict production
const PROTECTED_PREFIXES = [
  "/identity/card",
  "/identity/edit",
  "/employer/post",
  "/employer/manage",
];

// Routes reserved for guests (redirect to dashboard if already authenticated)
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/verify"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Update session cookies with Supabase SSR
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Check protected route access
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guest routes check
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ or public assets with common extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
