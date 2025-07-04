"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { checkUserPremiumStatus } from "./lemonsqueezy/subscription-helpers";
import { sessionUpdateProps } from "@/types/types";
import { profileValues } from "@/types/schemas";

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

  const { data: profileData, error: profileDataError } = await supabase
    .from("profiles")
    .select(
      "name, age, gender, hometown, country, occupation, education_level, favorite_subject, hobbies, travel_experience, favorite_food, life_goal"
    )
    .eq("id", user.id)
    .single();
  if (profileDataError) {
    console.log();
    throw new Error(
      "failed to fetch user's info to start the session",
      profileDataError
    );
  }
  // Check for missing fields
  const requiredFields = [
    "name",
    "age",
    "gender",
    "hometown",
    "country",
    "occupation",
    "education_level",
    "favorite_subject",
    "hobbies",
    "travel_experience",
    "favorite_food",
    "life_goal",
  ];

  const isProfileComplete = requiredFields.every(
    (field) =>
      profileData &&
      profileData[field as keyof typeof profileData] !== null &&
      profileData[field as keyof typeof profileData] !== ""
  );
  if (!isProfileComplete) {
    console.log("need to fill out the form for best customization ");
    redirect("/profile?reason=no_data");
  }
  const isPremium = await checkUserPremiumStatus(user?.id);

  if (!isPremium) {
    console.log("user is not prmium");
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .gt("ielts_rating->>overall", 0)
      .order("created_at", { ascending: false });
    console.log(" the sessions are : ", sessions);
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
    console.log("the user is for this profile : ", userId);
    console.log("the data to be inserted is : ", data);
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
