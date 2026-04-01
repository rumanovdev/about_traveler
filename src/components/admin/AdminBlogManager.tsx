import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { getAllBlogPosts, deleteBlogPost, type BlogPost } from "@/lib/blogApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, FileText, Sparkles, X, Loader2 } from "lucide-react";
import BlogPostEditor from "./BlogPostEditor";

const AdminBlogManager = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // AI generation state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiLang, setAiLang] = useState<"el" | "en">("el");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error(lang === "el" ? "Εισάγετε θέμα" : "Enter a topic");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, keywords: aiKeywords, lang: aiLang }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const generated = await res.json();
      // Open editor with pre-filled AI content
      setEditPost({
        id: "",
        title: generated.title,
        slug: generated.slug,
        excerpt: generated.excerpt,
        content: generated.content,
        featured_image: generated.featured_image || null,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        status: "draft",
        author_id: user?.id || "",
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setShowAiModal(false);
      setAiTopic("");
      setAiKeywords("");
      setShowEditor(true);
      toast.success(lang === "el" ? "Το άρθρο δημιουργήθηκε! Ελέγξτε και δημοσιεύστε." : "Post generated! Review and publish.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: getAllBlogPosts,
  });

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(lang === "el" ? `Διαγραφή "${post.title}";` : `Delete "${post.title}"?`)) return;
    try {
      await deleteBlogPost(post.id);
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success(lang === "el" ? "Το άρθρο διαγράφηκε" : "Post deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusLabels: Record<string, { label: string; className: string }> = {
    published: { label: lang === "el" ? "Δημοσιευμένο" : "Published", className: "bg-green-100 text-green-700" },
    draft: { label: lang === "el" ? "Πρόχειρο" : "Draft", className: "bg-yellow-100 text-yellow-700" },
  };

  // Show full-page editor
  if (showEditor) {
    return (
      <BlogPostEditor
        post={editPost}
        authorId={user?.id || ""}
        onBack={() => {
          setShowEditor(false);
          setEditPost(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-travel-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground">
                  {lang === "el" ? "AI Δημιουργία Άρθρου" : "AI Blog Generation"}
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">{lang === "el" ? "Θέμα άρθρου *" : "Article topic *"}</Label>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={lang === "el" ? "π.χ. Τα καλύτερα νησιά για οικογένειες" : "e.g. Best islands for families"}
                  className="mt-1"
                  disabled={aiLoading}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{lang === "el" ? "Keywords SEO (προαιρετικά)" : "SEO Keywords (optional)"}</Label>
                <Input
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  placeholder={lang === "el" ? "π.χ. ταξίδι, Ελλάδα, διακοπές" : "e.g. travel, Greece, vacation"}
                  className="mt-1"
                  disabled={aiLoading}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{lang === "el" ? "Γλώσσα" : "Language"}</Label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setAiLang("el")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${aiLang === "el" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}
                  >
                    🇬🇷 Ελληνικά
                  </button>
                  <button
                    onClick={() => setAiLang("en")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${aiLang === "en" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAiModal(false)} disabled={aiLoading}>
                {lang === "el" ? "Ακύρωση" : "Cancel"}
              </Button>
              <Button className="flex-1" onClick={handleAiGenerate} disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {lang === "el" ? "Δημιουργία..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    {lang === "el" ? "Δημιούργησε" : "Generate"}
                  </>
                )}
              </Button>
            </div>
            {aiLoading && (
              <p className="text-xs text-center text-muted-foreground">
                {lang === "el" ? "Η AI γράφει το άρθρο... ~15 δευτερόλεπτα" : "AI is writing the article... ~15 seconds"}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">
          {lang === "el" ? "Άρθρα Blog" : "Blog Posts"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAiModal(true)}>
            <Sparkles size={16} className="mr-2 text-primary" />
            {lang === "el" ? "AI Δημιουργία" : "AI Generate"}
          </Button>
          <Button onClick={() => { setEditPost(null); setShowEditor(true); }}>
            <Plus size={16} className="mr-2" />
            {lang === "el" ? "Νέο Άρθρο" : "New Post"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <FileText size={48} className="mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {lang === "el" ? "Δεν υπάρχουν άρθρα ακόμα." : "No posts yet."}
          </p>
          <Button onClick={() => { setEditPost(null); setShowEditor(true); }} variant="outline">
            <Plus size={16} className="mr-2" />
            {lang === "el" ? "Δημιουργήστε το πρώτο σας άρθρο" : "Create your first post"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const st = statusLabels[post.status] || { label: post.status, className: "bg-muted text-muted-foreground" };
            const wordCount = post.content.split(/\s+/).filter(Boolean).length;
            return (
              <div key={post.id} className="bg-card rounded-xl p-4 shadow-travel flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {post.featured_image && (
                  <img src={post.featured_image} alt={post.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wordCount} {lang === "el" ? "λέξεις" : "words"} · {post.published_at ? new Date(post.published_at).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB") : (lang === "el" ? "Μη δημοσιευμένο" : "Not published")}
                  </p>
                  <Badge className={`mt-1 ${st.className}`} variant="secondary">{st.label}</Badge>
                </div>
                <div className="flex gap-2">
                  {post.status === "published" && (
                    <Button size="sm" variant="outline" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                      <Eye size={14} className="mr-1" />
                      {lang === "el" ? "Προβολή" : "View"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setEditPost(post); setShowEditor(true); }}>
                    <Edit size={14} className="mr-1" />
                    {lang === "el" ? "Επεξεργασία" : "Edit"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post)}>
                    <Trash2 size={14} className="mr-1" />
                    {lang === "el" ? "Διαγραφή" : "Delete"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBlogManager;
