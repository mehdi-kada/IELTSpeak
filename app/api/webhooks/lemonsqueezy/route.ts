import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  upsertSubscription,
  cancelSubscriptionInDB,
} from "@/lib/subscription-helpers";

/**
 * Verifies that the webhook is from LemonSqueezy using the signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`🔔 [${timestamp}] Webhook received`);

  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get("X-Signature");

    console.log(`📝 [${timestamp}] Webhook body length: ${body.length}`);
    console.log(`🔐 [${timestamp}] Signature present: ${!!signature}`);
    console.log(
      `🔗 [${timestamp}] Headers:`,
      Object.fromEntries(request.headers.entries())
    );

    if (!signature) {
      console.error(`❌ [${timestamp}] No signature provided`);
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Log webhook secret status (don't log the actual secret)
    const hasWebhookSecret = !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    console.log(
      `🔑 [${timestamp}] Webhook secret configured: ${hasWebhookSecret}`
    );

    if (!hasWebhookSecret) {
      console.error(
        `❌ [${timestamp}] LEMONSQUEEZY_WEBHOOK_SECRET not configured`
      );
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    console.log(`🔐 [${timestamp}] Verifying signature...`);
    if (!verifyWebhookSignature(body, signature)) {
      console.error(`❌ [${timestamp}] Invalid webhook signature`);
      console.log(`🔍 [${timestamp}] Signature received: ${signature}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`✅ [${timestamp}] Webhook signature verified`);

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
      console.log(`📦 [${timestamp}] Payload parsed successfully`);
    } catch (parseError) {
      console.error(
        `❌ [${timestamp}] Failed to parse webhook payload:`,
        parseError
      );
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;
    const metaCustomData = event.meta?.custom_data || {};

    console.log(`🎯 [${timestamp}] Event type: ${eventType}`);
    console.log(`📊 [${timestamp}] Subscription ID: ${subscriptionData?.id}`);
    console.log(
      `👤 [${timestamp}] Meta custom data:`,
      JSON.stringify(metaCustomData, null, 2)
    );
    console.log(
      `📋 [${timestamp}] Attributes custom data:`,
      JSON.stringify(subscriptionData?.attributes?.custom_data, null, 2)
    );
    console.log(
      `📋 [${timestamp}] Full event structure:`,
      JSON.stringify(event, null, 2)
    );

    // Handle different subscription events
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        console.log(
          `🔄 [${timestamp}] Processing subscription update for event: ${eventType}`
        );
        await handleSubscriptionUpdate(
          subscriptionData,
          metaCustomData,
          timestamp
        );
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        console.log(
          `🚫 [${timestamp}] Processing subscription cancellation for event: ${eventType}`
        );
        await handleSubscriptionCancellation(subscriptionData, timestamp);
        break;

      default:
        console.log(`⚠️ [${timestamp}] Unhandled event type: ${eventType}`);
    }

    console.log(`✅ [${timestamp}] Webhook processing completed successfully`);
    return NextResponse.json({ received: true, timestamp });
  } catch (error) {
    console.error(`💥 [${timestamp}] Error processing webhook:`, error);
    console.error(
      `💥 [${timestamp}] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      { error: "Internal server error", timestamp },
      { status: 500 }
    );
  }
}

/**
 * Handles subscription creation and updates
 */
async function handleSubscriptionUpdate(
  subscriptionData: any,
  metaCustomData: any,
  timestamp: string
) {
  console.log(`🔄 [${timestamp}] Processing subscription update`);

  try {
    const attributes = subscriptionData.attributes;
    const attributesCustomData = attributes.custom_data || {};

    console.log(`📋 [${timestamp}] Subscription attributes:`, {
      id: subscriptionData.id,
      status: attributes.status,
      customer_id: attributes.customer_id,
      product_name: attributes.product_name,
      attributes_custom_data: attributesCustomData,
      meta_custom_data: metaCustomData,
    });

    // Try to get user ID from meta custom data first, then fall back to attributes
    let userId = metaCustomData.user_id || attributesCustomData.user_id;

    if (!userId) {
      console.error(`❌ [${timestamp}] No user ID found in subscription data`);
      console.log(`❌ [${timestamp}] Meta custom data:`, metaCustomData);
      console.log(
        `❌ [${timestamp}] Attributes custom data:`,
        attributesCustomData
      );
      console.log(`❌ [${timestamp}] Full attributes:`, attributes);
      return;
    }

    console.log(`👤 [${timestamp}] Found user ID: ${userId}`);

    // Prepare subscription data for database
    const subscriptionUpdate = {
      user_id: userId,
      lemonsqueezy_subscription_id: subscriptionData.id,
      lemonsqueezy_customer_id: attributes.customer_id.toString(),
      status: attributes.status,
      plan_name: attributes.product_name || "Monthly Subscription",
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at,
      cancel_at_period_end: attributes.cancelled || false,
      renews_at: attributes.renews_at,
    };

    console.log(
      `💾 [${timestamp}] Attempting to save subscription:`,
      subscriptionUpdate
    );

    // Update subscription in database
    const success = await upsertSubscription(subscriptionUpdate);

    if (success) {
      console.log(
        `✅ [${timestamp}] Subscription ${subscriptionData.id} updated successfully`
      );
    } else {
      console.error(
        `❌ [${timestamp}] Failed to update subscription ${subscriptionData.id}`
      );
    }
  } catch (error) {
    console.error(
      `💥 [${timestamp}] Error handling subscription update:`,
      error
    );
    console.error(
      `💥 [${timestamp}] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace"
    );
  }
}

/**
 * Handles subscription cancellation and expiration
 */
async function handleSubscriptionCancellation(
  subscriptionData: any,
  timestamp: string
) {
  try {
    console.log(`🚫 [${timestamp}] Processing subscription cancellation`);
    const subscriptionId = subscriptionData.id;

    // Cancel subscription in database
    const success = await cancelSubscriptionInDB(subscriptionId);

    if (success) {
      console.log(
        `✅ [${timestamp}] Subscription ${subscriptionId} cancelled successfully`
      );
    } else {
      console.error(
        `❌ [${timestamp}] Failed to cancel subscription ${subscriptionId}`
      );
    }
  } catch (error) {
    console.error(
      `💥 [${timestamp}] Error handling subscription cancellation:`,
      error
    );
    console.error(
      `💥 [${timestamp}] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace"
    );
  }
}
