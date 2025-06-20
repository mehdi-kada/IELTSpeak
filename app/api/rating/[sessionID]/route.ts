// process final transctibts from the user and send the results to database
// used to recieve the vapi transcribts
// uses gemini and send back suggestions

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionID: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionID; // sessionID matches folder name [sessionID]
    const { messages, level } = await req.json();

    console.log("=== API DEBUG ===");
    console.log("Session ID:", sessionId);
    console.log("Messages count:", messages?.length);
    console.log("Level:", level);
    console.log("Raw params:", resolvedParams);
    console.log("================");

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

    // helper function to format conversation for gemini
    const formatCoversation = (
      messages: Array<{ role: string; content: string }>
    ) => {
      return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
    };

    const conversation = formatCoversation(messages);

    const resultPrompt = `
  You are an expert English language assessor specializing in IELTS and TOEFL Speaking evaluations. You will evaluate a conversation between an AI assistant (acting as an examiner) and a user (test taker) based on official IELTS and TOEFL speaking assessment criteria.
  
  **INPUT DATA:**
  - Conversation: ${conversation}
  - Test Level: ${level}
  
  **EVALUATION INSTRUCTIONS:**
  
  Analyze the USER's speaking performance (ignore the ASSISTANT's responses, focus only on what the USER said) based on the following criteria:
  
  **FOR IELTS EVALUATION:**
  1. **Fluency and Coherence** (0-9 scale): Assess speech rate, flow, connected speech, and logical organization
  2. **Lexical Resource** (0-9 scale): Evaluate vocabulary range, accuracy, and appropriateness
  3. **Grammatical Range and Accuracy** (0-9 scale): Analyze grammar complexity, accuracy, and error frequency
  4. **Pronunciation** (0-9 scale): Consider intelligibility, word/sentence stress, and intonation
  5. **Overall Score** (0-9 scale): Weighted average of all criteria
  
  **FOR TOEFL EVALUATION:**
  1. **Delivery** (0-4 scale): Assess clarity, pace, and pronunciation
  2. **Language Use** (0-4 scale): Evaluate grammar and vocabulary usage
  3. **Topic Development** (0-4 scale): Analyze response coherence and idea development
  4. **Overall Score** (0-120 scale): Convert from 0-4 scale criteria to TOEFL total score
  
  **FEEDBACK REQUIREMENTS:**
  - Identify exactly 4 positive aspects of the user's performance
  - Identify exactly 4 areas that need improvement
  - Be specific and constructive in your feedback
  - Base feedback on actual evidence from the conversation
    **OUTPUT FORMAT:**
  Return ONLY a valid JSON object in this exact structure. Do not include any markdown formatting, code blocks, or additional text:

  {
    "ielts_ratings": {
      "fluency": 0.0,
      "grammar": 0.0,
      "vocabulary": 0.0,
      "pronunciation": 0.0,
      "overall": 0.0
    },
    "toefl_ratings": {
      "delivery": 0,
      "language_use": 0,
      "topic_development": 0,
      "overall": 0
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

  **IMPORTANT GUIDELINES:**
  - Use decimal scores for IELTS (e.g., 6.5, 7.0, 7.5)
  - Use integer scores for TOEFL delivery/language_use/topic_development (0-4)
  - Calculate TOEFL overall score: ((delivery + language_use + topic_development) / 3) * 30
  - Be consistent with official IELTS and TOEFL band descriptors
  - Consider the test level when setting expectations
  - Focus only on the USER's responses, not the assistant's questions
  - Provide realistic and fair assessments
  - Ensure feedback is actionable and specific to the conversation content
  - Return ONLY the JSON object without any markdown formatting or code blocks

  Analyze the conversation now and return only the JSON response.
  `; // send the prompt to gemini and get response
    const result = await model.generateContent(resultPrompt);
    const response = await result.response;
    const evaluation = response.text();
    console.log("Raw Gemini response:", evaluation);

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

    console.log("Cleaned response:", cleanedEvaluation);

    let parsedEvaluation;
    try {
      parsedEvaluation = JSON.parse(cleanedEvaluation);
      console.log("Parsed evaluation:", parsedEvaluation);
    } catch (parseError) {
      console.log("failed to parse model response as json : ", parseError);
      parsedEvaluation = {
        rawResponse: evaluation,
        error: "failed to parse structured response",
      };
      return NextResponse.json({
        sessionId,
        messageCount: messages.length,
        level,
        rawResponse: parsedEvaluation,
        processedAt: new Date().toISOString(),
      });
    }

    // Prepare final result
    const finalResult = {
      sessionId,
      messageCount: messages.length,
      level,
      evaluation: parsedEvaluation,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json(finalResult);
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
  // process and save in db
}
