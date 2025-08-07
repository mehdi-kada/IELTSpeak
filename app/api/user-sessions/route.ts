import { checkUserPremiumStatus } from "@/lib/polar/subscription-helpers";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .gt("ielts_rating->>overall", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    if (!sessions) {
      return NextResponse.json({
        success: true,
        sessions: [],
        averageIeltsScore: 0,
      });
    }

    let isPremium =
      sessions.length > 3 ? true : await checkUserPremiumStatus(user.id);

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
    }));

    // calculate average scores :
    const ieltsScores = transformedSessions
      .map((s) => s.ieltsScore)
      .filter((score) => score > 0);

    const fluencyScores = transformedSessions
      .map((f) => f.scores.fluency)
      .filter((f) => f > 0);

    const grammarScores = transformedSessions
      .map((s) => s.scores.grammar)
      .filter((s) => s > 0);

    const vocabScores = transformedSessions
      .map((s) => s.scores.vocabulary)
      .filter((s) => s > 0);

    const pronunciationScores = transformedSessions
      .map((s) => s.scores.pronunciation)
      .filter((s) => s > 0);

    const averageIeltsScore =
      ieltsScores.length > 0
        ? ieltsScores.reduce((sum, score) => sum + score, 0) /
          ieltsScores.length
        : 0;

    const averageFluencyScores =
      fluencyScores.length > 0
        ? fluencyScores.reduce((sum, score) => sum + score, 0) /
          fluencyScores.length
        : 0;

    const averageGrammarScores =
      grammarScores.length > 0
        ? grammarScores.reduce((sum, score) => sum + score, 0) /
          grammarScores.length
        : 0;

    const averagePronunciationScores =
      pronunciationScores.length > 0
        ? pronunciationScores.reduce((sum, score) => sum + score, 0) /
          pronunciationScores.length
        : 0;

    const averageVocabScores =
      vocabScores.length > 0
        ? vocabScores.reduce((sum, score) => sum + score, 0) /
          vocabScores.length
        : 0;

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      totalSessions: transformedSessions.length, // Add this missing field
      averageIeltsScore,
      averageFluency: averageFluencyScores, // Fix property names
      averageGrammar: averageGrammarScores,
      averageVocab: averageVocabScores,
      averagePronunciation: averagePronunciationScores,
      isPremium: isPremium,
    });
  } catch (error) {
    console.log("api error in sessions fetching for user ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
