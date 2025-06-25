import { NextRequest, NextResponse } from "next/server";
import { handleCheckoutSuccess } from "@/lib/subscription-helpers";

export async function POST(request: NextRequest) {
  try {
    const { checkoutId } = await request.json();

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    const result = await handleCheckoutSuccess(checkoutId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to handle checkout success:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process checkout",
      },
      { status: 500 }
    );
  }
}
