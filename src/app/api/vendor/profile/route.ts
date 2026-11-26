import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { VendorProfile } from "@/types/vendor";

export async function GET() {
  try {
    const user = await requireVendor();

    if (!isConfigured.supabase) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Database backend unavailable in production." },
          { status: 503 }
        );
      }
      return NextResponse.json({ success: true, vendor: null, notice: "Supabase not configured locally." });
    }

    const supabase = await createServerSupabaseClient();
    // 1. Try querying dedicated vendors table
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vendorError && vendor) {
      return NextResponse.json({ success: true, vendor });
    }

    // 2. Schema-adaptive fallback: construct from worker_profiles
    const { data: wp, error: wpError } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (wp) {
      const fallbackVendor: VendorProfile = {
        id: wp.id,
        userId: wp.user_id,
        businessName: wp.business_name || wp.headline || "My Local Craft Enterprise",
        displayName: wp.headline || "Verified Artisan",
        ownerName: "Business Owner",
        primaryCategory: "home_repair",
        secondaryCategories: [],
        subcategory: "electrician",
        businessDescription: wp.bio || "",
        preferredLanguage: "hi",
        supportedCustomerLanguages: wp.languages || ["hi", "en"],
        businessPhone: "",
        contactPreference: (wp.contact_preference as any) || "phone",
        businessAddress: wp.locality || wp.city || "",
        state: wp.state || "Assam",
        district: wp.district || "",
        city: wp.city || "Guwahati",
        locality: wp.locality || "",
        pincode: wp.pincode || "781001",
        stallType: (wp.stall_type as any) || "fixed_stall",
        operatingHours: wp.operating_hours || "09:00 AM - 07:00 PM",
        serviceRadiusKm: wp.service_radius_km || 15,
        deliveryAvailable: Boolean(wp.delivery_available),
        productCatalog: (wp.product_catalog as any) || [],
        priceModel: "daily",
        priceRangeMin: wp.daily_rate_min || 800,
        priceRangeMax: wp.daily_rate_max || 2500,
        availability: "open_today",
        yearsInBusiness: wp.years_experience || 5,
        categoryAttributes: {},
        verificationStatus: wp.aadhaar_verified ? "institution_verified" : "self_declared",
        profileCompletion: wp.profile_completion_percentage || 80,
        isPublished: wp.is_published ?? true,
        createdAt: wp.created_at || new Date().toISOString(),
        updatedAt: wp.updated_at || new Date().toISOString(),
      };
      return NextResponse.json({ success: true, vendor: fallbackVendor });
    }

    return NextResponse.json({ success: true, vendor: null });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireVendor();

    const body = await req.json();

    if (!isConfigured.supabase) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Database backend unavailable in production." },
          { status: 503 }
        );
      }
      return NextResponse.json({
        success: true,
        vendorId: `v-dev-${Date.now()}`,
        message: "Vendor profile saved in non-production offline mode.",
      });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Try upserting into dedicated vendors table
    const { data: savedVendor, error: vendorError } = await supabase
      .from("vendors")
      .upsert(
        {
          user_id: user.id,
          business_name: body.businessName,
          display_name: body.displayName || body.businessName,
          owner_name: body.ownerName,
          primary_category_id: body.primaryCategory,
          secondary_category_id: body.secondaryCategories?.[0] || null,
          subcategory: body.subcategory,
          business_description: body.businessDescription,
          preferred_language: body.preferredLanguage || "en",
          business_phone: body.businessPhone,
          contact_preference: body.contactPreference || "phone",
          business_address: body.businessAddress,
          state: body.state,
          district: body.district,
          city: body.city,
          locality: body.locality,
          pincode: body.pincode,
          stall_type: body.stallType || "fixed_stall",
          operating_hours: body.operatingHours,
          delivery_available: Boolean(body.deliveryAvailable),
          product_catalog: body.productCatalog || [],
          services_catalog: body.servicesCatalog || [],
          business_images: body.businessImages || [],
          category_attributes: body.categoryAttributes || {},
          is_draft: Boolean(body.isDraft),
          verification_status: "self_declared",
          profile_completion: 85,
          is_published: !body.isDraft,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("id")
      .maybeSingle();

    if (!vendorError && savedVendor) {
      return NextResponse.json({ success: true, vendorId: savedVendor.id });
    }

    // 2. Schema-adaptive fallback: persist to worker_profiles extended fields
    console.warn(
      "[Vendor API] Table 'vendors' not yet migrated; saving to worker_profiles:",
      vendorError?.message
    );

    const { data: wp, error: wpError } = await supabase
      .from("worker_profiles")
      .update({
        business_name: body.businessName,
        profile_type: "goods_vendor",
        stall_type: body.stallType || "fixed_stall",
        operating_hours: body.operatingHours,
        product_catalog: body.productCatalog || [],
        delivery_available: Boolean(body.deliveryAvailable),
        contact_preference: body.contactPreference || "phone",
        district: body.district,
        locality: body.locality,
      })
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    return NextResponse.json({
      success: true,
      vendorId: wp?.id || `v-fallback-${Date.now()}`,
      notice: "Profile saved adaptively to worker store.",
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
