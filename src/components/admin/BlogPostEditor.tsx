import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { createBlogPost, updateBlogPost, uploadBlogImage, type BlogPost } from "@/lib/blogApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Upload, ArrowLeft, Eye, Save, Image as ImageIcon } from "lucide-react";

interface Props {
  post: BlogPost | null;
  authorId: string;
  onBack: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BlogPostEditor = ({ post, authorId, onBack }: Props) => {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const isEdit = !!post;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setContent(post.content);
      setFeaturedImage(post.featured_image || "");
      setMetaTitle(post.meta_title || "");
      setMetaDescription(post.meta_description || "");
      setStatus(post.status);
    }
  }, [post]);

  useEffect(() => {
    if (!isEdit && title) setSlug(slugify(title));
  }, [title, isEdit]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const metaTitleLen = metaTitle.length;
  const metaDescLen = metaDescription.length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      setFeaturedImage(url);
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      const imgTag = `\n<img src="${url}" alt="" class="rounded-2xl shadow-md" />\n`;
      setContent((prev) => prev + imgTag);
      toast.success(lang === "el" ? "Η εικόνα προστέθηκε στο περιεχόμενο" : "Image added to content");
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !slug.trim()) {
      toast.error(lang === "el" ? "Συμπληρώστε τίτλο, slug και περιεχόμενο" : "Fill title, slug and content");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featured_image: featuredImage || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        status,
        published_at: status === "published" ? (post?.published_at || new Date().toISOString()) : null,
      };
      if (isEdit) {
        await updateBlogPost(post.id, payload);
        toast.success(lang === "el" ? "Το άρθρο ενημερώθηκε" : "Post updated");
      } else {
        await createBlogPost({ ...payload, author_id: authorId });
        toast.success(lang === "el" ? "Το άρθρο δημιουργήθηκε" : "Post created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      onBack();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const LenIndicator = ({ current, min, max, label }: { current: number; min: number; max: number; label: string }) => {
    const isGood = current >= min && current <= max;
    return (
      <span className={`flex items-center gap-1 text-xs ${isGood ? "text-green-600" : current === 0 ? "text-muted-foreground" : "text-orange-500"}`}>
        {isGood ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
        {current}/{max} {label}
      </span>
    );
  };

  const WordIndicator = () => {
    const color = wordCount >= 300 ? "text-green-600" : wordCount > 0 ? "text-orange-500" : "text-muted-foreground";
    const label = wordCount >= 1500
      ? (lang === "el" ? "εξαιρετικό!" : "excellent!")
      : wordCount >= 800
      ? (lang === "el" ? "πολύ καλό!" : "great!")
      : wordCount >= 300
      ? "✓"
      : wordCount > 0
      ? (lang === "el" ? "προτείνεται 300+" : "300+ recommended")
      : "";
    return (
      <span className={`text-xs ${color}`}>
        {wordCount} {lang === "el" ? "λέξεις" : "words"} {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} />
          {lang === "el" ? "Πίσω" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={14} className="mr-1.5" />
            {showPreview ? (lang === "el" ? "Επεξεργασία" : "Editor") : (lang === "el" ? "Προεπισκόπηση" : "Preview")}
          </Button>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{lang === "el" ? "Πρόχειρο" : "Draft"}</SelectItem>
              <SelectItem value="published">{lang === "el" ? "Δημοσιευμένο" : "Published"}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={14} />
            {saving ? "..." : isEdit ? (lang === "el" ? "Ενημέρωση" : "Update") : (lang === "el" ? "Δημοσίευση" : "Publish")}
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* ── Preview Mode ── */
        <div className="bg-card rounded-2xl border p-8 sm:p-12 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4 leading-tight tracking-tight">
            {title || (lang === "el" ? "Χωρίς τίτλο" : "Untitled")}
          </h1>
          {featuredImage && (
            <figure className="mb-10">
              <img src={featuredImage} alt={title} className="w-full max-h-[520px] object-cover rounded-2xl shadow-lg" />
            </figure>
          )}
          <article
            className="prose prose-lg max-w-none text-foreground
              prose-headings:font-display prose-headings:text-foreground prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl prose-img:mx-auto prose-img:my-10 prose-img:shadow-md
              prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        /* ── Editor Mode ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div>
              <Label className="text-sm font-medium">{lang === "el" ? "Τίτλος" : "Title"} *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === "el" ? "π.χ. 10 κρυμμένοι παράδεισοι στην Ελλάδα" : "e.g. 10 hidden paradises in Greece"}
                className="text-lg h-12 mt-1.5"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium">{lang === "el" ? "Περιεχόμενο" : "Content"} * <span className="text-muted-foreground font-normal">(HTML)</span></Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={uploading}
                    onClick={() => document.getElementById("content-image-input")?.click()}
                    className="gap-1.5"
                  >
                    <ImageIcon size={14} />
                    {lang === "el" ? "Εικόνα" : "Image"}
                  </Button>
                  <input id="content-image-input" type="file" accept="image/*" className="hidden" onChange={handleContentImageUpload} />
                  <WordIndicator />
                </div>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={lang === "el" ? "Γράψτε το άρθρο σας εδώ... (υποστηρίζει HTML)" : "Write your post here... (supports HTML)"}
                rows={24}
                className="font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {lang === "el"
                  ? "300-500 (σύντομο) · 800-1200 (κανονικό) · 1500+ (αναλυτικό SEO)"
                  : "300-500 (short) · 800-1200 (standard) · 1500+ (in-depth SEO)"}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Slug */}
            <div className="bg-card rounded-xl border p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{lang === "el" ? "Ρυθμίσεις" : "Settings"}</h3>
              <div>
                <Label className="text-xs">Slug *</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="travel-tips" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">/blog/{slug}</p>
              </div>

              {/* Excerpt */}
              <div>
                <Label className="text-xs">{lang === "el" ? "Σύντομη Περιγραφή" : "Excerpt"}</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={lang === "el" ? "Σύντομη περιγραφή..." : "Short description..."} rows={2} className="mt-1" />
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-card rounded-xl border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{lang === "el" ? "Κύρια Εικόνα" : "Featured Image"}</h3>
              {featuredImage ? (
                <div className="relative group">
                  <img src={featuredImage} alt="" className="w-full h-40 rounded-lg object-cover" />
                  <button
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("blog-image-input")?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{lang === "el" ? "Κλικ για ανέβασμα" : "Click to upload"}</span>
                </div>
              )}
              <input id="blog-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* SEO */}
            <div className="bg-card rounded-xl border p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">SEO</h3>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Meta Title</Label>
                  <LenIndicator current={metaTitleLen} min={30} max={60} label="chars" />
                </div>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={lang === "el" ? "Τίτλος SEO" : "SEO title"} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Meta Description</Label>
                  <LenIndicator current={metaDescLen} min={120} max={160} label="chars" />
                </div>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder={lang === "el" ? "Περιγραφή SEO" : "SEO description"} rows={2} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostEditor;
