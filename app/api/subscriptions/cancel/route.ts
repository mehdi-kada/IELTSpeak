import {
  cancelSubFromDB,
  getUserSubscription,
} from "@/lib/lemonsqueezy/subscription-helpers";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    // get the user -> get the sub -> delete it
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          error: "couldnt get the user ",
        },
        { status: 400 }
      );
    }

    // get the sub
    const sub = await getUserSubscription(user.id);
    if (!sub) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }
    const cancelled = await cancelSubFromDB(sub.lemonsqueezy_subscription_id);
    if (!cancelled) {
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "subscription cancelled successfully",
    });
  } catch (error) {
      return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 })
  }
};
