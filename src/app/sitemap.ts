import type { MetadataRoute } from "next";
import { fetchApprovedReports, fetchBrandNames } from "@/lib/convex/queries";
import { getSiteUrl } from "@/lib/seo";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/reports`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/map`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/report`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/media`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const [brands, reports] = await Promise.all([
    fetchBrandNames(),
    fetchApprovedReports(),
  ]);

  const brandPages: MetadataRoute.Sitemap = brands.map((name) => ({
    url: `${baseUrl}/brands/${slugify(name)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const dispensaryNames = [...new Set(reports.map((r) => r.dispensary_name))];
  const dispensaryPages: MetadataRoute.Sitemap = dispensaryNames.map((name) => ({
    url: `${baseUrl}/dispensaries/${slugify(name)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticPages, ...brandPages, ...dispensaryPages];
}
