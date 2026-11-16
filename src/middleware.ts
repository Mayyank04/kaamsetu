import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes requiring server authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/worker/dashboard",
  "/worker",
  "/admin/dashboard",
  "/admin",
  "/customer/bookings",
  "/bookings",
  "/contractor/dashboard",
  "/contractor",
  "/institution/dashboard",
  "/institution",
  "/identity/card",
  "/identity/edit",
  "/employer/manage",
];

// Routes reserved for guests
const AUTH_ROUTES = ["/login", "/auth/login", "/signup", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Update session cookies with Supabase SSR
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Check protected route access
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guest routes check (redirect to proper dashboard if already authenticated)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    const role = (user as any).role || (user as any).user_metadata?.role;
    let targetDashboard = "/dashboard";
    if (role === "contractor") {
      targetDashboard = "/contractor/dashboard";
    } else if (role === "institution") {
      targetDashboard = "/institution/dashboard";
    } else if (role === "customer") {
      targetDashboard = "/customer/bookings";
    }
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ or public assets with common extensions
     * - api routes (handled independently with fine-grained HTTP status codes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
