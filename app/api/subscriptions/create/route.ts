import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createCheckoutSession } from "@/lib/subscription-helpers";

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create checkout session
    const { url, checkout_id } = await createCheckoutSession(
      user.id,
      productId
    );

    return NextResponse.json({
      success: true,
      url,
      checkout_id,
    });
  } catch (error) {
    console.error("Failed to create checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
