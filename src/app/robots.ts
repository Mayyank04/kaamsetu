import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://kaamsetu-neon.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/translate", "/how-it-works", "/about", "/onboarding"],
        disallow: [
          "/api/",
          "/dashboard",
          "/vendor/",
          "/contractor/",
          "/institution/",
          "/customer/",
          "/bookings",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
