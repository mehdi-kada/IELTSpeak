import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { cancelUserSubscription } from "@/lib/subscription-helpers";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cancel user subscription
    const result = await cancelUserSubscription(user.id);

    return NextResponse.json({
      success: true,
      message:
        "Subscription will be canceled at the end of the current billing period",
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
      },
      { status: 500 }
    );
  }
}
