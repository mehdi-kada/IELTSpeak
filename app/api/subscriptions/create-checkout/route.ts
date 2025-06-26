import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createSubscriptionCheckout } from "@/lib/lemonsqueezy";

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

    // Parse request body
    const { variantId } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { error: "Product variant ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    // Create checkout session with LemonSqueezy
    const checkoutUrl = await createSubscriptionCheckout(
      variantId,
      user.id,
      user.email!
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl,
      message: "Checkout session created successfully",
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
