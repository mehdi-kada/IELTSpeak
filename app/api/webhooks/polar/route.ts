// Polar webhook handler
import { NextRequest, NextResponse } from "next/server";
import {
  upsertSubscription,
  updateUserStatus,
  verifyPolarWebhookSignature,
  cancelSubFromDB,
} from "@/lib/polar/subscription-helpers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // get the webhook payload as text for signature verification
    const body = await request.text();
    const signature = request.headers.get("X-Polar-Webhook-Signature");
    
    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // verify the webhook signature
    if (!verifyPolarWebhookSignature(body, signature)) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error("Invalid JSON payload:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Get event type and data
    const eventType = event.type;
    const eventData = event.data;

    console.log(`Received Polar webhook: ${eventType}`);

    // Handle different subscription events
    switch (eventType) {
      case "checkout.created":
        await handleCheckoutCreated(eventData);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(eventData);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdate(eventData);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancellation(eventData);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(eventData);
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
    console.log("Handling checkout created:", checkoutData.id);

  } catch (error) {
    console.error("Error handling checkout created:", error);
  }
};

const handleSubscriptionCreated = async (subscriptionData: any) => {
  try {
    console.log("Handling subscription creation:", subscriptionData.id);
    
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
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
      renews_at: subscriptionData.current_period_end,
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
    console.log("Handling subscription update:", subscriptionData.id);
    
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
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
      renews_at: subscriptionData.current_period_end,
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

    // update subscription status with no removal yet
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

    console.log("Subscription marked as cancelled, user retains access until period ends");
    return true;
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    return false;
  }
};

const handleSubscriptionExpired = async (subscriptionData: any) => {
  try {
    console.log("Handling subscription expiration:", subscriptionData.id);
    const supabase = await createClient();
    
    //  user_id from subscription
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("polar_subscription_id", subscriptionData.id)
      .single();

    if (fetchError || !subscription) {
      console.error("Error fetching subscription for expiration:", fetchError);
      return false;
    }

    // update subscription status to expired
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscriptionData.id);

    if (updateError) {
      console.error("Error updating expired subscription:", updateError);
      return false;
    }

    // Remove premium access
    const premiumUpdateSuccess = await updateUserStatus(
      subscription.user_id,
      false
    );

    if (!premiumUpdateSuccess) {
      console.error("Failed to remove premium status on expiration");
      return false;
    }

    console.log("Subscription expired, premium access removed");
    return true;
  } catch (error) {
    console.error("Error handling subscription expiration:", error);
    return false;
  }
};
