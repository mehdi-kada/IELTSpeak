import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserSubscription,
  isUserSubscribed,
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

    // First check if the table exists by trying a simple query
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from("user_subscriptions")
        .select("count")
        .limit(1);

      if (tableError) {
        console.error("Database table error:", tableError);
        // Return a default response if table doesn't exist
        return NextResponse.json({
          isSubscribed: false,
          subscription: null,
          message:
            "Subscription table not found. Please run the database migration first.",
        });
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({
        isSubscribed: false,
        subscription: null,
        message: "Database connection failed",
      });
    }

    // Get user subscription status
    const { data: subscription, error } = await getUserSubscription(user.id);
    const isSubscribed = await isUserSubscribed(user.id);

    if (error) {
      console.error("Failed to get subscription status:", error);
      return NextResponse.json(
        { error: "Failed to get subscription status", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isSubscribed,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Failed to get subscription status:", error);
    return NextResponse.json(
      {
        error: "Failed to get subscription status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
