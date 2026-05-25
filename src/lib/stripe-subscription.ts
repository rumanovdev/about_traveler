import { createHmac, timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_STRIPE_PRICE_ID = "price_1TZxg3JtZ19MlGv8DdoAsXNw";
export const SITE_URL = import.meta.env.SITE_URL || "https://aboutraveller.com";

export async function stripeRequest(
  path: string,
  method: string,
  params?: URLSearchParams,
): Promise<Response> {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeKey}`,
  };

  let body: string | undefined;
  if (params) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = params.toString();
  }

  return fetch(`https://api.stripe.com/v1${path}`, { method, headers, body });
}

export function mapStripeSubscriptionStatus(status: string): string {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}

export function verifyStripeWebhook(
  payload: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function upsertSubscription(
  adminClient: SupabaseClient,
  userId: string,
  data: Record<string, unknown>,
) {
  const { data: existing } = await adminClient
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = { ...data, updated_at: new Date().toISOString() };

  if (existing) {
    const { error } = await adminClient
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await adminClient.from("subscriptions").insert({
    user_id: userId,
    ...payload,
  });
  if (error) throw error;
}

export async function hideUserListings(adminClient: SupabaseClient, userId: string) {
  await adminClient
    .from("listings")
    .update({ status: "hidden" })
    .eq("user_id", userId)
    .eq("status", "active");
}

export async function syncSubscriptionFromStripe(
  adminClient: SupabaseClient,
  stripeSubscription: Record<string, unknown>,
  userId?: string | null,
) {
  const subscriptionId = stripeSubscription.id as string;
  const metadata = (stripeSubscription.metadata || {}) as Record<string, string>;
  let resolvedUserId = userId || metadata.user_id || null;

  if (!resolvedUserId) {
    const { data } = await adminClient
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();
    resolvedUserId = data?.user_id || null;
  }

  if (!resolvedUserId) {
    console.error("Could not resolve user for subscription", subscriptionId);
    return;
  }

  const status = mapStripeSubscriptionStatus(stripeSubscription.status as string);

  await upsertSubscription(adminClient, resolvedUserId, {
    stripe_customer_id: stripeSubscription.customer as string,
    stripe_subscription_id: subscriptionId,
    status,
    current_period_start: new Date((stripeSubscription.current_period_start as number) * 1000)
      .toISOString(),
    current_period_end: new Date((stripeSubscription.current_period_end as number) * 1000)
      .toISOString(),
  });

  if (status === "canceled" || status === "inactive") {
    await hideUserListings(adminClient, resolvedUserId);
  }
}

export function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
