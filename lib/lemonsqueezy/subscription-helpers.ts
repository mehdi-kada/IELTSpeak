// for database operations

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// get the user subscription details
const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
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
