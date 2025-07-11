// the main webhook for lemon

import { NextRequest, NextResponse } from "next/server";
import {
  cancelSubFromDB,
  updateUserStatus,
  upsertSubscription,
  verifyWebhookSignature,
} from "@/lib/lemonsqueezy/subscription-helpers";
import { cancelLemonSubscription } from "@/lib/lemonsqueezy/lemonsqueezy";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // get it as text for the signature verification to work
    const body = await request.text();
    const signature = request.headers.get("X-Signature");
    if (!signature) {
      console.error("signature was not provided by lemon");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }

    // if signature is valid , parse it
    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error("failed to parse webhook ");
      return NextResponse.json({ error: "parse error " }, { status: 400 });
    }

    // get info from the payload
    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;
    const metaCustomData = event.meta?.custom_data;

    // Handle different subscription events
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        await handleSubscriptionUpdate(subscriptionData, metaCustomData);
        break;

      case "subscription_canceled":
        // User cancelled but keeps access until period ends
        await handleSubscriptionCancellation(subscriptionData);
        break;

      case "subscription_expired":
        // Subscription actually ended - remove access
        await handleSubscriptionExpired(subscriptionData);
        break;

      default:
        console.log("unhandled event type : ", eventType);
    }


    return NextResponse.json({ recieved: true });
  } catch (error) {
    console.error("error processing web hook : ", error);
    return NextResponse.json(
      {
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}

 const handleSubscriptionUpdate = async (
  subscriptionData: any,
  metaCustomData: any
) => {
  try {
    const attributes = subscriptionData.attributes;
    const userId = metaCustomData.user_id;
    // prepare data for the database
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
    const success = await upsertSubscription(subscriptionUpdate);
    if (!success) {
      console.log("error while upserting subscription data to database");
    } else {
      console.log("updated db with subscription data successfully ");
    }
  } catch (error) {
    console.error("Error handling subscription update: ", error);
  }
};

 const handleSubCancellation = async (subscriptionId: any) => {
  try {
    console.log(
      "canceling this subscription id from the database: ",
      subscriptionId
    );
    const successDB = await cancelSubFromDB(subscriptionId);
    if (successDB) {
      console.log("canceled subscription successfully from db ");
    } else {
      console.log("failed to cancel subscription from db");
    }
    const successLS = await cancelLemonSubscription(subscriptionId);
    if (successLS) {
      console.log("canceled subscription successfully from lemon ");
    } else {
      console.log("failed to cancel subscription from lemon");
    }
  } catch (error) {
    console.error(` Error handling subscription cancellation:`, error);
  }
};

// Handle when user cancels (but keeps access until period ends)
 const handleSubscriptionCancellation = async (subscriptionData: any) => {
  try {
    console.log("Handling subscription cancellation:", subscriptionData.id);
    const supabase = await createClient();
    const attributes = subscriptionData.attributes;

    // Update subscription status to cancelled but DON'T remove premium access
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
        current_period_end: attributes.ends_at, // Make sure we have the end date
      })
      .eq("lemonsqueezy_subscription_id", subscriptionData.id);

    if (error) {
      console.error("Error updating cancelled subscription:", error);
      return false;
    }

    // DON'T UPDATE is_premium here - user keeps access until period ends
    console.log(
      "Subscription marked as cancelled, user retains access until period ends"
    );
    return true;
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    return false;
  }
};

// Handle when subscription actually expires (remove access)
 const handleSubscriptionExpired = async (subscriptionData: any) => {
  try {
    console.log("Handling subscription expiration:", subscriptionData.id);
    const supabase = await createClient();
    // Get user_id from subscription
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("lemonsqueezy_subscription_id", subscriptionData.id)
      .single();

    if (fetchError || !subscription) {
      console.error("Error fetching subscription for expiration:", fetchError);
      return false;
    }

    // Update subscription status to expired
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("lemonsqueezy_subscription_id", subscriptionData.id);

    if (updateError) {
      console.error("Error updating expired subscription:", updateError);
      return false;
    }

    // NOW remove premium access
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
