import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { pingIndexNow } from "@/lib/indexnow";

// Categorized Unsplash Greece photos — topic-matched, no API key needed
const PHOTO_CATEGORIES: Record<string, string[]> = {
  sea: [
    "photo-1504512485720-7d83a16ee930",
    "photo-1516483638261-f4dbaf036963",
    "photo-1467269204594-9661b134dd2b",
    "photo-1586861203927-800a5acdcc4d",
    "photo-1564760055775-d63b17a55c44",
    "photo-1491555103944-7c647fd857e6",
    "photo-1555881400-74d7acaacd8b",
    "photo-1530841377377-3ff06c0ca713",
    "photo-1558618666-fcd25c85cd64",
    "photo-1570077188670-e3a8d69ac5ff",
  ],
  village: [
    "photo-1533105079780-92b9be482077",
    "photo-1555993539-1732b0258235",
    "photo-1613395877344-13d4a8e0d49e",
    "photo-1606820854416-439b3305ff39",
    "photo-1571406761955-b89a7f9dee17",
    "photo-1519451241324-20b4ea2c4220",
    "photo-1575407816253-54a71cecc0e4",
    "photo-1474557157379-8aa74a6ef541",
    "photo-1596005554384-d293674c91d7",
    "photo-1548606169-1f75f4a34a5b",
  ],
  food: [
    "photo-1527786356703-4b100091cd2c",
    "photo-1542528180-1c2803fa048c",
    "photo-1555396273-367ea4eb4db5",
    "photo-1546069901-ba9599a7e63c",
    "photo-1504674900247-0877df9cc836",
    "photo-1565299585323-38d6b0865b47",
    "photo-1567620905732-2d1ec7ab7445",
    "photo-1551218808-94e220e084d2",
    "photo-1473093295043-cdd812d0e601",
    "photo-1464219551459-ac14ae01fbe0",
  ],
  history: [
    "photo-1601581975053-7c199baba43a",
    "photo-1602088113235-229c19758e9f",
    "photo-1569949381669-ecf31ae8e613",
    "photo-1555881400-74d7acaacd8b",
    "photo-1571406761955-b89a7f9dee17",
    "photo-1533105079780-92b9be482077",
    "photo-1555993539-1732b0258235",
    "photo-1580137189272-c9379f8864fd",
    "photo-1532274402911-5a369e4c4bb5",
    "photo-1593085260197-0d2b74bec39e",
  ],
  nature: [
    "photo-1530841377377-3ff06c0ca713",
    "photo-1504512485720-7d83a16ee930",
    "photo-1469474968028-56623f02e42e",
    "photo-1426604966848-d7adac402bff",
    "photo-1448375240586-882707db888b",
    "photo-1509316785289-025f5b846b35",
    "photo-1441974231531-c6227db76b6e",
    "photo-1472214103451-9374bd1c798e",
    "photo-1518173946687-a4c8892bbd9f",
    "photo-1506905925346-21bda4d32df4",
  ],
  car: [
    "photo-1469854523086-cc02fe5d8800",
    "photo-1502877338535-766e1452684a",
    "photo-1464219789935-c2d9d9aba644",
    "photo-1486262715619-67b85e0b08d3",
    "photo-1449965408869-eaa3f722e40d",
    "photo-1489824904134-891ab64532f1",
    "photo-1568605117036-5fe5e7bab0b7",
    "photo-1494976388531-d1058494cdd8",
    "photo-1503376780353-7e6692767b70",
    "photo-1541899481282-d53bffe3c35d",
  ],
  hotel: [
    "photo-1571406761955-b89a7f9dee17",
    "photo-1613395877344-13d4a8e0d49e",
    "photo-1533105079780-92b9be482077",
    "photo-1520250497591-112f2f40a3f4",
    "photo-1566073771259-6a8506099945",
    "photo-1582719508461-905c673771fd",
    "photo-1551882547-ff40c63fe5fa",
    "photo-1455587734955-081b22074882",
    "photo-1496417263034-38ec4f0b665a",
    "photo-1542314831-068cd1dbfeeb",
  ],
};

function pickPhotoForTopic(topic: string): string {
  const t = topic.toLowerCase();
  let category = "sea"; // default

  if (/φαγητ|εστιατ|κουζίν|γεύσ|ταβέρν|μεζέδ|food|restaurant|cuisine/i.test(t)) category = "food";
  else if (/αρχαι|ιστορ|μουσε|ruins|history|ancient|acropol/i.test(t)) category = "history";
  else if (/αυτοκίν|car|moto|rent|οδήγ|drive/i.test(t)) category = "car";
  else if (/ξενοδοχ|διαμον|hotel|villa|suite|accommodation/i.test(t)) category = "hotel";
  else if (/βουν|φύση|πεζοπ|nature|mountain|hike|forest/i.test(t)) category = "nature";
  else if (/χωριό|πόλ|αθήν|θεσσαλ|village|city|town/i.test(t)) category = "village";
  else if (/παραλί|νησ|θάλασσ|beach|island|sea|coast/i.test(t)) category = "sea";

  const photos = PHOTO_CATEGORIES[category];
  const id = photos[Math.floor(Math.random() * photos.length)];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
}

async function fetchPexelsPhoto(keywords: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords + " greece")}&per_page=5&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    const data = await res.json();
    if (data.photos?.length) {
      const random = data.photos[Math.floor(Math.random() * data.photos.length)];
      return random.src.large2x || random.src.large;
    }
  } catch { /* fallback */ }
  return "";
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

    // Use Pexels if key is available, otherwise use topic-matched curated photo
    const pexelsKey = import.meta.env.PEXELS_API_KEY;
    if (!post.featured_image && pexelsKey && post.image_keywords) {
      post.featured_image = await fetchPexelsPhoto(post.image_keywords, pexelsKey);
    }
    if (!post.featured_image) {
      post.featured_image = pickPhotoForTopic(topic);
    }

    // Replace any leftover IMAGE_PLACEHOLDER in content with topic-matched photos
    post.content = post.content.replace(/IMAGE_PLACEHOLDER/g, () => pickPhotoForTopic(topic));

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
