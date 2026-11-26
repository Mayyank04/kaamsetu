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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date("2026-11-25T00:00:00.000Z");

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/explore`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/translate`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/onboarding`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
