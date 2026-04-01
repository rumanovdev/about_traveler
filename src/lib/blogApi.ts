import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts" as any)
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data as any[]) || [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts" as any)
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) return null;
  return data as any;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as any[]) || [];
}

export async function createBlogPost(post: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  status: string;
  author_id: string;
  published_at?: string | null;
}): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts" as any)
    .insert(post as any)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function updateBlogPost(
  id: string,
  updates: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts" as any)
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from("blog_posts" as any)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function uploadBlogImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `blog/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const { error } = await supabase.storage
    .from("listing-images")
    .upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("listing-images")
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}
