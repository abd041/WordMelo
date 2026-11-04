import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getPublishedTools } from "@/lib/tools/registry";

/** Fixed content revision date — not regenerated as “today” on every request. */
const CONTENT_REVISED = new Date("2026-11-05");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      // Keep homepage URL identical to metadata canonical (no trailing slash).
      url: path === "" ? siteConfig.url : `${siteConfig.url}${path}`,
      lastModified: CONTENT_REVISED,
    }),
  );

  const toolRoutes = getPublishedTools().map((tool) => ({
    url: `${siteConfig.url}${tool.href}`,
    lastModified: CONTENT_REVISED,
  }));

  return [...staticRoutes, ...toolRoutes];
}
