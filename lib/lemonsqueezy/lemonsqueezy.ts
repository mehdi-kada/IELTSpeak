// for the api functions

import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  type Subscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { NextResponse } from "next/server";

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

/* function to create checkou
 * @param variantId for the product from my store
 * @param userId from supabase
 * @param userEmail to prefill checkout url
 */
// define checkout options -> create chekout -> create chekout url and return it
export const createSubscriptionCheckout = async (
  variantId: string,
  userId: string,
  userEmail: string
) => {
  try {
    const checkoutOptions = {
      checkoutData: {
        email: userEmail,
        custom: {
          user_id: userId,
        },
      },
      productOptions: {
        redirectUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000"
        }/dashboard?success=true`,
        receiptButtonText: "Go to Dashboard", // Button text on receipt
        receiptThankYouNote: "Thank you for subscribing to ToEILET Premium!",
      },
    };

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      checkoutOptions
    );

    if (checkout.error) {
      console.log("couldnt create checkout", checkout.error);
      return null;
    }

    const checkoutUrl = checkout.data?.data.attributes.url;

    return checkoutUrl || null;
  } catch (error) {
    console.error("error creating subscription url : ", error);
    return NextResponse.json({ error: error }, { status: 401 });
  }
};

// get subscription details from lemonsSqueezy
export const getLemonSubscription = async (
  subscriptionId: string
): Promise<Subscription | null> => {
  try {
    const sub = await getSubscription(subscriptionId);
    if (sub.error) {
      console.log("error getting subscription");
      return null;
    }
    return sub.data;
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
};

// function to cancelt the subscription
export const cancelLemonSubscription = async (subId: string): Promise<boolean> => {
  try {
    const result = await cancelSubscription(subId);
    if (!result) {
      console.log("couldnt cancel the subscription");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};
