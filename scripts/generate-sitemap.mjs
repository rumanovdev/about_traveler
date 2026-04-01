/**
 * Dynamic Sitemap Generator for About Traveller
 * Uses native fetch (Node 18+) to call Supabase REST API directly.
 * Fetches all published listings and blog posts and generates public/sitemap.xml.
 *
 * Run: node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE_URL = "https://aboutraveller.com";

const SUPABASE_URL =
  process.env.PUBLIC_SUPABASE_URL || "https://naauctowmzoltqtpwsqd.supabase.co";
const SUPABASE_KEY =
  process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hYXVjdG93bXpvbHRxdHB3c3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Njg4MjIsImV4cCI6MjA5MDU0NDgyMn0.heBlF4h0HKIlFFAJhJI4stIqLtQZCuwga92lyIDqvC4";

// Static public pages with priorities & change frequencies
const STATIC_PAGES = [
  { path: "/",               changefreq: "daily",   priority: "1.0" },
  { path: "/diamonh",        changefreq: "daily",   priority: "0.9" },
  { path: "/car-moto",       changefreq: "daily",   priority: "0.9" },
  { path: "/restaurants",    changefreq: "daily",   priority: "0.9" },
  { path: "/activities",     changefreq: "daily",   priority: "0.9" },
  { path: "/shop-more",      changefreq: "daily",   priority: "0.9" },
  { path: "/blog",           changefreq: "daily",    priority: "0.8" },
  { path: "/how-it-works",   changefreq: "monthly", priority: "0.7" },
  { path: "/business-model", changefreq: "monthly", priority: "0.6" },
  { path: "/partner-register", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "yearly",  priority: "0.4" },
  { path: "/cookie-policy",  changefreq: "yearly",  priority: "0.4" },
  { path: "/terms",          changefreq: "yearly",  priority: "0.4" },
];

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function supabaseQuery(table, select, filters = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filters}&order=updated_at.desc`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${table}): ${res.status} ${text}`);
  }
  return res.json();
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod    ? `    <lastmod>${lastmod}</lastmod>`         : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority   ? `    <priority>${priority}</priority>`       : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generate() {
  console.log("🗺️  Generating sitemap...");

  const today = new Date().toISOString().split("T")[0];

  let listings = [];
  let blogPosts = [];

  try {
    listings = await supabaseQuery("listings", "slug,updated_at", "&status=eq.active");
    console.log(`   ✓ ${listings.length} listings`);
  } catch (e) {
    console.warn("⚠️  Listings fetch failed:", e.message);
  }

  try {
    blogPosts = await supabaseQuery("blog_posts", "slug,updated_at", "&status=eq.published");
    console.log(`   ✓ ${blogPosts.length} blog posts`);
  } catch (e) {
    console.warn("⚠️  Blog posts fetch failed:", e.message);
  }

  console.log(`   ✓ ${STATIC_PAGES.length} static pages`);

  const entries = [
    // Static pages
    ...STATIC_PAGES.map((p) =>
      urlEntry({
        loc: `${SITE_URL}${p.path}`,
        lastmod: today,
        changefreq: p.changefreq,
        priority: p.priority,
      })
    ),

    // Dynamic listing pages
    ...listings.map((l) =>
      urlEntry({
        loc: `${SITE_URL}/listing/${l.slug}`,
        lastmod: l.updated_at ? l.updated_at.split("T")[0] : today,
        changefreq: "weekly",
        priority: "0.8",
      })
    ),

    // Dynamic blog post pages
    ...blogPosts.map((p) =>
      urlEntry({
        loc: `${SITE_URL}/blog/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.split("T")[0] : today,
        changefreq: "monthly",
        priority: "0.7",
      })
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");

  const outputPath = resolve(ROOT, "public", "sitemap.xml");
  writeFileSync(outputPath, xml, "utf-8");
  console.log(`✅  sitemap.xml written → ${outputPath}`);
  console.log(`   Total URLs: ${entries.length}`);
}

generate().catch((err) => {
  console.error("❌  Sitemap generation failed:", err);
  process.exit(1);
});
