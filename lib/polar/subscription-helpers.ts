
import { createClient } from "@supabase/supabase-js";
import { polar } from "./polar";
import { SubscriptionSchema } from "@/types/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use to surpass row level security
);

export interface PolarSubscriptionData {
  user_id: string;
  polar_subscription_id: string;
  polar_customer_id: string;
  status: "active" | "cancelled" | "expired" | "on_trial" | "paused" | "unpaid";
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  renews_at: string;
}

export const getUserSubscription = async (userId: string | null) : Promise<SubscriptionSchema | null>=> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1) 
      .single();

    if (error || !data) {
      console.error("error while fetching user subscriptions details");
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    return null;
  }
};

export const upsertSubscription = async (
  subscriptionData: PolarSubscriptionData
): Promise<Boolean | null> => {
  try {
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "polar_subscription_id",
      });

    if (subscriptionError) {
      console.error("error when upserting subscription data ", subscriptionError);
      return false;
    }

    const premiumStatus =
      subscriptionData.status === "active" ||
      subscriptionData.status === "cancelled";
    const premiumUpdateSuccess = await updateUserStatus(
      subscriptionData.user_id,
      premiumStatus
    );
    if (!premiumUpdateSuccess) {
      console.error("failed to update user's status");
      return false;
    }
    return true;
  } catch (error) {
    console.error(" Error in upsertSubscription:", error);
    return false;
  }
};


export const updateUserStatus = async (
  userId: string,
  isPremium: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: isPremium,
      })
      .eq("id", userId);
    if (error) {
      console.log("error when updating the user's premium status : ", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("error when updating user status", error);
    return false;
  }
};


export const cancelSubFromDB = async (
  subscriptionId: string
): Promise<Boolean> => {
  try {

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscriptionId)
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

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .in("status", ["cancelled"]) 
      .gt("current_period_end", new Date().toISOString()) 
      .single();

    if (subError || !subscription) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in checkUserPremiumStatus:", error);
    return false;
  }
}



