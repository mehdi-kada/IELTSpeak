import { createAdminClient } from "./server";
import { polar } from "./polar-client";

export interface UserSubscription {
  id: string;
  user_id: string;
  polar_customer_id: string;
  polar_subscription_id?: string;
  polar_checkout_id?: string;
  polar_product_id: string;
  polar_product_type?: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  started_at?: string;
  ends_at?: string;
  amount?: number;
  currency: string;
  recurring_interval: string;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(userId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false }) // Get the most recent subscription
    .limit(1)
    .maybeSingle(); // Use maybeSingle() to handle no results gracefully

  return { data: data as UserSubscription | null, error };
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const { data } = await getUserSubscription(userId);
  return !!data && ["active", "trialing"].includes(data.status);
}

export async function cancelUserSubscription(userId: string) {
  const { data: subscription } = await getUserSubscription(userId);

  if (!subscription?.polar_subscription_id) {
    throw new Error("No active subscription found");
  }

  // Cancel via Polar API - mark for cancellation at period end
  const supabase = await createAdminClient();

  // Update in our database first
  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", subscription.polar_subscription_id);

  if (error) throw error;

  return { success: true };
}

export async function createCheckoutSession(userId: string, productId: string) {
  try {
    const supabase = await createAdminClient();

    // Get user from auth system
    const { data: user, error: userError } =
      await supabase.auth.admin.getUserById(userId);
    if (userError || !user) throw new Error("User not found"); // Validate product ID format (should be a UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      throw new Error(
        `Invalid product ID format. Please use a valid Polar product UUID, not "${productId}"`
      );
    }

    // Ensure we have a valid base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseUrl || baseUrl === "undefined") {
      throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set");
    }

    // Create checkout session
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${baseUrl}/subscribe/success?checkout_id={CHECKOUT_ID}`,

      // Link to your user system
      externalCustomerId: userId,
      customerEmail: user.user.email,
      customerName: user.user.user_metadata?.full_name || user.user.email,

      // Add metadata for tracking
      metadata: {
        user_id: userId,
        source: "web_app",
      },
    });

    return { url: checkout.url, checkout_id: checkout.id };
  } catch (error) {
    console.error("Failed to create checkout:", error);
    throw error;
  }
}

export async function handleCheckoutSuccess(checkoutId: string) {
  try {
    const supabase = await createAdminClient();

    // Get checkout details from Polar
    const checkout = await polar.checkouts.get({ id: checkoutId });

    if (checkout.status !== "succeeded") {
      throw new Error("Checkout not completed");
    }

    // Create or update subscription record
    const { error } = await supabase.from("user_subscriptions").upsert({
      user_id: checkout.externalCustomerId || checkout.metadata?.user_id,
      polar_customer_id: checkout.customerId!,
      polar_checkout_id: checkout.id,
      polar_product_id: checkout.productId!,
      status: "active", // Will be updated by webhooks
      amount: checkout.amount,
      currency: checkout.currency,
      recurring_interval: "month",
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Failed to handle checkout success:", error);
    throw error;
  }
}

export async function getAllUserSubscriptions(userId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data as UserSubscription[] | null, error };
}

export async function getSubscriptionByPolarId(polarSubscriptionId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("polar_subscription_id", polarSubscriptionId)
    .single();

  return { data: data as UserSubscription | null, error };
}

export async function updateSubscriptionStatus(
  polarSubscriptionId: string,
  updates: Partial<UserSubscription>
) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", polarSubscriptionId);

  return { error };
}

export async function getAllUserSubscriptionsForDebug(userId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data as UserSubscription[] | null, error };
}

export async function cleanupDuplicateSubscriptions(userId: string) {
  const supabase = await createAdminClient();

  // Get all subscriptions for the user
  const { data: subscriptions, error: fetchError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (fetchError || !subscriptions || subscriptions.length <= 1) {
    return { error: fetchError, cleaned: 0 };
  }

  // Keep the most recent subscription, mark others as inactive
  const [keepSubscription, ...oldSubscriptions] = subscriptions;

  if (oldSubscriptions.length > 0) {
    const oldIds = oldSubscriptions.map((sub) => sub.id);

    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ status: "inactive_duplicate" })
      .in("id", oldIds);

    return { error: updateError, cleaned: oldSubscriptions.length };
  }

  return { error: null, cleaned: 0 };
}
