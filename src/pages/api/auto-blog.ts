import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { pingIndexNow } from "@/lib/indexnow";

// Curated Unsplash photo IDs for Greece — no API key needed
const GREECE_PHOTOS = [
  "photo-1533105079780-92b9be482077", // Santorini blue domes
  "photo-1516483638261-f4dbaf036963", // Greek island coast
  "photo-1555993539-1732b0258235", // Mykonos windmills
  "photo-1601581975053-7c199baba43a", // Acropolis Athens
  "photo-1527786356703-4b100091cd2c", // Greek food
  "photo-1613395877344-13d4a8e0d49e", // Santorini sunset
  "photo-1606820854416-439b3305ff39", // Greek village
  "photo-1467269204594-9661b134dd2b", // Corfu coast
  "photo-1504512485720-7d83a16ee930", // Greek sea
  "photo-1569949381669-ecf31ae8e613", // Meteora monasteries
  "photo-1586861203927-800a5acdcc4d", // Naxos beach
  "photo-1575407816253-54a71cecc0e4", // Greek harbor
  "photo-1571406761955-b89a7f9dee17", // Oia Santorini
  "photo-1530841377377-3ff06c0ca713", // Crete landscape
  "photo-1602088113235-229c19758e9f", // Greek ruins
  "photo-1555881400-74d7acaacd8b", // Blue sea Greece
  "photo-1519451241324-20b4ea2c4220", // Greek sunset
  "photo-1491555103944-7c647fd857e6", // Zakynthos
  "photo-1474557157379-8aa74a6ef541", // Rhodes medieval
  "photo-1564760055775-d63b17a55c44", // Greek islands
];

function randomGreekPhoto(): string {
  const id = GREECE_PHOTOS[Math.floor(Math.random() * GREECE_PHOTOS.length)];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
}

export const GET: APIRoute = async ({ request }) => {
  // Security: verify cron secret header (Vercel sends this automatically)
  const secret = import.meta.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500 });
  }

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  // Fetch existing post titles to avoid duplicates
  const { data: existingPosts } = await supabase
    .from("blog_posts" as any)
    .select("title")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  const existingTitles = (existingPosts as any[] || []).map((p: any) => p.title).join("\n");
  const month = new Date().toLocaleString("el-GR", { month: "long" });

  // Ask Claude to pick the best topic based on the site + season + existing posts
  const topicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: "Είσαι SEO expert για ταξιδιωτικό site για την Ελλάδα. Επιστρέφεις ΜΟΝΟ JSON.",
      messages: [{
        role: "user",
        content: `Είναι ${month}. Το site aboutraveller.com έχει κατηγορίες: Διαμονή, Car & Moto rental, Εστιατόρια, Δραστηριότητες στην Ελλάδα.

Άρθρα που υπάρχουν ήδη (ΜΗΝ επαναλάβεις):
${existingTitles || "κανένα ακόμα"}

Επίλεξε ΕΝΑ θέμα blog post που:
- Είναι σχετικό με την εποχή (${month})
- Έχει υψηλό SEO potential για Ελλάδα
- Σχετίζεται με τις κατηγορίες του site
- Δεν έχει γραφτεί ήδη

Επέστρεψε ΜΟΝΟ JSON: {"topic": "...", "keywords": "..."}`
      }],
    }),
  });

  let topic = "Τα καλύτερα ταξίδια στην Ελλάδα αυτή την εποχή";
  let keywords = "";

  if (topicRes.ok) {
    try {
      const topicData = await topicRes.json();
      const text: string = topicData.content?.[0]?.text || "";
      const clean = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      const parsed = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || clean);
      topic = parsed.topic || topic;
      keywords = parsed.keywords || "";
    } catch {
      // Use default topic
    }
  }

  try {
    // Generate full blog post
    const genRes = await fetch(`${new URL(request.url).origin}/api/generate-blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, keywords, lang: "el" }),
    });

    if (!genRes.ok) {
      const err = await genRes.text();
      return new Response(JSON.stringify({ error: `Generation failed: ${err}` }), { status: 500 });
    }

    const post = await genRes.json();

    // Use curated Greece photo if no image was fetched
    if (!post.featured_image) {
      post.featured_image = randomGreekPhoto();
    }

    // Replace any leftover IMAGE_PLACEHOLDER in content
    post.content = post.content.replace(/IMAGE_PLACEHOLDER/g, randomGreekPhoto());

    // Find admin user
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminRole?.user_id) {
      return new Response(JSON.stringify({ error: "No admin user found" }), { status: 500 });
    }

    const now = new Date().toISOString();
    const { error: saveError } = await supabase
      .from("blog_posts" as any)
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        status: "published",
        author_id: adminRole.user_id,
        published_at: now,
      });

    if (saveError) {
      return new Response(JSON.stringify({ error: saveError.message }), { status: 500 });
    }

    pingIndexNow([`/blog/${post.slug}`]);

    return new Response(
      JSON.stringify({ success: true, slug: post.slug, title: post.title, topic }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
