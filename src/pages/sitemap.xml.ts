import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://aboutraveller.com";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/diamonh", priority: "0.9", changefreq: "daily" },
  { path: "/car-moto", priority: "0.9", changefreq: "daily" },
  { path: "/restaurants", priority: "0.9", changefreq: "daily" },
  { path: "/activities", priority: "0.9", changefreq: "daily" },
  { path: "/shop-more", priority: "0.9", changefreq: "daily" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/how-it-works", priority: "0.7", changefreq: "monthly" },
  { path: "/business-model", priority: "0.6", changefreq: "monthly" },
  { path: "/partner-register", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.4", changefreq: "yearly" },
  { path: "/cookie-policy", priority: "0.4", changefreq: "yearly" },
  { path: "/terms", priority: "0.4", changefreq: "yearly" },
];

function toDate(iso: string | null) {
  if (!iso) return new Date().toISOString().split("T")[0];
  return new Date(iso).toISOString().split("T")[0];
}

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string
) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split("T")[0];

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const [listingsResult, postsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .range(0, 9999),
    supabase
      .from("blog_posts" as any)
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .range(0, 9999),
  ]);

  const staticEntries = STATIC_PAGES.map((p) =>
    urlEntry(`${SITE_URL}${p.path}`, today, p.changefreq, p.priority)
  );

  const listingEntries = (listingsResult.data || []).map((l: any) =>
    urlEntry(
      `${SITE_URL}/listing/${l.slug}`,
      toDate(l.updated_at),
      "weekly",
      "0.8"
    )
  );

  const postEntries = (postsResult.data || []).map((p: any) =>
    urlEntry(
      `${SITE_URL}/blog/${p.slug}`,
      toDate(p.updated_at),
      "monthly",
      "0.7"
    )
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...listingEntries, ...postEntries].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
