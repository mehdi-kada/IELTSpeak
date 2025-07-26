"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { checkUserPremiumStatus } from "./polar/subscription-helpers";
import { sessionUpdateProps } from "@/types/types";
import { profileValues } from "@/types/schemas";
import { requiredFields } from "@/constants/constants";

export const insertSession = async ({ level }: { level: string }) => {
  // get the user id insert it , return the session id for future update and redirect

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionData = {
    level: level as string,
    user_id: user?.id,
  };

  if (!user) redirect("/auth/login");

  const isPremium = await checkUserPremiumStatus(user?.id);

  if (!isPremium) {
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .gt("ielts_rating->>overall", 0)
      .order("created_at", { ascending: false });
    if (error) {
      console.log();
      throw new Error(
        " error when fetching data from db for premium status check in actions ",
        error
      );
    }
    if (sessions?.length >= 3) {
      console.log("limit reached , redirecting : ");
      return {
        redirect: "/subscribe?reason=limit-hit",
        reason: "limit_reached",
      };
    }
  }

  const { data: newSession, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select("id")
    .single();

  if (error) {
    console.error("error createing session : ", error);
    throw new Error("error");
  }

  // Return the session data instead of redirecting
  return {
    sessionId: newSession.id,
    redirectUrl: `/levels/${newSession.id}?level=${level}`,
  };
};

export const updateSession = async ({
  sessionId,
  ielts,
  feedback,
}: sessionUpdateProps) => {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const sessionUpdatetData = {
    ielts_rating: ielts,
    feedback: feedback,
  };

  const { data: updatedData, error } = await supabase
    .from("sessions")
    .update(sessionUpdatetData)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("error createing session : ", error);
    throw new Error("error");
  }

  return updatedData;
};

export const insertProfileData = async (
  data: profileValues,
  userId: string
) => {
  try {
    const profileData = { id: userId, ...data };

    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert(profileData);

    if (error) {
      console.log(
        "error when inserting profile data to the db : ",
        error.message
      );
      throw new Error("error : ", error);
    }
  } catch (error) {
    console.log("error inserting data action");
  }
};

export const fetchUserProfileData = async (
  userId: string
): Promise<profileValues | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(requiredFields.join(","))
      .eq("id", userId)
      .single();

    if (error) {
      // If no rows found, return null instead of throwing
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Database error fetching profile:", error.message);
      return null;
    }

    // Ensure we have valid data before returning
    if (!data) {
      return null;
    }

    return data as unknown as profileValues;
  } catch (error) {
    console.error("Error fetching profile data from database:", error);
    return null;
  }
};
