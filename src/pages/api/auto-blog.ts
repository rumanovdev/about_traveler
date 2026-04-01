import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { pingIndexNow } from "@/lib/indexnow";

// Rotating list of Greek travel topics — 1 per day automatically
const TOPICS = [
  "Τα 10 καλύτερα νησιά της Ελλάδας για ζευγάρια",
  "Κρητική κουζίνα: Τα πιάτα που πρέπει να δοκιμάσεις",
  "Πεζοπορία στα Μετέωρα: Πλήρης οδηγός",
  "Σαντορίνη vs Μύκονος: Ποιο νησί ταιριάζει σε σένα;",
  "Κρυμμένες παραλίες στην Πελοπόννησο",
  "Αθήνα σε 3 μέρες: Το τέλειο πρόγραμμα",
  "Χειμερινός τουρισμός στην Ελλάδα: Οι καλύτεροι προορισμοί",
  "Θεσσαλονίκη: Η γαστρονομική πρωτεύουσα της Ελλάδας",
  "Ρόδος: Ιστορία, παραλίες και γαστρονομία",
  "Ναύπλιο: Ο πιο ρομαντικός προορισμός της Ελλάδας",
  "Κέρκυρα: Βενετσιάνικη αρχιτεκτονική και γαλαζοπράσινα νερά",
  "Σκόπελος: Το νησί του Mamma Mia που θα σε εκπλήξει",
  "Λέσβος: Πολιτισμός, φύση και ουζάδικα",
  "Η Ζάκυνθος πέρα από το Ναυάγιο",
  "Ικαρία: Το μυστικό των εκατονταετηρίδων",
  "Χαλκιδική: Ο παράδεισος της Βόρειας Ελλάδας",
  "Αρχαιολογικοί χώροι που πρέπει να επισκεφτείς στην Ελλάδα",
  "Οδική εξερεύνηση στην Ήπειρο",
  "Παρόμοιο: Η ελληνική Βενετία",
  "Νάξος: Το νησί που έχει τα πάντα",
  "Μεσσηνία: Luxury ταξίδι στην Πελοπόννησο",
  "Καλαβρυτα και Φαράγγι Βουραϊκού: Μια διαφορετική εμπειρία",
  "Σύμη: Το χρωματιστό νησί των Δωδεκανήσων",
  "Κύθηρα: Το άγνωστο νησί της Αφροδίτης",
  "Τήνος: Πίστη, τέχνη και γαστρονομία",
  "Παξοί: Το μικρό διαμάντι του Ιονίου",
  "Σαμοθράκη: Ο τελευταίος άγριος παράδεισος",
  "Λήμνος: Ηφαιστειακή ομορφιά και απόλυτη ηρεμία",
  "Φολέγανδρος: Η αυθεντική Κυκλάδα",
  "Car rental στην Ελλάδα: Ό,τι πρέπει να ξέρεις",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const GET: APIRoute = async ({ request }) => {
  // Security: verify cron secret
  const secret = import.meta.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500 });
  }

  // Pick topic based on day of year so it's deterministic but rotates
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const topic = TOPICS[dayOfYear % TOPICS.length];

  try {
    // Generate blog post via Claude
    const promptBody = JSON.stringify({ topic, keywords: "", lang: "el" });
    const genRes = await fetch(`${new URL(request.url).origin}/api/generate-blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: promptBody,
    });

    if (!genRes.ok) {
      const err = await genRes.text();
      return new Response(JSON.stringify({ error: `Generation failed: ${err}` }), { status: 500 });
    }

    const post = await genRes.json();

    // Find a valid author (first admin user)
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminRole?.user_id) {
      return new Response(JSON.stringify({ error: "No admin user found" }), { status: 500 });
    }

    // Save to Supabase as published
    const now = new Date().toISOString();
    const { data: saved, error: saveError } = await supabase
      .from("blog_posts" as any)
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image || null,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        status: "published",
        author_id: adminRole.user_id,
        published_at: now,
      })
      .select()
      .single();

    if (saveError) {
      return new Response(JSON.stringify({ error: saveError.message }), { status: 500 });
    }

    // Ping IndexNow for instant indexing
    pingIndexNow([`/blog/${post.slug}`]);

    return new Response(
      JSON.stringify({ success: true, slug: post.slug, title: post.title }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
