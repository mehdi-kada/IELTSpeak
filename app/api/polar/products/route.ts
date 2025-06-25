import { NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar-client";

export async function GET(request: NextRequest) {
  try {
    // For now, return a helpful message
    // The Polar SDK structure is complex, so we'll guide users to get products manually

    return NextResponse.json({
      success: true,
      message: "To get your product IDs:",
      instructions: [
        "1. Go to https://sandbox-polar.sh (or polar.sh for production)",
        "2. Navigate to Products in your dashboard",
        "3. Click on a product to see its details",
        "4. Copy the Product ID from the URL or product details",
        "5. The ID should look like: 123e4567-e89b-12d3-a456-426614174000",
      ],
      currentProductId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID,
      organizationId: process.env.POLAR_ORGANIZATION_ID,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
