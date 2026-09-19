import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { BRANDS } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orveenbazar.com";
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/testimonials`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Brand routes
  const brandRoutes: MetadataRoute.Sitemap = BRANDS.map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Catalog item routes
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("catalog_items")
    .select("slug, updated_at, organization:organizations!inner(slug, is_active)")
    .eq("status", "published")
    .eq("organization.is_active", true);

  const itemRoutes: MetadataRoute.Sitemap = (items || []).map((item) => {
    const org = item.organization as unknown as { slug: string };
    return {
      url: `${siteUrl}/brands/${org.slug}/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...brandRoutes, ...itemRoutes];
}
