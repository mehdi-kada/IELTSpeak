import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role key for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SubscriptionData {
  user_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  status: "active" | "cancelled" | "expired" | "on_trial" | "paused" | "unpaid";
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  renews_at: string;
}

/**
 * Creates or updates a subscription in the database
 */
export async function upsertSubscription(
  subscriptionData: SubscriptionData
): Promise<boolean> {
  console.log(
    "💾 Starting subscription upsert for user:",
    subscriptionData.user_id
  );
  console.log("📊 Subscription data:", subscriptionData);

  try {
    // Check if Supabase admin client is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
      return false;
    }

    console.log("🔧 Attempting database upsert...");

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "lemonsqueezy_subscription_id",
      });

    if (error) {
      console.error("❌ Error upserting subscription:", error);
      return false;
    }

    console.log("✅ Subscription upserted successfully");

    // Update user's premium status
    console.log("🏆 Updating user premium status...");
    const premiumStatus = subscriptionData.status === "active";
    console.log("🎯 Setting premium status to:", premiumStatus);

    const premiumUpdateSuccess = await updateUserPremiumStatus(
      subscriptionData.user_id,
      premiumStatus
    );

    if (!premiumUpdateSuccess) {
      console.error("❌ Failed to update premium status");
      return false;
    }

    console.log("✅ Premium status updated successfully");
    return true;
  } catch (error) {
    console.error("💥 Error in upsertSubscription:", error);
    return false;
  }
}

/**
 * Gets a user's active subscription
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error getting user subscription:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    return null;
  }
}

/**
 * Updates user's premium status in the profiles table
 */
export async function updateUserPremiumStatus(
  userId: string,
  isPremium: boolean
): Promise<boolean> {
  console.log("👤 Updating premium status for user:", userId, "to:", isPremium);

  try {
    // First, let's check if the user exists in profiles
    console.log("🔍 Checking if user profile exists...");
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("📋 Existing profile:", existingProfile);

    console.log("💾 Upserting profile...");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          is_premium: isPremium,
        },
        {
          onConflict: "id",
        }
      )
      .select();

    if (error) {
      console.error("❌ Error updating user premium status:", error);
      console.error("Error details:", error.message, error.code, error.details);
      return false;
    }

    console.log("✅ Profile upsert successful:", data);

    // Verify the update worked
    const { data: updatedProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("🔍 Updated profile verification:", updatedProfile);

    return true;
  } catch (error) {
    console.error("💥 Error in updateUserPremiumStatus:", error);
    return false;
  }
}

/**
 * Cancels a subscription in the database
 */
export async function cancelSubscriptionInDB(
  subscriptionId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("lemonsqueezy_subscription_id", subscriptionId)
      .select("user_id")
      .single();

    if (error) {
      console.error("Error cancelling subscription in DB:", error);
      return false;
    }

    // Update user's premium status
    if (data?.user_id) {
      await updateUserPremiumStatus(data.user_id, false);
    }

    return true;
  } catch (error) {
    console.error("Error in cancelSubscriptionInDB:", error);
    return false;
  }
}

/**
 * Checks if a user has an active subscription
 */
export async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking premium status:", error);
      return false;
    }

    return data?.is_premium || false;
  } catch (error) {
    console.error("Error in checkUserPremiumStatus:", error);
    return false;
  }
}
