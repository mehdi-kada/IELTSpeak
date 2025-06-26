import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { getUserSubscription } from "@/lib/subscription-helpers";

export async function GET(request: NextRequest) {
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

    // Get user's subscription from database
    const subscription = await getUserSubscription(user.id);

    return NextResponse.json({
      subscription,
      hasActiveSubscription: !!subscription,
      isPremium: subscription?.status === "active",
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
