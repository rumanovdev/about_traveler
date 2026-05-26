import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_STRIPE_PRICE_ID,
  SITE_URL,
  getSupabaseAdmin,
  stripeRequest,
} from "@/lib/stripe-subscription";

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminClient = getSupabaseAdmin();
    const priceId = import.meta.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return new Response(JSON.stringify({ error: "STRIPE_PRICE_ID not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: existingSub } = await adminClient
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSub?.status === "active") {
      return new Response(JSON.stringify({ error: "Subscription already active" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customerParams = new URLSearchParams();
      if (user.email) customerParams.set("email", user.email);
      customerParams.set("metadata[user_id]", user.id);

      const customerRes = await stripeRequest("/customers", "POST", customerParams);
      const customer = await customerRes.json();

      if (!customerRes.ok) {
        console.error("Stripe customer creation failed:", customer);
        return new Response(JSON.stringify({ error: "Failed to create Stripe customer" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      customerId = customer.id;
    }

    const sessionParams = new URLSearchParams();
    sessionParams.set("mode", "subscription");
    sessionParams.set("customer", customerId);
    sessionParams.set("success_url", `${SITE_URL}/dashboard?tab=subscription&checkout=success`);
    sessionParams.set("cancel_url", `${SITE_URL}/dashboard?tab=subscription&checkout=cancelled`);
    sessionParams.set("client_reference_id", user.id);
    sessionParams.set("metadata[user_id]", user.id);
    sessionParams.set("line_items[0][price]", priceId);
    sessionParams.set("line_items[0][quantity]", "1");
    sessionParams.set("subscription_data[metadata][user_id]", user.id);
    sessionParams.set("allow_promotion_codes", "true");

    const sessionRes = await stripeRequest("/checkout/sessions", "POST", sessionParams);
    const session = await sessionRes.json();

    if (!sessionRes.ok) {
      console.error("Stripe checkout session failed:", session);
      const detail = session?.error?.message || "Unknown Stripe error";
      return new Response(JSON.stringify({ error: `Checkout failed: ${detail}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
