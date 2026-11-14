import { NextRequest, NextResponse } from "next/server";
import { DEMO_PERSONAS } from "@/lib/auth/personas";
import { isConfigured } from "@/lib/env";
import { z } from "zod";

const personaSchema = z.object({
  personaKey: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Strict Environment Guard: Disallow demo persona login in production or when demo mode is not explicitly enabled
    if (process.env.NODE_ENV === "production" || !isConfigured.demoAuth) {
      return NextResponse.json(
        {
          success: false,
          message: "Demo persona authentication is strictly disabled in production.",
        },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { personaKey } = personaSchema.parse(json);

    const persona = DEMO_PERSONAS.find((p) => p.personaKey === personaKey);
    if (!persona) {
      return NextResponse.json(
        { success: false, message: "Invalid demo persona identifier" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        ...persona,
        isDemo: true,
      },
      isDemo: true,
      redirectUrl: persona.targetDashboard,
      message: `Signed in as simulated demo persona: ${persona.fullName} (${persona.badgeLabel})`,
    });

    // Set secure HttpOnly cookie with the verified persona key only
    response.cookies.set("kaamsetu_demo_persona", persona.personaKey, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error switching persona";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
