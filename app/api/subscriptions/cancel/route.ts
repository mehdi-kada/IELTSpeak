import { cancelLemonSubscription } from "@/lib/lemonsqueezy/lemonsqueezy";
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
          ok: false,
          error: "couldnt get the user ",
        },
        { status: 400 }
      );
    }

    // get the sub
    const sub = await getUserSubscription(user.id);
    console.log("sub data is : ", sub);

    if (!sub) {
      return NextResponse.json(
        { ok: false, error: "No active subscription found" },
        { status: 404 }
      );
    }

    const cancelLemon = await cancelLemonSubscription(
      sub.lemonsqueezy_subscription_id
    );
    if (!cancelLemon) {
      return NextResponse.json(
        { ok: false, error: "Failed to cancel subscription from lemonsqueezy" },
        { status: 500 }
      );
    }

    const cancelleDB = await cancelSubFromDB(sub.lemonsqueezy_subscription_id);

    if (!cancelleDB) {
      return NextResponse.json(
        { ok: false, error: "Failed to cancel subscription from  DB" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "subscription cancelled successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
