import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isConfigured } from "@/lib/env";
import { DEMO_PERSONAS } from "@/lib/auth/personas";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (isConfigured.supabase) {
    try {
      const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

      return { supabaseResponse, user, isDemo: false };
    } catch {
      // Supabase connection error fallback
    }
  }

  // Demo Persona Session - only when explicit flag is active
  if (isConfigured.demoAuth) {
    const demoPersonaKey = request.cookies.get("kaamsetu_demo_persona")?.value;
    if (demoPersonaKey) {
      const matched = DEMO_PERSONAS.find((p) => p.personaKey === demoPersonaKey);
      if (matched) {
        return {
          supabaseResponse,
          user: {
            id: matched.id,
            role: matched.role,
            email: matched.phone || "demo@kaamsetu.dev",
            user_metadata: {
              full_name: matched.fullName,
              role: matched.role,
            },
          } as any,
          isDemo: true,
        };
      }
    }
  }

  // Truly unauthenticated visitor
  return { supabaseResponse, user: null, isDemo: false };
}
