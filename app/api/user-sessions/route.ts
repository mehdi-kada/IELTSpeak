import { createClient } from "@/lib/server";
import { error } from "console";
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
    }

    // fetch all sessions for that user

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    //transform all data for dashboard use
     const transformedSessions = sessions.map((session) => ({
      id: session.id,
      sessionId: session.session_id,
      date: new Date(session.created_at).toLocaleDateString(),
      level: session.level || "Unknown Level",
      overallScore: session.evaluation_data?.overall_score || 0,
      scores: {
        fluency: session.evaluation_data?.fluency?.score || 0,
        vocabulary: session.evaluation_data?.vocabulary?.score || 0,
        grammar: session.evaluation_data?.grammar?.score || 0,
        pronunciation: session.evaluation_data?.pronunciation?.score || 0,
      },
      feedback: {
        positivePoints: session.evaluation_data?.positive_feedback || [],
        improvements: session.evaluation_data?.areas_for_improvement || [],
        specificTips: session.evaluation_data?.specific_tips || [],
      },
      transcript: session.transcript || "",
    }));


  } catch {}
}
