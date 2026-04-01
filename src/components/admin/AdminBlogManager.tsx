import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { getAllBlogPosts, deleteBlogPost, type BlogPost } from "@/lib/blogApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import BlogPostEditor from "./BlogPostEditor";

const AdminBlogManager = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">
          {lang === "el" ? "Άρθρα Blog" : "Blog Posts"}
        </h2>
        <Button onClick={() => { setEditPost(null); setShowEditor(true); }}>
          <Plus size={16} className="mr-2" />
          {lang === "el" ? "Νέο Άρθρο" : "New Post"}
        </Button>
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
