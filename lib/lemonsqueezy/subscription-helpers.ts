// for database operations

import { SubscriptionData } from "@/types/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use to surpass row level security
);

// get the user subscription details
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1) // get most recent sub
      .single();

    if (error || !data) {
      console.error("error while fetching user subscriptions details");
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
  }
};

export const upsertSubscription = async (
  subscriptionData: SubscriptionData
): Promise<Boolean | null> => {
  try {
    // isnert the webhook payload to database
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "lemonsqueezy_subscription_id",
      });

    if (subscriptionError) {
      console.error("error when upserting subscription data ");
      return false;
    }

    // update the user's profile premuim status
    // customer subscription status from lemon to verify that sub is ineed active
    const premuimStatus =
      subscriptionData.status === "active" ||
      subscriptionData.status === "cancelled";
    const premuimUpdateSusccess = await updateUserStatus(
      subscriptionData.user_id,
      premuimStatus
    );
    if (!premuimUpdateSusccess) {
      console.error("failed to update user's status");
      return false;
    }
    return true;
  } catch (error) {
    console.error(" Error in upsertSubscription:", error);
    return false;
  }
};

// update the user premuim status in profiles table
export const updateUserStatus = async (
  userId: string,
  isPremuim: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: isPremuim,
      })
      .eq("id", userId);
    if (error) {
      console.log("error when updating the user's premium status : ", error);
    }
    return true;
  } catch (error) {
    console.error("error when updataing user status");
    return false;
  }
};

// cancel subscription from db
export const cancelSubFromDB = async (
  subscriptionId: string
): Promise<Boolean> => {
  try {
    // update the database
    console.log("canceling subscription from DB with id : ", subscriptionId);
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("lemonsqueezy_subscription_id", subscriptionId)
      .select("user_id")
      .single();

    if (error || !data) {
      console.error("error while canceling sub from database : ", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in cancelSubscriptionInDB:", error);
    return false;
  }
};

// check user's premium status
export async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking premium status:", error);
      return false;
    }

    if (data.is_premium) {
      return true;
    }

    // If profile says not premium, check if they have a cancelled subscription
    // that's still valid until period end
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .in("status", ["cancelled"]) // Only check cancelled subs
      .gt("current_period_end", new Date().toISOString()) // Still valid
      .single();

    if (subError || !subscription) {
      return false;
    }

    // They have a cancelled subscription that's still valid
    return true;
  } catch (error) {
    console.error("Error in checkUserPremiumStatus:", error);
    return false;
  }
}
