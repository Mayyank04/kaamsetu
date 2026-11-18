import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isConfigured } from "@/lib/env";

/**
 * Validates HMAC-SHA256 signature for session token in Edge/Middleware using Web Crypto API.
 * Eliminates Node.js 'crypto' and 'Buffer' dependencies to ensure full Edge runtime compatibility.
 */
async function verifyHmacSha256(data: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert base64url to Uint8Array binary
    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const binary = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const dataBytes = encoder.encode(data);
    return await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
  } catch {
    return false;
  }
}

function decodeBase64UrlJson(str: string): any | null {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function verifyMiddlewareSessionToken(token: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;

    const secret = process.env.RATE_LIMIT_HMAC_SECRET || process.env.JWT_SECRET;
    if (!secret) return null;

    let verified = await verifyHmacSha256(encoded, signature, secret);

    if (!verified && process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
      verified = await verifyHmacSha256(
        encoded,
        signature,
        process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS
      );
    }

    if (!verified) return null;

    const json = decodeBase64UrlJson(encoded);
    if (!json) return null;

    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return json;
  } catch {
    return null;
  }
}

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

  // 2. Authoritative KAAMSETU Session Token Verification with Cryptographic Signature Check
  const sessionCookie = request.cookies.get("kaamsetu_session")?.value;
  if (sessionCookie) {
    const verifiedPayload = await verifyMiddlewareSessionToken(sessionCookie);
    if (verifiedPayload && verifiedPayload.userId && verifiedPayload.role) {
      return {
        supabaseResponse,
        user: {
          id: verifiedPayload.userId,
          role: verifiedPayload.role,
          email: verifiedPayload.email || verifiedPayload.phone || null,
          user_metadata: {
            phone: verifiedPayload.phone || null,
            email: verifiedPayload.email || null,
            role: verifiedPayload.role,
          },
        } as any,
        isDemo: false,
      };
    }
  }

  // Truly unauthenticated visitor
  return { supabaseResponse, user: null, isDemo: false };
}
