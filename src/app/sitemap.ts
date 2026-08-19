import type { MetadataRoute } from "next";
import { getEvents, getReleases } from "@/lib/content/repository";
import { siteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [releases, events] = await Promise.all([getReleases(), getEvents()]);
  const staticPaths = [
    "", "/muziek", "/live", "/archief", "/media", "/de-kweker",
    "/booking", "/contact", "/privacy", "/voorwaarden"
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : 0.7
    })),
    ...releases.map((release) => ({
      url: `${siteUrl}/muziek/${release.slug}`,
      lastModified: release.updatedAt ? new Date(release.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.75
    })),
    ...events.map((event) => ({
      url: `${siteUrl}/live/${event.slug}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: event.status === "scheduled" ? 0.8 : 0.55
    }))
  ];
}
