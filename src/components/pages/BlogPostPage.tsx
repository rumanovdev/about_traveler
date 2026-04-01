
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blogApi";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

function calcReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const BlogPostPage = ({ slug }: { slug: string }) => {
  const { lang } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPostBySlug(slug!),
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getPublishedBlogPosts,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-white pt-28 pb-20">
          <div className="w-full max-w-2xl shrink-0 px-4 sm:px-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="h-5 bg-gray-200 rounded w-48 mb-8" />
            <div className="h-[420px] bg-gray-200 rounded-2xl mb-10" />
            <div className="space-y-4">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-28 pb-20 text-center">
          <div className="container">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === "el" ? "Το άρθρο δεν βρέθηκε" : "Post not found"}
            </h1>
            <a href="/blog" className="text-primary hover:underline">
              ← {lang === "el" ? "Πίσω στο Blog" : "Back to Blog"}
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || "",
    image: post.featured_image || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    publisher: {
      "@type": "Organization",
      name: "About Traveller",
      url: "https://aboutraveller.com",
      logo: "https://aboutraveller.com/white.png",
    },
  };

  const readingTime = calcReadingTime(post.content);
  const publishDate = (post.published_at || post.created_at)
    ? new Date(post.published_at || post.created_at).toLocaleDateString(
        lang === "el" ? "el-GR" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : "";

  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || post.title}
        path={`/blog/${post.slug}`}
        image={post.featured_image || undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-white pt-28 pb-24">
        {/* Centered column: flex items-center + explicit width beats odd margin combos from prose/CMS */}
        <div className="w-full max-w-2xl shrink-0 px-4 sm:px-6">
        {/* ── Article header ── */}
        <header className="mb-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-7">
            <a href="/" className="hover:text-primary transition-colors">
              {lang === "el" ? "Αρχική" : "Home"}
            </a>
            <span>/</span>
            <a href="/blog" className="hover:text-primary transition-colors">Blog</a>
            <span>/</span>
            <span className="text-gray-600 line-clamp-1">{post.title}</span>
          </nav>

          {/* Category tag */}
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/8 px-3 py-1 rounded-full mb-5">
            {lang === "el" ? "Ταξιδιωτικά" : "Travel"}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-gray-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt?.trim() && (
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
              {post.excerpt.trim()}
            </p>
          )}

          {/* Meta row: date + reading time + share */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {publishDate && <span>{publishDate}</span>}
              <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
              <span>
                {readingTime} {lang === "el" ? "λεπτά ανάγνωση" : "min read"}
              </span>
            </div>
            <ShareButtons url={`https://aboutraveller.com/blog/${post.slug}`} title={post.title} />
          </div>
        </header>

        {/* ── Featured image ── */}
        {post.featured_image && (
          <figure className="mb-14 w-full">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full max-h-[500px] object-cover rounded-2xl shadow-sm"
            />
          </figure>
        )}

        {/* ── Article body ── */}
        <article
          className="
            blog-rich-text
            prose prose-base lg:prose-lg w-full max-w-none !mx-0
            text-gray-700

            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-headings:leading-snug

            prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
            prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3

            prose-p:text-[1.0625rem] lg:prose-p:text-[1.125rem] prose-p:leading-[1.85] prose-p:text-gray-700 prose-p:mb-6

            prose-strong:text-gray-900 prose-strong:font-semibold

            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline

            prose-ul:my-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:space-y-2
            prose-li:text-[1.0625rem] lg:prose-li:text-[1.125rem] prose-li:leading-[1.8] prose-li:text-gray-700

            prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary
            prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg
            prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
            prose-blockquote:text-gray-700 [&_blockquote_p]:!mb-0

            prose-table:text-sm prose-table:w-full
            prose-thead:bg-gray-50 prose-thead:text-gray-900
            prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-left prose-th:border prose-th:border-gray-200
            prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-gray-200 prose-td:align-top prose-td:text-gray-700
            [&_tr:nth-child(even)_td]:bg-gray-50/60

            prose-img:rounded-xl prose-img:my-10 prose-img:shadow-sm

            prose-hr:border-gray-200 prose-hr:my-12

            prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Share & back ── */}
        <div className="mt-14 flex w-full flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-8">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            ← {lang === "el" ? "Πίσω στο Blog" : "Back to Blog"}
          </a>
          <ShareButtons url={`https://aboutraveller.com/blog/${post.slug}`} title={post.title} />
        </div>
        </div>

        {/* ── Related posts ── (slightly wider band, still centered) */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 w-full max-w-5xl shrink-0 px-4 sm:px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-8">
              {lang === "el" ? "Σχετικά Άρθρα" : "Related Articles"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <a
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col gap-3"
                >
                  {p.featured_image && (
                    <img
                      src={p.featured_image}
                      alt={p.title}
                      className="w-full h-44 object-cover rounded-xl group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    {p.published_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.published_at).toLocaleDateString(
                          lang === "el" ? "el-GR" : "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogPostPage;
