import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workerProfileId = (formData.get("workerProfileId") as string) || "w-pro-01";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No image file provided" } },
        { status: 400 }
      );
    }

    // Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Unsupported file format. Please upload JPG, PNG, or WEBP.",
          },
        },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "File exceeds 5MB limit." },
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Supabase Storage is configured, upload to 'portfolio-images' bucket
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${workerProfileId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Storage error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);

      return createSuccessResponse({
        publicUrl,
        fileName: file.name,
        fileSize: file.size,
        storageBucket: "portfolio-images",
      });
    }

    // In demo / offline mode, generate a Base64 Data URL so preview works 100% seamlessly
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return createSuccessResponse({
      publicUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      storageBucket: "local-demo-cache",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
