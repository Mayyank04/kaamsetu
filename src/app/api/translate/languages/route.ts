import { NextResponse } from "next/server";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";

export async function GET() {
  try {
    const languages = Object.values(ALL_TRANSLATION_CAPABILITIES);
    return NextResponse.json({
      success: true,
      data: {
        totalLanguages: languages.length,
        languages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve translation capabilities" },
      { status: 500 }
    );
  }
}
