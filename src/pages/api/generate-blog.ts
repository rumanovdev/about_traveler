import type { APIRoute } from "astro";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildPrompt(topic: string, keywords: string, isGreek: boolean): string {
  if (isGreek) {
    return `Γράψε ένα πλήρες blog post για ταξίδια στην Ελλάδα με θέμα: "${topic}"
${keywords ? `\nLέξεις-κλειδιά SEO: ${keywords}` : ""}

ΟΔΗΓΙΕΣ ΎΦΟΥΣ:
- Γράψε σαν έμπειρος ταξιδιώτης που μοιράζεται προσωπικές εμπειρίες, ΟΧΙ σαν AI
- Χρησιμοποίησε φράσεις όπως "Όταν επισκεφτήκαμε...", "Δεν θα ξεχάσουμε ποτέ...", "Μια συμβουλή που πήραμε από ντόπιους..."
- Φυσικές μεταβάσεις, συγκεκριμένες λεπτομέρειες, πρακτικά tips
- Γλώσσα: Ελληνικά, 900-1200 λέξεις

ΜΟΡΦΟΠΟΙΗΣΗ:
- HTML format: χρησιμοποίησε h2, h3, p, ul, li tags
- Κάθε 2-3 παραγράφους πρόσθεσε: <img src="IMAGE_PLACEHOLDER" alt="σύντομη περιγραφή" class="w-full rounded-xl my-6 object-cover" style="max-height:400px" />
- Το περιεχόμενο να ξεκινά με μια ελκυστική εισαγωγή (χωρίς h2)

Επέστρεψε ΜΟΝΟ valid JSON (χωρίς markdown, χωρίς \`\`\`):
{
  "title": "ελκυστικός τίτλος άρθρου",
  "excerpt": "σύντομη περιγραφή 130-155 χαρακτήρες",
  "content": "πλήρες HTML περιεχόμενο",
  "meta_title": "SEO τίτλος max 60 χαρακτήρες",
  "meta_description": "SEO περιγραφή 130-155 χαρακτήρες",
  "image_keywords": "2-3 αγγλικές λέξεις για αναζήτηση εικόνας (π.χ. greek island beach)"
}`;
  }

  return `Write a complete travel blog post about Greece with topic: "${topic}"
${keywords ? `\nSEO keywords: ${keywords}` : ""}

STYLE GUIDELINES:
- Write like an experienced traveler sharing personal experiences, NOT like an AI
- Use phrases like "When we visited...", "We'll never forget...", "A tip we got from locals..."
- Natural transitions, specific details, practical tips
- Language: English, 900-1200 words

FORMATTING:
- HTML format: use h2, h3, p, ul, li tags
- Every 2-3 paragraphs add: <img src="IMAGE_PLACEHOLDER" alt="brief description" class="w-full rounded-xl my-6 object-cover" style="max-height:400px" />
- Content should start with an engaging intro (no h2)

Return ONLY valid JSON (no markdown, no \`\`\`):
{
  "title": "engaging article title",
  "excerpt": "short description 130-155 chars",
  "content": "full HTML content",
  "meta_title": "SEO title max 60 chars",
  "meta_description": "SEO description 130-155 chars",
  "image_keywords": "2-3 English words for image search (e.g. greek island beach)"
}`;
}

async function fetchPexelsImage(keywords: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords + " greece")}&per_page=3&orientation=landscape`,
    { headers: { Authorization: apiKey } }
  );
  const data = await res.json();
  return data.photos?.[0]?.src?.large2x || "";
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), { status: 500 });
  }

  let body: { topic?: string; keywords?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { topic, keywords = "", lang = "el" } = body;
  if (!topic) {
    return new Response(JSON.stringify({ error: "topic is required" }), { status: 400 });
  }

  const isGreek = lang === "el";

  try {
    // Call Claude API
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        system: isGreek
          ? "Είσαι ένας έμπειρος συγγραφέας ταξιδιωτικού περιεχομένου. Γράφεις αποκλειστικά στα Ελληνικά, με φυσικό ανθρώπινο ύφος. Επιστρέφεις ΠΑΝΤΑ valid JSON."
          : "You are an experienced travel content writer. You write exclusively in English, with a natural human style. You ALWAYS return valid JSON.",
        messages: [{ role: "user", content: buildPrompt(topic, keywords, isGreek) }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return new Response(JSON.stringify({ error: `Claude error: ${err}` }), { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const rawText: string = claudeData.content?.[0]?.text || "";

    // Parse JSON — strip any markdown fences if Claude added them
    let parsed: any;
    try {
      const clean = rawText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse Claude response as JSON");
      parsed = JSON.parse(match[0]);
    }

    // Fetch featured image from Pexels (optional)
    let featuredImage = "";
    const pexelsKey = import.meta.env.PEXELS_API_KEY;
    if (pexelsKey && parsed.image_keywords) {
      try {
        featuredImage = await fetchPexelsImage(parsed.image_keywords, pexelsKey);
        // Replace IMAGE_PLACEHOLDER in content with real images
        if (featuredImage) {
          let count = 0;
          parsed.content = parsed.content.replace(/IMAGE_PLACEHOLDER/g, () => {
            count++;
            return featuredImage.replace(/\?auto.*$/, `?auto=compress&w=1200&fit=crop&h=500&crop=entropy&sig=${count}`);
          });
        }
      } catch {
        // Non-critical — proceed without image
      }
    }

    // Clean up leftover placeholders
    parsed.content = (parsed.content as string).replace(
      /src="IMAGE_PLACEHOLDER"/g,
      `src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"`
    );

    const slug = slugify(parsed.title) + "-" + Date.now().toString(36);

    return new Response(
      JSON.stringify({
        title: parsed.title || "",
        slug,
        excerpt: parsed.excerpt || "",
        content: parsed.content || "",
        meta_title: parsed.meta_title || "",
        meta_description: parsed.meta_description || "",
        featured_image: featuredImage,
        image_keywords: parsed.image_keywords || "",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
