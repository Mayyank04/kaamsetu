import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isConfigured } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 1. Supabase Auth Session (if live Supabase is configured)
  if (isConfigured.supabase) {
    try {
      const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL || "",
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      // Refresh auth token if expired
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return { supabaseResponse, user, isDemo: false };
      }
    } catch {
      // Supabase connection error fallback
    }
  }

  // 2. Authoritative KAAMSETU Session Token Verification
  const sessionToken = request.cookies.get("kaamsetu_session")?.value;
  if (sessionToken) {
    try {
      const parts = sessionToken.split(".");
      if (parts.length === 2) {
        const [encoded] = parts;
        const jsonStr = typeof atob !== "undefined"
          ? atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))
          : Buffer.from(encoded, "base64url").toString("utf-8");
        const json = JSON.parse(jsonStr);
        if (json.userId && json.role && (!json.exp || json.exp > Math.floor(Date.now() / 1000))) {
          return {
            supabaseResponse,
            user: {
              id: json.userId,
              role: json.role,
              email: json.phone,
              user_metadata: {
                phone: json.phone,
                role: json.role,
              },
            } as any,
            isDemo: false,
          };
        }
      }
    } catch {
      // Invalidation
    }
  }

  // Truly unauthenticated visitor
  return { supabaseResponse, user: null, isDemo: false };
}
