import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import {
  upsertSubscription,
  updateUserStatus,
  cancelSubFromDB,
} from "@/lib/polar/subscription-helpers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload as raw buffer for Polar SDK validation
    const bodyBuffer = await request.arrayBuffer();
    const body = Buffer.from(bodyBuffer);
    const headers = Object.fromEntries(request.headers.entries());

    // Validate the webhook using Polar's official SDK
    let event;
    try {
      event = validateEvent(
        body,
        headers,
        process.env.POLAR_WEBHOOK_SECRET ?? ""
      );
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("Webhook verification failed:", error.message);
        return NextResponse.json(
          { error: "Webhook verification failed" },
          { status: 403 }
        );
      }
      throw error;
    }
    const eventType = event.type;
    const eventData = event.data;
    switch (eventType) {
      case "checkout.created":
        await handleCheckoutCreated(eventData);
        break;
      case "order.paid":
        await handleOrderPaid(eventData);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(eventData);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdate(eventData);
        break;
      case "subscription.canceled":
        await handleSubscriptionCancellation(eventData);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Polar webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const handleCheckoutCreated = async (checkoutData: any) => {
  try {
  } catch (error) {
    console.error("Error handling checkout created:", error);
  }
};

const handleOrderPaid = async (orderData: any) => {
  try {
    const userId = orderData.metadata?.user_id;
    if (!userId) {
      console.error("No user_id in order metadata");
      return;
    }
    if (!orderData.subscription) {
      console.log("Order doesn't contain subscription data, skipping");
      return;
    }
    const subscriptionData = orderData.subscription;
    const productData = orderData.product;
    const subscriptionUpdate = {
      user_id: userId,
      polar_subscription_id: subscriptionData.id,
      polar_customer_id: subscriptionData.customerId,
      status: subscriptionData.status,
      plan_name:
        subscriptionData.product?.name ||
        orderData.product?.name ||
        "Polar Subscription",
      current_period_start: subscriptionData.currentPeriodStart,
      current_period_end: subscriptionData.currentPeriodEnd,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
      renews_at: subscriptionData.currentPeriodEnd,
    };
    const success = await upsertSubscription(subscriptionUpdate);
    if (!success) {
      console.error("Error upserting subscription data from order");
    } else {
      console.log("Successfully created subscription from paid order");
    }
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
};

const handleSubscriptionCreated = async (subscriptionData: any) => {
  try {
    const userId = subscriptionData.metadata?.user_id;
    if (!userId) {
      console.error("No user_id in subscription metadata");
      return;
    }
    const subscriptionUpdate = {
      user_id: userId,
      polar_subscription_id: subscriptionData.id,
      polar_customer_id: subscriptionData.customerId,
      status: subscriptionData.status,
      plan_name: subscriptionData.product?.name || "Polar Subscription",
      current_period_start: subscriptionData.currentPeriodStart,
      current_period_end: subscriptionData.currentPeriodEnd,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
      renews_at: subscriptionData.currentPeriodEnd,
    };
    const success = await upsertSubscription(subscriptionUpdate);
    if (!success) {
      console.error("Error upserting subscription data");
    } else {
      console.log("Updated database with subscription data successfully");
    }
  } catch (error) {
    console.error("Error handling subscription creation:", error);
  }
};

const handleSubscriptionUpdate = async (subscriptionData: any) => {
  try {
    const userId = subscriptionData.metadata?.user_id;
    if (!userId) {
      console.error("No user_id in subscription metadata");
      return;
    }
    const subscriptionUpdate = {
      user_id: userId,
      polar_subscription_id: subscriptionData.id,
      polar_customer_id: subscriptionData.customer_id,
      status: subscriptionData.status,
      plan_name: subscriptionData.product?.name || "Polar Subscription",
      current_period_start: subscriptionData.currentPeriodStart,
      current_period_end: subscriptionData.currentPeriodEnd,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd || false,
      renews_at: subscriptionData.cancelAtPeriodEnd,
    };
    const success = await upsertSubscription(subscriptionUpdate);
    if (!success) {
      console.error("Error upserting subscription data");
    } else {
      console.log("Updated database with subscription data successfully");
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
};

const handleSubscriptionCancellation = async (subscriptionData: any) => {
  try {
    console.log("Handling subscription cancellation:", subscriptionData.id);
    const supabase = await createClient();

    // Update subscription status to cancelled but DON'T remove premium access yet
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
        current_period_end: subscriptionData.current_period_end,
      })
      .eq("polar_subscription_id", subscriptionData.id);
    if (error) {
      console.error("Error updating cancelled subscription:", error);
      return false;
    }
    console.log(
      "Subscription marked as cancelled, user retains access until period ends"
    );
    return true;
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    return false;
  }
};
