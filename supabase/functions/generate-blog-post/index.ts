import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOPIC_POOLS = [
  "hidden beaches in the Greek islands",
  "best hiking trails in Greece",
  "traditional Greek cuisine by region",
  "romantic getaways in Greece",
  "family-friendly Greek destinations",
  "ancient ruins and archaeological sites worth visiting",
  "best sunset spots in Greece",
  "Greek island hopping itineraries",
  "winter destinations in Greece",
  "off-season travel tips for Greece",
  "Greek mountain villages to explore",
  "water sports and diving in Greece",
  "local festivals and traditions in Greece",
  "road trips through mainland Greece",
  "best Greek islands for solo travellers",
  "luxury travel experiences in Greece",
  "budget travel tips for Greece",
  "Greek wine regions and tasting tours",
  "eco-tourism and sustainable travel in Greece",
  "Greek monasteries and spiritual retreats",
  "photography spots in Greece",
  "Greek street food guide",
  "sailing routes around Greek islands",
  "thermal springs and wellness in Greece",
  "best markets and bazaars in Greece",
  "Greek nightlife and entertainment",
  "wildlife and nature reserves in Greece",
  "coastal villages of the Peloponnese",
  "art and culture scene in Athens",
  "adventure activities in Crete",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateAndUploadImage(
  prompt: string,
  apiKey: string,
  supabase: any,
  label: string
): Promise<string | null> {
  try {
    console.log(`🎨 Generating ${label}...`);
    const imgResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!imgResponse.ok) {
      console.error(`${label} generation failed: ${imgResponse.status}`);
      return null;
    }

    const imgData = await imgResponse.json();
    const imageUrl =
      imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error(`No image in ${label} response`);
      return null;
    }

    const base64Match = imageUrl.match(
      /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/
    );
    if (!base64Match) {
      console.error("Could not parse base64 image");
      return null;
    }

    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const imageBytes = decode(base64Match[2]);

    const fileName = `blog/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(fileName, imageBytes, {
        contentType: `image/${base64Match[1]}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName);

    console.log(`✅ ${label} uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`${label} error:`, err);
    return null;
  }
}

function insertImagesIntoContent(
  html: string,
  imageUrls: (string | null)[],
  imageAlts: string[]
): string {
  // Find all <h2> positions to insert images between sections
  const h2Regex = /<h2[^>]*>/gi;
  const h2Matches: number[] = [];
  let match;
  while ((match = h2Regex.exec(html)) !== null) {
    h2Matches.push(match.index);
  }

  if (h2Matches.length < 3) {
    // Not enough sections, just append images at intervals
    const validImages = imageUrls
      .map((url, i) => (url ? { url, alt: imageAlts[i] || "" } : null))
      .filter(Boolean);
    if (validImages.length === 0) return html;

    const mid = Math.floor(html.length / 2);
    const insertPoint = html.indexOf("</p>", mid);
    if (insertPoint > 0) {
      const imgTags = validImages
        .map(
          (img) =>
            `<img src="${img!.url}" alt="${img!.alt}" loading="lazy" />`
        )
        .join("\n");
      return (
        html.slice(0, insertPoint + 4) + "\n" + imgTags + "\n" + html.slice(insertPoint + 4)
      );
    }
    return html;
  }

  // Insert image 1 after the 2nd h2 section's first paragraph
  // Insert image 2 after the 4th h2 section's first paragraph (or 2nd-to-last)
  const insertionPoints = [
    h2Matches.length >= 3 ? h2Matches[2] : null, // before 3rd h2
    h2Matches.length >= 5 ? h2Matches[4] : h2Matches[h2Matches.length - 1], // before 5th or last h2
  ];

  let result = html;
  let offset = 0;

  for (let i = 0; i < 2; i++) {
    const url = imageUrls[i];
    const point = insertionPoints[i];
    if (!url || !point) continue;

    const imgTag = `\n<img src="${url}" alt="${imageAlts[i] || ""}" loading="lazy" />\n`;
    const insertAt = point + offset;
    result = result.slice(0, insertAt) + imgTag + result.slice(insertAt);
    offset += imgTag.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase config missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check existing topics
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("title, slug")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingTitles = (existingPosts || []).map((p: any) =>
      p.title.toLowerCase()
    );

    const availableTopics = TOPIC_POOLS.filter(
      (t) =>
        !existingTitles.some((et: string) =>
          et.includes(t.split(" ").slice(0, 3).join(" "))
        )
    );
    const topic =
      availableTopics.length > 0
        ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
        : TOPIC_POOLS[Math.floor(Math.random() * TOPIC_POOLS.length)];

    let customTopic = topic;
    try {
      const body = await req.json();
      if (body?.topic) customTopic = body.topic;
    } catch {
      /* no body */
    }

    // Step 1: Generate the blog post content
    console.log(`📝 Generating blog post about: "${customTopic}"`);
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a professional travel blogger and SEO expert for About Traveller (aboutraveller.com), a premium Greek travel platform.

Write blog posts in GREEK (Ελληνικά) language. Write naturally, engagingly, with genuine passion and deep insider knowledge of Greece.

CONTENT RULES:
- Write ONLY in Greek, fluent and natural
- 1500-2500 words of rich, engaging content
- Use HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>
- Do NOT include <h1> (title is separate) or <img> tags
- Include 4-6 <h2> sections with descriptive, keyword-rich headings
- Add practical tips: best time to visit, how to get there, costs, local secrets
- Include specific place names, local terminology, and authentic details
- End with a conclusion section summarizing key takeaways

SEO RULES:
- Title: catchy, keyword-rich, max 65 chars, in Greek
- Slug: greeklish (latin chars), descriptive, max 5-6 words with hyphens
- Meta title: max 60 chars, primary keyword first, include "| About Traveller"
- Meta description: max 155 chars, include call-to-action, compelling
- Excerpt: 150-200 chars, hook the reader
- Naturally weave in related keywords throughout content

TONE: Warm, knowledgeable, like a trusted friend sharing their favorite spots. Mix poetic descriptions with practical advice.`,
            },
            {
              role: "user",
              content: `Write a complete, publication-ready blog post about: "${customTopic}"`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_blog_post",
                description:
                  "Create a complete, SEO-optimized blog post with all metadata and image descriptions",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "Blog post title in Greek, max 65 chars, catchy and keyword-rich",
                    },
                    slug: {
                      type: "string",
                      description:
                        "URL slug in greeklish (latin), lowercase, hyphens, 5-6 words max",
                    },
                    excerpt: {
                      type: "string",
                      description:
                        "Compelling excerpt in Greek, 150-200 chars",
                    },
                    content: {
                      type: "string",
                      description:
                        "Full blog post in Greek, HTML formatted, 1500-2500 words, with h2/h3 sections. NO img tags.",
                    },
                    meta_title: {
                      type: "string",
                      description:
                        "SEO meta title in Greek, max 60 chars, keyword-first, ending with | About Traveller",
                    },
                    meta_description: {
                      type: "string",
                      description:
                        "SEO meta description in Greek, max 155 chars with CTA",
                    },
                    featured_image_prompt: {
                      type: "string",
                      description:
                        "English prompt for the hero/featured image. Describe a specific beautiful Greek scene relevant to the main topic. Be vivid and specific about location, lighting, colors.",
                    },
                    inline_image_1_prompt: {
                      type: "string",
                      description:
                        "English prompt for 1st in-article image. Should depict a specific scene mentioned in the first half of the article. Different from featured image.",
                    },
                    inline_image_1_alt: {
                      type: "string",
                      description:
                        "Alt text in Greek for the 1st in-article image, descriptive for SEO and accessibility.",
                    },
                    inline_image_2_prompt: {
                      type: "string",
                      description:
                        "English prompt for 2nd in-article image. Should depict a specific scene mentioned in the second half of the article. Different from other images.",
                    },
                    inline_image_2_alt: {
                      type: "string",
                      description:
                        "Alt text in Greek for the 2nd in-article image, descriptive for SEO and accessibility.",
                    },
                  },
                  required: [
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "meta_title",
                    "meta_description",
                    "featured_image_prompt",
                    "inline_image_1_prompt",
                    "inline_image_1_alt",
                    "inline_image_2_prompt",
                    "inline_image_2_alt",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_blog_post" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error ${aiResponse.status}: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let post: any;
    if (toolCall) {
      post = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI returned no content");
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        post = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    console.log(`📝 Post generated: "${post.title}"`);

    // Step 2: Generate all 3 images (featured + 2 inline) with delays to avoid rate limits
    const imagePromptBase = `Generate a beautiful, high-quality travel photograph. 
Style: Vibrant colors, professional editorial photography, realistic, NO text, NO watermarks, NO logos, NO people's faces visible.
Scene: `;

    const featuredImageUrl = await generateAndUploadImage(
      imagePromptBase + (post.featured_image_prompt || customTopic) + ". Wide landscape format, stunning and eye-catching.",
      LOVABLE_API_KEY,
      supabase,
      "featured image"
    );

    // Small delay between image generations to avoid rate limits
    await new Promise((r) => setTimeout(r, 3000));

    const inlineImage1Url = await generateAndUploadImage(
      imagePromptBase + (post.inline_image_1_prompt || `A scenic detail related to ${customTopic} in Greece`) + ". Medium shot, atmospheric.",
      LOVABLE_API_KEY,
      supabase,
      "inline image 1"
    );

    await new Promise((r) => setTimeout(r, 3000));

    const inlineImage2Url = await generateAndUploadImage(
      imagePromptBase + (post.inline_image_2_prompt || `Another beautiful scene related to ${customTopic} in Greece`) + ". Close-up or detail shot, warm tones.",
      LOVABLE_API_KEY,
      supabase,
      "inline image 2"
    );

    // Step 3: Insert inline images into content
    const finalContent = insertImagesIntoContent(
      post.content,
      [inlineImage1Url, inlineImage2Url],
      [post.inline_image_1_alt || "", post.inline_image_2_alt || ""]
    );

    // Step 4: Prepare slug
    const finalSlug = slugify(post.slug || post.title);

    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    const slug = existing
      ? `${finalSlug}-${new Date().toISOString().slice(0, 10)}`
      : finalSlug;

    // Step 5: Get admin and save
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminRole) throw new Error("No admin user found for author_id");

    const { data: newPost, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: finalContent,
        featured_image: featuredImageUrl,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        status: "published",
        author_id: adminRole.user_id,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const imgCount = [featuredImageUrl, inlineImage1Url, inlineImage2Url].filter(Boolean).length;
    console.log(`✅ Blog post published: "${post.title}" (${slug}) with ${imgCount}/3 images`);

    // Ping Google to crawl the new post and updated sitemap
    const postUrl = `https://aboutraveller.com/blog/${slug}`;
    try {
      await Promise.all([
        fetch(`https://www.google.com/ping?sitemap=https://aboutraveller.com/sitemap.xml`),
        fetch(`https://www.bing.com/ping?sitemap=https://aboutraveller.com/sitemap.xml`),
      ]);
      console.log(`🔔 Search engines pinged for: ${postUrl}`);
    } catch (pingErr) {
      console.warn("Ping failed (non-critical):", pingErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          id: newPost.id,
          title: newPost.title,
          slug: newPost.slug,
          featured_image: newPost.featured_image,
          images_generated: imgCount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("generate-blog-post error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
