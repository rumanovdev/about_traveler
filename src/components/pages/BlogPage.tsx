import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getPublishedBlogPosts } from "@/lib/blogApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const POSTS_PER_PAGE = 6;

const BlogPage = () => {
  const { lang } = useLanguage();
  const [page, setPage] = useState(1);
  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getPublishedBlogPosts,
  });

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const posts = allPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const getExcerpt = (post: typeof allPosts[0]) => {
    if (post.excerpt) return post.excerpt;
    // Strip HTML and take first ~200 chars
    const text = post.content.replace(/<[^>]*>/g, "");
    return text.length > 200 ? text.slice(0, 200) + "..." : text;
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <SEOHead
        title={lang === "el" ? "Blog - Ταξιδιωτικά Άρθρα" : "Blog - Travel Articles"}
        description={lang === "el" ? "Ταξιδιωτικά άρθρα, συμβουλές και οδηγοί για τις διακοπές σας στην Ελλάδα." : "Travel articles, tips and guides for your holidays in Greece."}
        path="/blog"
      />
      <Header />
      <main className="min-h-screen bg-white pt-36 pb-20">
        <div className="max-w-[860px] mx-auto px-5">
          {/* Header */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/8 px-3 py-1 rounded-full mb-4">
              Blog
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {lang === "el" ? "Ταξιδιωτικές Ιστορίες & Οδηγοί" : "Travel Stories & Guides"}
            </h1>
            <p className="text-lg text-gray-500">
              {lang === "el"
                ? "Συμβουλές, προορισμοί και εμπειρίες από όλη την Ελλάδα"
                : "Tips, destinations and experiences from across Greece"}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-64 h-44 bg-gray-200 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-400 text-center py-20">
              {lang === "el" ? "Δεν υπάρχουν άρθρα ακόμα." : "No posts yet."}
            </p>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <article key={post.id} className="group py-10 first:pt-0">
                    <a href={`/blog/${post.slug}`} className="flex flex-col sm:flex-row gap-7">
                      {post.featured_image && (
                        <div className="w-full sm:w-60 md:w-64 flex-shrink-0">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-44 object-cover rounded-2xl group-hover:opacity-90 transition-opacity"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-2 block">
                          {lang === "el" ? "Ταξιδιωτικά" : "Travel"}
                        </span>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 leading-snug tracking-tight">
                          {post.title}
                        </h2>
                        <p className="text-gray-500 text-[0.95rem] leading-relaxed line-clamp-2 mb-4">
                          {getExcerpt(post)}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {post.published_at && new Date(post.published_at).toLocaleDateString(
                            lang === "el" ? "el-GR" : "en-GB",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                    </a>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1 mt-12 pt-8 border-t border-gray-100">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                          page === p
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPage;
