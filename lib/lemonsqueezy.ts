"use server";
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  type Subscription,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LemonSqueezy with your API key
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

export async function configureLemonSqueezy() {
  const requiredVars = [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      error: `Missing required LEMONSQUEEZY env variables: ${missingVars.join(
        ", "
      )}. Please, set them in your .env file.`,
    };
  }

  return { error: null };
}

/**
 * Creates a checkout session for monthly subscription
 */
export async function createSubscriptionCheckout(
  variantId: string,
  userId: string,
  userEmail: string
): Promise<string | null> {
  console.log(
    "🛒 Creating checkout for user:",
    userId,
    "email:",
    userEmail,
    "variant:",
    variantId
  );

  try {
    const { error } = await configureLemonSqueezy();
    if (error) {
      console.error("❌ LemonSqueezy configuration error:", error);
      return null;
    }

    console.log("✅ LemonSqueezy configured successfully");

    const checkoutOptions = {
      checkoutData: {
        email: userEmail,
        custom: {
          user_id: userId, // This is crucial for webhook processing
        },
      },
      productOptions: {
        redirectUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000"
        }/dashboard?success=true`,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for subscribing to ToEILET Premium!",
      },
    };

    console.log(
      "📦 Checkout options:",
      JSON.stringify(checkoutOptions, null, 2)
    );

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      checkoutOptions
    );

    if (checkout.error) {
      console.error("❌ Checkout error:", checkout.error);
      return null;
    }

    console.log("✅ Checkout created successfully");
    const checkoutUrl = checkout.data?.data?.attributes?.url;
    console.log("🔗 Checkout URL:", checkoutUrl);

    return checkoutUrl || null;
  } catch (error) {
    console.error("Error creating checkout:", error);
    return null;
  }
}

/**
 * Gets subscription details from LemonSqueezy
 */
export async function getLemonSqueezySubscription(
  subscriptionId: string
): Promise<Subscription | null> {
  try {
    const subscription = await getSubscription(subscriptionId);

    if (subscription.error) {
      console.error("Error fetching subscription:", subscription.error);
      return null;
    }

    return subscription.data;
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
}

/**
 * Cancels a subscription in LemonSqueezy
 */
export async function cancelLemonSqueezySubscription(
  subscriptionId: string
): Promise<boolean> {
  try {
    const result = await cancelSubscription(subscriptionId);

    if (result.error) {
      console.error("Error cancelling subscription:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
}
