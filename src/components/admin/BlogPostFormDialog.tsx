import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { createBlogPost, updateBlogPost, uploadBlogImage, type BlogPost } from "@/lib/blogApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogPost | null;
  authorId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BlogPostFormDialog = ({ open, onOpenChange, post, authorId }: Props) => {
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
    } else {
      setTitle(""); setSlug(""); setExcerpt(""); setContent("");
      setFeaturedImage(""); setMetaTitle(""); setMetaDescription(""); setStatus("draft");
    }
  }, [post, open]);

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
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? (lang === "el" ? "Επεξεργασία Άρθρου" : "Edit Post") : (lang === "el" ? "Νέο Άρθρο" : "New Post")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label>{lang === "el" ? "Τίτλος" : "Title"} *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={lang === "el" ? "π.χ. Συμβουλές ταξιδιού" : "e.g. Travel tips"} />
          </div>

          {/* Slug */}
          <div>
            <Label>Slug *</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="travel-tips" />
            <p className="text-xs text-muted-foreground mt-1">/blog/{slug}</p>
          </div>

          {/* SEO Meta Title */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Meta Title (SEO)</Label>
              <LenIndicator current={metaTitleLen} min={30} max={60} label="chars" />
            </div>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={lang === "el" ? "Τίτλος για μηχανές αναζήτησης" : "Title for search engines"} />
            <p className="text-xs text-muted-foreground mt-1">{lang === "el" ? "Ιδανικά 30-60 χαρακτήρες" : "Ideally 30-60 characters"}</p>
          </div>

          {/* SEO Meta Description */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Meta Description (SEO)</Label>
              <LenIndicator current={metaDescLen} min={120} max={160} label="chars" />
            </div>
            <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder={lang === "el" ? "Περιγραφή για μηχανές αναζήτησης" : "Description for search engines"} rows={2} />
            <p className="text-xs text-muted-foreground mt-1">{lang === "el" ? "Ιδανικά 120-160 χαρακτήρες" : "Ideally 120-160 characters"}</p>
          </div>

          {/* Excerpt */}
          <div>
            <Label>{lang === "el" ? "Σύντομη Περιγραφή (Excerpt)" : "Excerpt"}</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={lang === "el" ? "Σύντομη περιγραφή για τη λίστα..." : "Short description for listing..."} rows={2} />
          </div>

          {/* Featured Image */}
          <div>
            <Label>{lang === "el" ? "Κύρια Εικόνα" : "Featured Image"}</Label>
            <div className="flex items-center gap-3 mt-1">
              {featuredImage && <img src={featuredImage} alt="" className="w-20 h-14 rounded-lg object-cover" />}
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                type="button"
                onClick={() => document.getElementById("blog-image-input")?.click()}
              >
                <Upload size={14} className="mr-1" />
                {uploading ? "..." : (lang === "el" ? "Ανέβασμα" : "Upload")}
              </Button>
              <input id="blog-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {featuredImage && (
                <Button variant="ghost" size="sm" onClick={() => setFeaturedImage("")}>✕</Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between">
              <Label>{lang === "el" ? "Περιεχόμενο" : "Content"} *</Label>
              <span className={`text-xs ${wordCount >= 300 ? "text-green-600" : wordCount > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                {wordCount} {lang === "el" ? "λέξεις" : "words"}
                {wordCount > 0 && wordCount < 300 && (lang === "el" ? " (προτείνεται 300+)" : " (300+ recommended)")}
                {wordCount >= 300 && wordCount < 800 && " ✓"}
                {wordCount >= 800 && wordCount < 1500 && (lang === "el" ? " (πολύ καλό!)" : " (great!)")}
                {wordCount >= 1500 && (lang === "el" ? " (εξαιρετικό!)" : " (excellent!)")}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={lang === "el" ? "Γράψτε το άρθρο σας εδώ... (υποστηρίζει HTML)" : "Write your post here... (supports HTML)"}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lang === "el"
                ? "Συστήνεται: 300-500 λέξεις (σύντομο), 800-1200 λέξεις (κανονικό), 1500+ λέξεις (αναλυτικό SEO)"
                : "Recommended: 300-500 words (short), 800-1200 words (standard), 1500+ words (in-depth SEO)"}
            </p>
          </div>

          {/* Status */}
          <div>
            <Label>{lang === "el" ? "Κατάσταση" : "Status"}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{lang === "el" ? "Πρόχειρο" : "Draft"}</SelectItem>
                <SelectItem value="published">{lang === "el" ? "Δημοσιευμένο" : "Published"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {lang === "el" ? "Ακύρωση" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (lang === "el" ? "Αποθήκευση..." : "Saving...") : isEdit ? (lang === "el" ? "Ενημέρωση" : "Update") : (lang === "el" ? "Δημιουργία" : "Create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostFormDialog;
