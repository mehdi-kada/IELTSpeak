import { levels } from "@/constants/constants";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ sessionID: string }>;
  }
) {
  const { sessionID } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("ielts_rating ,toefl_rating,feedback,level")
      .eq("id", sessionID)
      .single();

    if (error) {
      console.log("database error when fetchig session for rating ");
      return NextResponse.json(
        { error: "session not found ", details: error.message },
        { status: 500 }
      );
    }

    // transform it to match the frontend
    const result = {
      sessionID: sessionID,
      level: data.level,
      evaluation: {
        ielts_ratings: data.ielts_rating,
        toefl_ratings: data.toefl_rating,
        feedback: data.feedback,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "something went wrong" },
      { status: 500 }
    );
  }
}
