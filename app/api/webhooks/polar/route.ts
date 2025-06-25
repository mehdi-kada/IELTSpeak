import { verifyWebHookSignature } from "@/lib/polar-client";
import { createAdminClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();

  try {
    // need to make it a text for the hashing (polar signature)
    const body = await request.text();
    // before processing the webhook body we need to validate it first
    // get the signature from the request headers
    const signature = await request.headers.get("polar-signature");
    if (!signature) {
      console.error("no signature found in the webhook headers");
      return NextResponse.json({ error: "no signature" }, { status: 400 });
    }

    // verify that the webhook actually came from the request headers
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    //validate
    const isValid = verifyWebHookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    // now the signature is safe for parsing
    const event = JSON.parse(body);

    // insert the event details to db for validations
    await supabase.from("payment_logs").insert({
      event_type: "webhook",
      polar_event_id: event.id,
      event_data: event,
      status: "received",
    });

    console.log("processing the webhook for polar: ", event.type);

    // handle different types of events
    // each type requires different processing
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription.active":
        await handleSubscriptionActive(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      case "subscription.revoked":
        await handleSubscriptionRevoked(event.data);
        break;
      case "customer.created":
        await handleCustomerCreated(event.data);
        break;
      default:
        console.log("unhandled webhook event type: ", event.type);
        break;
    }

    //update log status to show successful processing
    await supabase
      .from("payment_logs")
      .update({ status: "processed" })
      .eq("polar_event_id", event.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("error while processing webhook:", error);
    //insert error into db for debugging (log it)
    await supabase.from("payment_logs").insert({
      event_type: "webhook_error",
      error_message: error instanceof Error ? error.message : "unknown error",
      status: "error",
    });

    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: any) {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("user_subscriptions").upsert({
    polar_subscription_id: subscription.id,
    polar_customer_id: subscription.customer_id,
    polar_product_id: subscription.product_id,
    status: subscription.status,
    amount: subscription.amount,
    currency: subscription.currency,
    recurring_interval: subscription.recurring_interval,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    started_at: subscription.started_at,
  });

  if (error) console.error("Failed to create subscription:", error);
}

async function handleSubscriptionUpdated(subscription: any) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      ends_at: subscription.ends_at,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", subscription.id);

  if (error) console.error("Failed to update subscription:", error);
}

async function handleSubscriptionActive(subscription: any) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", subscription.id);

  if (error) console.error("Failed to activate subscription:", error);
}

async function handleSubscriptionCanceled(subscription: any) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: true,
      canceled_at: subscription.canceled_at,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", subscription.id);

  if (error) console.error("Failed to cancel subscription:", error);
}

async function handleSubscriptionRevoked(subscription: any) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "revoked",
      ends_at: subscription.ends_at,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", subscription.id);

  if (error) console.error("Failed to revoke subscription:", error);
}

async function handleCustomerCreated(customer: any) {
  const supabase = await createAdminClient();

  // Update user_subscriptions with customer_id if external_id matches
  if (customer.external_id) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        polar_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", customer.external_id)
      .is("polar_customer_id", null);

    if (error) console.error("Failed to link customer:", error);
  }
}
