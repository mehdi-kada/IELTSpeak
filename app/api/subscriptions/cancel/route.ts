import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { cancelLemonSqueezySubscription } from "@/lib/lemonsqueezy";
import { cancelSubscriptionInDB } from "@/lib/subscription-helpers";

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel subscription in LemonSqueezy
    const cancelSuccess = await cancelLemonSqueezySubscription(
      subscription.lemonsqueezy_subscription_id
    );

    if (!cancelSuccess) {
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 }
      );
    }

    // Update subscription status in database
    const dbUpdateSuccess = await cancelSubscriptionInDB(
      subscription.lemonsqueezy_subscription_id
    );

    if (!dbUpdateSuccess) {
      return NextResponse.json(
        { error: "Failed to update subscription status in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Subscription cancelled successfully",
      cancelled: true,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
