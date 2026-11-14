import { UserProfile } from "@/types/auth";

export interface DemoPersona extends UserProfile {
  personaKey: string;
  badgeLabel: string;
  subtitle: string;
  targetDashboard: string;
  slug?: string;
  registryId?: string;
  trade?: string;
  city?: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    personaKey: "worker-electrician",
    id: "33333333-3333-3333-3333-333333330001",
    fullName: "Rameshwar Sharma",
    role: "worker",
    badgeLabel: "Master Electrician",
    subtitle: "Rooftop Solar & Industrial 3-Phase Specialist, Jaipur",
    phone: "+91 98290 14821",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbofQt3JNo-0nKP_7wT3yVLDSjnipeuwapv0I6oJbI0rtw7Ck45Xk3VFmhklL6b9FyeRMe2cBNy9RNV0O34xMjoCtlzLIFKAd-z3kAN4KupPq7ypm8miD2uz1hH_lWc6DgszG2L6Xt8CUljV9eTbpO3MmEotYLG5kUlGPcu1GVmNfL4TRODQKl6Yln99dznHtpaIxO9Zvg2NheIvm5U0EnQDTs4My6N9C0BFlXrA",
    isPhoneVerified: true,
    isDigiLockerVerified: true,
    city: "Jaipur",
    trade: "Industrial Electrician & Solar Installer",
    registryId: "IN-RJ-2026-4029-KS",
    slug: "rameshwar-sharma-jaipur",
    targetDashboard: "/dashboard",
    createdAt: "2025-03-12T00:00:00Z",
    updatedAt: "2026-11-14T10:00:00Z",
  },
  {
    personaKey: "worker-weaver",
    id: "33333333-3333-3333-3333-333333330002",
    fullName: "Sunita Devi",
    role: "worker",
    badgeLabel: "Heritage Artisan",
    subtitle: "Master Handloom Weaver & Zardozi Artisan, Varanasi",
    phone: "+91 94500 81290",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbDF3Yoh9HECZRHM4NE5wfIiiqKMusaNZDDz2HWiQUFBWDyNW4rp0I_FdOdotSC6Or6EmmFgGEevqLggwwjKd3tw6r8UZYyupM29X0ADHCm5mhYo22ek2LDD-CUDScEmG-l5tDQjI2bJrwj88DXospjzqluU_JRb6k9CPYuTvKv44zh5jyDH0KqBq0b3fZjbeNF-ZqWI0HLLY2siniTY62hjZqfzakwridcB-4-g",
    isPhoneVerified: true,
    isDigiLockerVerified: true,
    city: "Varanasi",
    trade: "Master Handloom Weaver & Zardozi Artisan",
    registryId: "IN-UP-2026-7819-KS",
    slug: "sunita-devi-varanasi",
    targetDashboard: "/dashboard",
    createdAt: "2025-06-15T00:00:00Z",
    updatedAt: "2026-11-14T10:00:00Z",
  },
  {
    personaKey: "customer-contractor",
    id: "22222222-2222-2222-2222-222222220001",
    fullName: "Aarav Mehta",
    role: "contractor",
    badgeLabel: "Facility Manager / Contractor",
    subtitle: "Commercial Infrastructure Contractor, Delhi NCR & Sitapura",
    phone: "+91 98110 54321",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    isPhoneVerified: true,
    isDigiLockerVerified: true,
    city: "New Delhi / NCR",
    targetDashboard: "/customer/bookings",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2026-11-14T10:00:00Z",
  },
];
