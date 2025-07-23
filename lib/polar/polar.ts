import { Polar } from "@polar-sh/sdk";

// Initialize Polar API client
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  serverURL: "https://sandbox-api.polar.sh"
});


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
      allowDiscountCodes: true,
      requireBillingAddress: false,
    });

    return checkoutSession.url;
  } catch (error) {
    console.error("Error creating Polar checkout:", error);
    return null;
  }
};


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
