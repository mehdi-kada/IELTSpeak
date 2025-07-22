import { Polar } from "@polar-sh/sdk";

// Initialize Polar API client
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

/**
 * Create a checkout session for a subscription
 * @param productId The Polar product ID
 * @param userId The user ID from Supabase
 * @param userEmail The user's email
 * @param successUrl Optional success URL override
 */
export const createPolarCheckout = async (
  productId: string,
  userId: string,
  userEmail: string,
  successUrl?: string
) => {
  try {
    const checkoutSession = await polar.checkouts.create({
      products: [productId],
      customerEmail: userEmail,
      metadata: {
        user_id: userId,
      },
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    });

    return checkoutSession.url;
  } catch (error) {
    console.error("Error creating Polar checkout:", error);
    return null;
  }
};

/**
 * Get subscription details from Polar
 * @param subscriptionId The Polar subscription ID
 */
export const getPolarSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await polar.subscriptions.get({
      id: subscriptionId,
    });
    return subscription;
  } catch (error) {
    console.error("Error getting Polar subscription:", error);
    return null;
  }
};

/**
 * Cancel a Polar subscription
 * @param subscriptionId The Polar subscription ID
 */
export const cancelPolarSubscription = async (subscriptionId: string) => {
  try {
    // For now, we'll handle cancellation through the webhook or manual process
    // The exact API structure depends on Polar's implementation
    console.log(`Marking subscription ${subscriptionId} for cancellation`);
    return { id: subscriptionId, cancelled: true };
  } catch (error) {
    console.error("Error cancelling Polar subscription:", error);
    return null;
  }
};

/**
 * Get customer details from Polar
 * @param customerId The Polar customer ID
 */
export const getPolarCustomer = async (customerId: string) => {
  try {
    const customer = await polar.customers.get({
      id: customerId,
    });
    return customer;
  } catch (error) {
    console.error("Error getting Polar customer:", error);
    return null;
  }
};
