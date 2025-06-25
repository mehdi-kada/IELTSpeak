import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  getAllUserSubscriptionsForDebug,
  cleanupDuplicateSubscriptions,
  getUserSubscription,
} from "@/lib/subscription-helpers";

export async function GET(request: NextRequest) {
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

    // Get all subscriptions for debugging
    const { data: allSubscriptions, error: allError } =
      await getAllUserSubscriptionsForDebug(user.id);

    // Get current subscription (what the app uses)
    const { data: currentSubscription, error: currentError } =
      await getUserSubscription(user.id);

    return NextResponse.json({
      userId: user.id,
      totalSubscriptions: allSubscriptions?.length || 0,
      allSubscriptions: allSubscriptions || [],
      currentSubscription: currentSubscription,
      errors: {
        allError: allError?.message,
        currentError: currentError?.message,
      },
    });
  } catch (error) {
    console.error("Failed to debug subscriptions:", error);
    return NextResponse.json(
      {
        error: "Failed to debug subscriptions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "cleanup") {
      const { error, cleaned } = await cleanupDuplicateSubscriptions(user.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to cleanup duplicates", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${cleaned} duplicate subscriptions`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'cleanup'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to process subscription action:", error);
    return NextResponse.json(
      {
        error: "Failed to process action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
