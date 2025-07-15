/**
 * API route for processing IELTS speaking evaluation
 * Receives conversation transcripts from VAPI and returns AI-generated ratings using Gemini
 */

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createErrorResponse, AppError, handleDatabaseError } from "@/lib/error-handling";
import { ratingRequestSchema, sessionIdSchema, validateEnv } from "@/lib/validation";

// Initialize Gemini AI with environment validation
let genAi: GoogleGenerativeAI;
let model: any;

try {
  const env = validateEnv();
  genAi = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
  model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
} catch (error) {
  logger.error("Failed to initialize Gemini AI", error);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionID: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionID;

    // Validate session ID format
    const sessionIdValidation = sessionIdSchema.safeParse(sessionId);
    if (!sessionIdValidation.success) {
      throw new AppError("Invalid session ID format", 400, "INVALID_SESSION_ID");
    }

    // Parse and validate request body
    const body = await req.json();
    const requestValidation = ratingRequestSchema.safeParse(body);
    
    if (!requestValidation.success) {
      const errorMessage = requestValidation.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new AppError(`Request validation failed: ${errorMessage}`, 400, "VALIDATION_ERROR");
    }

    const { messages, level } = requestValidation.data;

    // Check if AI model is initialized
    if (!model) {
      throw new AppError("AI service not available", 503, "AI_SERVICE_UNAVAILABLE");
    }

    logger.info("Processing IELTS evaluation", { sessionId, level, messageCount: messages.length });

    // Format conversation for Gemini AI
    const formatConversation = (
      messages: Array<{ role: string; content: string }>
    ): string => {
      return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
    };

    const conversation = formatConversation(messages);

    // Generate evaluation using Gemini AI
    const resultPrompt = createEvaluationPrompt(conversation);
    
    logger.debug("Sending request to Gemini AI", { sessionId, promptLength: resultPrompt.length });
    
    const result = await model.generateContent(resultPrompt);
    const response = await result.response;
    const evaluation = response.text();

    logger.debug("Received response from Gemini AI", { sessionId, responseLength: evaluation.length });

    // Clean and parse the AI response
    const parsedEvaluation = parseAIResponse(evaluation);

    // Update session in database
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("sessions")
      .update({
        ielts_rating: parsedEvaluation.ielts_ratings,
        feedback: parsedEvaluation.feedback,
      })
      .eq("id", sessionId)
      .single();

    if (dbError) {
      throw handleDatabaseError(dbError, "session rating update");
    }

    logger.info("Successfully processed IELTS evaluation", { sessionId, level });

    return NextResponse.json({
      evaluation: parsedEvaluation,
      level: level,
      sessionId: sessionId,
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to process IELTS evaluation");
  }
}

/**
 * Creates the evaluation prompt for Gemini AI
 */
function createEvaluationPrompt(conversation: string): string {
  return `
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
    if the conversation is too small for evaluation, don't restrain from giving bad scores,
    You must adhere strictly to the official IELTS band descriptors.
    the feedback must be like you are talking to the user directly, using "you"
    Use decimal scores rounded to the nearest half-band (e.g., 6.0, 6.5, 7.0).
    Consider the provided Test band Level when setting expectations for the user's performance.
    Focus only on the USER's responses, not the assistant's questions.
    Provide realistic, fair, and actionable assessments.
    Return ONLY the JSON object without any introductory text, markdown, or explanations.

Analyze the conversation now and return only the JSON response.
  `;
}

/**
 * Parses and validates the AI response
 */
function parseAIResponse(evaluation: string) {
  // Clean the response by removing markdown code blocks
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

  try {
    const parsedEvaluation = JSON.parse(cleanedEvaluation);
    
    // Validate the structure of the parsed response
    if (!parsedEvaluation.ielts_ratings || !parsedEvaluation.feedback) {
      throw new AppError("Invalid AI response structure", 500, "INVALID_AI_RESPONSE");
    }
    
    return parsedEvaluation;
  } catch (parseError) {
    logger.error("Failed to parse AI response as JSON", parseError, { rawResponse: evaluation });
    throw new AppError("AI response parsing failed", 500, "AI_RESPONSE_PARSE_ERROR");
  }
}
