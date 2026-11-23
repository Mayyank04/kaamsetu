import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireWorker, AuthError } from "@/lib/auth/server";

// Magic numbers validation for content verification
function isValidImageContent(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 8) return false;

  // JPEG magic number: FF D8 FF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WEBP magic number: RIFF .... WEBP
  if (mimeType === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireWorker();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedProfileId = formData.get("workerProfileId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided for portfolio upload." },
        { status: 400 }
      );
    }

    // 1. Strict MIME type check
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file format. Please upload JPG, PNG, or WEBP images.",
        },
        { status: 400 }
      );
    }

    // 2. Maximum file size check (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "File exceeds 5MB size limit.",
        },
        { status: 400 }
      );
    }

    // 3. Inspect raw buffer & magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageContent(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "File header does not match declared image type. Upload rejected.",
        },
        { status: 400 }
      );
    }

    // 4. Derive worker profile ID and verify ownership
    const targetProfileId = requestedProfileId || user.workerProfileId || "w-pro-01";

    if (!user.isDemo && isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data: profileCheck } = await supabase
        .from("worker_profiles")
        .select("id, user_id")
        .eq("id", targetProfileId)
        .single();

      if (!profileCheck || profileCheck.user_id !== user.id) {
        throw new AuthError("Forbidden: Cannot upload portfolio assets to another worker's identity.", 403);
      }
    }

    // 5. Sanitize filename and prevent path traversal
    const safeExt = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const cleanBasename = file.name
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 32);
    const uniqueFileName = `${Date.now()}-${cleanBasename}.${safeExt}`;
    // Ownership-aware predictable storage path: user_id/worker_profile_id/filename
    const storagePath = `${user.id}/${targetProfileId}/${uniqueFileName}`;

    // 6. Production Mode: Upload to Supabase Storage
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase Storage error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Storage upload failed: " + uploadError.message },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);

      return createSuccessResponse({
        publicUrl,
        storagePath,
        fileName: file.name,
        fileSize: file.size,
        storageBucket: "portfolio-images",
        isDemo: false,
      });
    }

    // 7. Demo Mode: Local preview fallback strictly for non-production environments
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Storage backend unavailable in production mode." },
        { status: 503 }
      );
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return createSuccessResponse({
      publicUrl: dataUrl,
      storagePath,
      fileName: file.name,
      fileSize: file.size,
      storageBucket: "local-demo-cache",
      isDemo: true,
      demoNotice: "Simulated demonstration storage: Images are retained in temporary session cache.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
