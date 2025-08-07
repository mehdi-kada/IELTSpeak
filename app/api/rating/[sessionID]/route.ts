
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionID: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionID;
    const { messages, level } = await req.json();

    //validate the request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    const formatCoversation = (
      messages: Array<{ role: string; content: string }>
    ) => {
      return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
    };

    const conversation = formatCoversation(messages);

    const resultPrompt = `
You are an expert English language assessor specializing in IELTS Speaking evaluations. You will evaluate a conversation between an AI assistant (acting as an examiner) and a user (test taker) based on the official IELTS speaking assessment criteria.
INPUT DATA:
    Conversation: ${conversation}
EVALUATION INSTRUCTIONS:
Analyze the USER's speaking performance (ignore the ASSISTANT's responses, focus only on what the USER said) based on the following official IELTS criteria:
    Fluency and Coherence (0-9 scale): Assess speech rate, flow, use of cohesive devices, and logical organization of ideas.
    Lexical Resource (0-9 scale): Evaluate the range, accuracy, and appropriateness of the vocabulary used. Note any use of idiomatic language or less common words.
    Grammatical Range and Accuracy (0-9 scale): Analyze the complexity of sentence structures, accuracy of grammar, and frequency of errors.
    Pronunciation (0-9 scale): Consider overall intelligibility, individual sounds, word/sentence stress, and intonation patterns.
    Overall Band Score (0-9 scale): Provide a holistic, realistic band score based on the four criteria.
FEEDBACK REQUIREMENTS:
    Provide specific, constructive feedback based on actual evidence from the conversation.
    Identify exactly 3-4 positive aspects of the user's performance.
    Identify exactly 3-4 areas that need improvement, providing actionable advice.
OUTPUT FORMAT:
Return ONLY a valid JSON object in this exact structure. Do not include any markdown formatting, code blocks, or additional text:
  {
    "ielts_ratings": {
      "fluency": 0.0,
      "grammar": 0.0,
      "vocabulary": 0.0,
      "pronunciation": 0.0,
      "overall": 0.0
    },
    "feedback": {
      "positives": [
        "Specific positive aspect 1",
        "Specific positive aspect 2", 
        "Specific positive aspect 3",
        "Specific positive aspect 4"
      ],
      "negatives": [
        "Specific area for improvement 1",
        "Specific area for improvement 2",
        "Specific area for improvement 3", 
        "Specific area for improvement 4"
      ]
    }
  }
  IMPORTANT GUIDELINES:
    if the conversation is too small for evaluation , dont restrain from giving bad scores ,
    You must adhere strictly to the official IELTS band descriptors.
    the feedback must be like you are talking to the user directly , using "you"
    Use decimal scores rounded to the nearest half-band (e.g., 6.0, 6.5, 7.0).
    Consider the provided Test band Level when setting expectations for the user's performance.
    Focus only on the USER's responses, not the assistant's questions.
    Provide realistic, fair, and actionable assessments.
    Return ONLY the JSON object without any introductory text, markdown, or explanations.
Analyze the conversation now and return only the JSON response.
  `;

    const result = await model.generateContent(resultPrompt);
    const response = await result.response;
    const evaluation = response.text();

    let cleanedEvaluation = evaluation.trim();
    if (cleanedEvaluation.includes("```json")) {
      cleanedEvaluation = cleanedEvaluation
        .replace(/```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedEvaluation.includes("```")) {
      cleanedEvaluation = cleanedEvaluation
        .replace(/```\s*/, "")
        .replace(/\s*```$/, "");
    }

    let parsedEvaluation;
    try {
      parsedEvaluation = JSON.parse(cleanedEvaluation);
    } catch (parseError) {
      console.log("failed to parse model response as json : ", parseError);
      parsedEvaluation = {
        rawResponse: evaluation,
        error: "failed to parse structured response",
      };
      return NextResponse.json({
        sessionId,
        level,
        rawResponse: parsedEvaluation,
        processedAt: new Date().toISOString(),
      });
    }

    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("sessions")
      .update({
        ielts_rating: parsedEvaluation.ielts_ratings,
        feedback: parsedEvaluation.feedback,
      })
      .eq("id", sessionId)
      .single();

    if (dbError) {
      throw new Error("error in session updating with ratings ", dbError);
    }
    return NextResponse.json({
      evaluation: parsedEvaluation,
      level: level,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Error processing with model : ", error);
    return NextResponse.json(
      {
        error: "failed to process with model",
        details: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}
