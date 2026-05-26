import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/stripe-subscription";

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

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user_id } = await request.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prevent self-deletion
    if (user_id === caller.id) {
      return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminClient = getSupabaseAdmin();

    // Delete related data first
    await adminClient.from("favorites").delete().eq("user_id", user_id);
    await adminClient.from("user_roles").delete().eq("user_id", user_id);
    await adminClient.from("subscriptions").delete().eq("user_id", user_id);
    await adminClient.from("profiles").delete().eq("user_id", user_id);

    // Delete user's listings and their related data
    const { data: userListings } = await adminClient.from("listings").select("id").eq("user_id", user_id);
    if (userListings && userListings.length > 0) {
      const listingIds = userListings.map((l: any) => l.id);
      await adminClient.from("contact_messages").delete().in("listing_id", listingIds);
      await adminClient.from("listing_analytics").delete().in("listing_id", listingIds);
      await adminClient.from("chat_rooms").delete().in("listing_id", listingIds);
      await adminClient.from("favorites").delete().in("listing_id", listingIds);
      await adminClient.from("listings").delete().eq("user_id", user_id);
    }

    // Delete chat rooms where user is visitor
    await adminClient.from("chat_rooms").delete().eq("visitor_id", user_id);

    // Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

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
