import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // create supabase client
    const supabase = await createClient();

    // get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } // fetch all sessions for that user

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Handle case where sessions is null or empty
    if (!sessions) {
      return NextResponse.json({
        success: true,
        sessions: [],
        averageIeltsScore: 0,
      });
    }

    //transform all data for dashboard use
    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      date: new Date(session.created_at).toLocaleDateString(),
      level: session.level || "Unknown Level",
      ieltsScore: session.ielts_rating?.overall || 0,
      scores: {
        // IELTS scores
        fluency: session.ielts_rating?.fluency || 0,
        grammar: session.ielts_rating?.grammar || 0,
        vocabulary: session.ielts_rating?.vocabulary || 0,
        pronunciation: session.ielts_rating?.pronunciation || 0,
      },
      feedback: {
        positivePoints: session.feedback?.positives || [],
        negativePoints: session.feedback?.negatives || [],
      },
    })); // calculate average scores :
    const ieltsScores = transformedSessions
      .map((s) => s.ieltsScore)
      .filter((score) => score > 0);

    const averageIeltsScore =
      ieltsScores.length > 0
        ? ieltsScores.reduce((sum, score) => sum + score, 0) /
          ieltsScores.length
        : 0;
    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      averageIeltsScore,
    });
  } catch (error) {
    console.log("api error in sessions fetching for user ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
