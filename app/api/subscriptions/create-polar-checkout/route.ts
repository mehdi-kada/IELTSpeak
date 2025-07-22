// Create Polar checkout session
import { createPolarCheckout } from "@/lib/polar/polar";
import { getUserSubscription } from "@/lib/polar/subscription-helpers";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("couldn't get user for checkout");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the product id from the request body
    const data = await request.json();
    const productId = data.productId;

    if (!productId) {
      console.log("no product id provided ");
      return NextResponse.json(
        { error: "product id not provided " },
        { status: 400 }
      );
    }

    // Check if the user has already an active subscription
    const userSubscribed = await getUserSubscription(user.id);
    if (userSubscribed && userSubscribed.status === "active") {
      return NextResponse.json(
        { error: "user already subscribed " },
        { status: 400 }
      );
    }

    // If the user doesn't have any subs, create a new checkout session
    const checkoutUrl = await createPolarCheckout(
      productId,
      user.id,
      user.email!
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Return the checkout url to the frontend
    return NextResponse.json({
      checkoutUrl,
      message: "checkout url created successfully",
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
