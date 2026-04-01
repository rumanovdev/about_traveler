import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://aboutraveller.com";

/** Escape text for XML element bodies (e.g. <loc>). */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/diamonh", priority: "0.9", changefreq: "daily" },
  { loc: "/car-moto", priority: "0.9", changefreq: "daily" },
  { loc: "/restaurants", priority: "0.9", changefreq: "daily" },
  { loc: "/activities", priority: "0.9", changefreq: "daily" },
  
  { loc: "/blog", priority: "0.8", changefreq: "daily" },
  { loc: "/how-it-works", priority: "0.7", changefreq: "monthly" },
  { loc: "/business-model", priority: "0.6", changefreq: "monthly" },
  { loc: "/partner-register", priority: "0.6", changefreq: "monthly" },
  { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { loc: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active listings
    const { data: listings } = await supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages
    for (const page of staticPages) {
      const loc = escapeXml(`${SITE_URL}${page.loc}`);
      xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Listing pages
    if (listings) {
      for (const listing of listings) {
        const lastmod = listing.updated_at
          ? listing.updated_at.split("T")[0]
          : today;
        const loc = escapeXml(`${SITE_URL}/listing/${listing.slug}`);
        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    // Blog posts
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (blogPosts) {
      for (const post of blogPosts) {
        const lastmod = (post.updated_at || post.published_at || today).split("T")[0];
        const loc = escapeXml(`${SITE_URL}/blog/${post.slug}`);
        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
