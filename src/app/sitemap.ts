import type { MetadataRoute } from "next";
import { getEntries } from "@/lib/content";
import { siteConfig } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getEntries();
  return entries.map((e) => ({
    url: `${siteConfig.domain}${e.route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: e.slug.length === 0 ? 1 : 0.7,
  }));
}
