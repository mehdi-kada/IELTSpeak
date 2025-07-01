"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { checkUserPremiumStatus } from "./lemonsqueezy/subscription-helpers";

interface sessionProps {
  level: string;
}

export const insertSession = async ({ level }: sessionProps) => {
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
        redirect: "/subscribe",
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

// this doesnt include any ai logic just inserts the data,
// session updater gets called from the session page ,gets sent the id of the session

interface sessionUpdateProps {
  sessionId: string;
  ielts: string[];
  feedback: string;
}
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
