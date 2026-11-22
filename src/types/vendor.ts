/**
 * KAAMSETU — Dedicated Vendor & Local Small Business Types
 * Provides strongly-typed schemas for independent merchants, shopkeepers,
 * craft workshops, and service contractors throughout India.
 */

export interface VendorProductItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string; // e.g. "kg", "meter", "pair", "piece", "cup", "plate", "visit"
  inStock: boolean;
  category?: string;
  imageUrl?: string;
}

export interface VendorServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: "fixed" | "starting_from" | "per_hour" | "per_day" | "per_unit";
  durationEstimate?: string; // e.g. "2 hours", "1-2 days"
  category?: string;
}

export type VendorStallType =
  | "mobile_cart"
  | "fixed_stall"
  | "home_workshop"
  | "street_kiosk"
  | "retail_shop";

export type VendorVerificationStatus =
  | "self_declared"
  | "community_attested"
  | "physically_inspected"
  | "institution_verified";

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  displayName: string;
  ownerName: string;
  primaryCategory: string; // e.g. "home_repair", "clothing", "food_hospitality"
  secondaryCategories: string[];
  subcategory: string; // e.g. "tailor", "electrician", "street_food"
  businessDescription: string;
  preferredLanguage: string;
  supportedCustomerLanguages: string[];
  businessPhone: string;
  contactPreference: "phone" | "whatsapp" | "in_person";
  email?: string;
  businessAddress: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
  stallType: VendorStallType;
  operatingHours: string;
  serviceRadiusKm: number;
  deliveryAvailable: boolean;
  productCatalog: VendorProductItem[];
  servicesCatalog?: VendorServiceItem[];
  businessImages?: string[];
  isDraft?: boolean;
  draftStep?: number;
  priceModel: "fixed" | "hourly" | "daily" | "unit" | "custom";
  priceRangeMin?: number;
  priceRangeMax?: number;
  availability: "open_today" | "closed_today" | "by_appointment";
  yearsInBusiness: number;
  categoryAttributes: Record<string, any>; // Dynamic category-specific fields
  licenseNumber?: string;
  verificationStatus: VendorVerificationStatus;
  profileCompletion: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorDashboardData {
  vendor: VendorProfile;
  inquiriesCount: number;
  recentInquiries: any[];
  catalogCount: number;
  completionScore: number;
}
