import Stripe from "stripe";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!signature || !webhookSecret || !stripeSecretKey) {
    return new Response("Missing stripe webhook config", { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-06-24.dahlia",
  });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email;
    const customerId = session.customer ? String(session.customer) : null;

    if (email) {
      await supabase
        .from("profiles")
        .update({ is_subscribed: true, stripe_customer_id: customerId })
        .eq("email", email);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = String(subscription.customer);

    await supabase
      .from("profiles")
      .update({ is_subscribed: false })
      .eq("stripe_customer_id", customerId);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
