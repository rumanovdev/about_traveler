import { supabase } from "@/integrations/supabase/client";
import { pingIndexNow } from "@/lib/indexnow";

// In-memory cache for category slug → IDs (stable across the session)
const _categoryIdCache: Record<string, string[]> = {};

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data;
}

// Columns used by ListingCard — avoids fetching the full row
const LISTING_CARD_COLUMNS =
  "id, business_name, slug, description, location, phone, images, type, capacity, rooms, beds, price_from, price_to, latitude, longitude";

export async function getListingsByCategory(
  categorySlug: string,
  filters?: { type?: string[]; recommended?: string[] },
  page = 0,
  pageSize = 24
) {
  // Support fetching from multiple category slugs (e.g. car-rental + moto-rental)
  const slugs = categorySlug.includes(",") ? categorySlug.split(",") : [categorySlug];
  const cacheKey = [...slugs].sort().join(",");

  // Use cached category IDs when available to avoid the extra round-trip
  let categoryIds: string[];
  if (_categoryIdCache[cacheKey]) {
    categoryIds = _categoryIdCache[cacheKey];
  } else {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .in("slug", slugs);

    if (!categories || categories.length === 0) return { listings: [], total: 0 };

    categoryIds = categories.map((c) => c.id);
    _categoryIdCache[cacheKey] = categoryIds;
  }

  let query = supabase
    .from("listings")
    .select(LISTING_CARD_COLUMNS, { count: "exact" })
    .in("category_id", categoryIds)
    .eq("status", "active");

  if (filters?.type && filters.type.length > 0) {
    query = query.in("type", filters.type);
  }

  if (filters?.recommended && filters.recommended.length > 0) {
    query = query.overlaps("recommended_for", filters.recommended);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { listings: data || [], total: count || 0 };
}

export async function getListingBySlug(slug: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, categories(title, slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) throw error;
  return data;
}

export async function trackListingEvent(listingId: string, eventType: "view" | "phone_click" | "email_click") {
  await supabase.rpc("track_listing_event", {
    _listing_id: listingId,
    _event_type: eventType,
  });
}

export async function getMyListings(userId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, categories(title, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createListing(listing: {
  user_id: string;
  business_name: string;
  slug: string;
  category_id: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  images: string[];
  content_policy_accepted: boolean;
  type?: string;
  recommended_for?: string[];
  capacity?: number | null;
  rooms?: number | null;
  beds?: number | null;
  price_from?: number | null;
}) {
  const { data, error } = await supabase
    .from("listings")
    .insert(listing as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateListing(
  id: string,
  updates: {
    business_name?: string;
    category_id?: string;
    description?: string;
    phone?: string;
    email?: string;
    location?: string;
    images?: string[];
    type?: string;
    recommended_for?: string[];
    capacity?: number | null;
    rooms?: number | null;
    beds?: number | null;
    price_from?: number | null;
  }
) {
  const { data, error } = await supabase
    .from("listings")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyAnalytics(userId: string) {
  // Get listing IDs for user
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("user_id", userId);

  if (!listings || listings.length === 0) return [];

  const listingIds = listings.map((l) => l.id);

  const { data, error } = await supabase
    .from("listing_analytics")
    .select("*")
    .in("listing_id", listingIds)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMySubscription(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function uploadListingImage(userId: string, file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("listing-images")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("listing-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ── Admin API ──

export async function getAllListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*, categories(title, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateListingStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) throw error;

  if (status === "active" && data?.slug) {
    pingIndexNow([`/listing/${data.slug}`]);
  }

  return data;
}

export async function deleteListing(id: string) {
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllUserRoles() {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function getAllSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Contact Messages ──

export async function sendContactMessage(msg: {
  listing_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
}) {
  const { error } = await supabase
    .from("contact_messages" as any)
    .insert(msg as any);
  if (error) throw error;
}

export async function getMyMessages(userId: string) {
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("user_id", userId);

  if (!listings || listings.length === 0) return [];

  const listingIds = listings.map((l) => l.id);

  const { data, error } = await supabase
    .from("contact_messages" as any)
    .select("*, listings(business_name, slug)" as any)
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as any[]) || [];
}

export async function markMessageRead(messageId: string) {
  const { error } = await supabase
    .from("contact_messages" as any)
    .update({ is_read: true } as any)
    .eq("id", messageId);
  if (error) throw error;
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from("contact_messages" as any)
    .delete()
    .eq("id", messageId);
  if (error) throw error;
}

// ── Admin: Delete User ──

export async function deleteUser(userId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    }
  );

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to delete user");
  return result;
}
