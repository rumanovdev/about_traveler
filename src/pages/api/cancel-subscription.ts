import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin, stripeRequest } from "@/lib/stripe-subscription";

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

    const { data: sub, error: subError } = await adminClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subError || !sub) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (sub.stripe_subscription_id) {
      const stripeRes = await stripeRequest(
        `/subscriptions/${sub.stripe_subscription_id}`,
        "DELETE",
      );
      if (!stripeRes.ok) {
        console.error("Stripe cancellation failed:", await stripeRes.text());
      }
    }

    const { error: updateError } = await adminClient
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", sub.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await adminClient
      .from("listings")
      .update({ status: "hidden" })
      .eq("user_id", user.id)
      .eq("status", "active");

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
