"use server";

import { redirect } from "next/navigation";
import { createClient } from "./server";
import { randomUUID } from "crypto";

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

  const { data: newSession, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select("id")
    .single();

  if (error) {
    console.error("error createing session : ", error);
    throw new Error("error");
  }

  redirect(`/levels/${newSession.id}?level=${level}`);
};

// this doesnt include any ai logic just inserts the data,
// session updater gets called from the session page ,gets sent the id of the session

interface sessionUpdateProps {
  sessionId: string;
  ielts: string[];
  toefl: string[];
  feedback: string;
}
export const updateSession = async ({
  sessionId,
  ielts,
  toefl,
  feedback,
}: sessionUpdateProps) => {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const sessionUpdatetData = {
    ielts_rating: ielts,
    toefl_rating: toefl,
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
