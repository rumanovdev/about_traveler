import type { APIRoute } from "astro";
import {
  getSupabaseAdmin,
  stripeRequest,
  syncSubscriptionFromStripe,
  upsertSubscription,
  verifyStripeWebhook,
} from "@/lib/stripe-subscription";

export const POST: APIRoute = async ({ request }) => {
  try {
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();
    if (!verifyStripeWebhook(payload, signature, webhookSecret)) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(payload);
    const adminClient = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const subscriptionId = session.subscription;

        if (!userId || !subscriptionId) {
          console.error("Missing user or subscription in checkout session", session.id);
          break;
        }

        const subRes = await stripeRequest(`/subscriptions/${subscriptionId}`, "GET");
        const subscription = await subRes.json();

        if (!subRes.ok) {
          console.error("Failed to fetch subscription:", subscription);
          break;
        }

        await syncSubscriptionFromStripe(adminClient, subscription, userId);
        break;
      }

      case "customer.subscription.updated": {
        await syncSubscriptionFromStripe(adminClient, event.data.object);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncSubscriptionFromStripe(adminClient, {
          ...subscription,
          status: "canceled",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const { data: subRow } = await adminClient
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (!subRow?.user_id) break;

        await upsertSubscription(adminClient, subRow.user_id, {
          status: "past_due",
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const subRes = await stripeRequest(`/subscriptions/${subscriptionId}`, "GET");
        const subscription = await subRes.json();
        if (subRes.ok) {
          await syncSubscriptionFromStripe(adminClient, subscription);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
