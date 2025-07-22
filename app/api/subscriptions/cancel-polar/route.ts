// Ensure "@/lib/polar/polar.ts" exists and exports cancelPolarSubscription
import { cancelPolarSubscription } from "@/lib/polar/polar";
import {
  cancelSubFromDB,
  getUserSubscription,
} from "@/lib/polar/subscription-helpers";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    // Get the user -> get the sub -> cancel it
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "couldn't get the user",
        },
        { status: 400 }
      );
    }

    // Get the subscription
    const sub = await getUserSubscription(user.id);

    if (!sub) {
      return NextResponse.json(
        { ok: false, error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (!sub.polar_subscription_id) {
      return NextResponse.json(
        { ok: false, error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Cancel the Polar subscription
    const cancelPolar = await cancelPolarSubscription(sub.polar_subscription_id);
    if (!cancelPolar) {
      return NextResponse.json(
        { ok: false, error: "Failed to cancel subscription from Polar" },
        { status: 500 }
      );
    }

    // Update database
    const cancelledDB = await cancelSubFromDB(sub.polar_subscription_id);

    if (!cancelledDB) {
      return NextResponse.json(
        { ok: false, error: "Failed to cancel subscription from DB" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
