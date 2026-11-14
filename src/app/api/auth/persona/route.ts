import { NextRequest, NextResponse } from "next/server";
import { DEMO_PERSONAS } from "@/lib/auth/personas";
import { z } from "zod";

const personaSchema = z.object({
  personaKey: z.string(),
});

export async function POST(request: NextRequest) {
  try {
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
      user: persona,
      redirectUrl: persona.targetDashboard,
      message: `Signed in as ${persona.fullName} (${persona.badgeLabel})`,
    });

    // Set cookie
    response.cookies.set("kaamsetu_session", JSON.stringify(persona), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
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
