import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { logger } from "@/lib/logger";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Constants for better maintainability
const ASSISTANT_CONFIG = {
  NAME: "Instructor",
  VOICE_ID: "aTbnroHRGIomiKpqAQR8",
  MODEL: "gpt-4o",
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  SILENCE_TIMEOUT_SECONDS: 120,
  MAX_DURATION_SECONDS: 900,
  VOICE_SPEED: 0.9,
  VOICE_STABILITY: 0.4,
  VOICE_SIMILARITY_BOOST: 0.2,
} as const;

const TRANSCRIPTION_CONFIG = {
  ON_PUNCTUATION_SECONDS: 0.5,
  ON_NO_PUNCTUATION_SECONDS: 0.8,
  ON_NUMBER_SECONDS: 0.3,
  WAIT_SECONDS: 1,
} as const;

/**
 * Configures the VAPI assistant with proper error handling and type safety
 * @param level - The target IELTS band level for the user
 * @returns Configured assistant object
 */
export const configureAssistant = (level?: string): CreateAssistantDTO => {
  try {
    logger.debug("Configuring VAPI assistant", { level });

    const vapiAssistant: CreateAssistantDTO = {
      name: ASSISTANT_CONFIG.NAME,
      backgroundSpeechDenoisingPlan: {
        smartDenoisingPlan: {
          enabled: true,
        },
      },
      startSpeakingPlan: {
        transcriptionEndpointingPlan: {
          onPunctuationSeconds: TRANSCRIPTION_CONFIG.ON_PUNCTUATION_SECONDS,
          onNoPunctuationSeconds: TRANSCRIPTION_CONFIG.ON_NO_PUNCTUATION_SECONDS,
          onNumberSeconds: TRANSCRIPTION_CONFIG.ON_NUMBER_SECONDS,
        },
        waitSeconds: TRANSCRIPTION_CONFIG.WAIT_SECONDS,
      },

      firstMessage: createFirstMessage(level),

      silenceTimeoutSeconds: ASSISTANT_CONFIG.SILENCE_TIMEOUT_SECONDS,
      maxDurationSeconds: ASSISTANT_CONFIG.MAX_DURATION_SECONDS,

      transcriber: {
        provider: "11labs",
        model: "scribe_v1",
        language: "en",
      },

      voice: {
        provider: "11labs",
        voiceId: ASSISTANT_CONFIG.VOICE_ID,
        speed: ASSISTANT_CONFIG.VOICE_SPEED,
        stability: ASSISTANT_CONFIG.VOICE_STABILITY,
        similarityBoost: ASSISTANT_CONFIG.VOICE_SIMILARITY_BOOST,
      },
      
      model: {
        provider: "openai",
        model: ASSISTANT_CONFIG.MODEL,
        maxTokens: ASSISTANT_CONFIG.MAX_TOKENS,
        temperature: ASSISTANT_CONFIG.TEMPERATURE,
        messages: [
          {
            role: "system",
            content: createSystemPrompt(level),
          },
        ],
      },

      clientMessages: undefined,
      serverMessages: undefined,
    };

    logger.debug("VAPI assistant configured successfully", { level, assistantName: ASSISTANT_CONFIG.NAME });
    return vapiAssistant;
  } catch (error) {
    logger.error("Failed to configure VAPI assistant", error, { level });
    throw new Error("Assistant configuration failed");
  }
};

/**
 * Creates the first message for the assistant based on the user's level
 */
function createFirstMessage(level?: string): string {
  const levelText = level ? `based on your level: ${level}` : "";
  return `Hello, I'm your AI examiner for this English speaking practice session. I'll guide you through a simulation of the International English Language speaking test ${levelText}. I'll ask you questions and listen to your responses. Let's start with a quick introduction—what's your name?`;
}

/**
 * Creates the system prompt for the assistant
 */
function createSystemPrompt(level?: string): string {
  const levelInstruction = level ? `The user you are testing is aiming for a Target Band Score of ${level}.` : "";
  
  return `You are a professional AI examiner for the application IELTSpeak. Your sole purpose is to conduct a realistic, voice-only IELTS Speaking test.
${levelInstruction}

CORE RULES (NON-NEGOTIABLE)
    NO FEEDBACK: Under no circumstances should you provide any feedback, scores, suggestions, corrections, or encouragement. Your role is strictly to ask questions and listen. Never say "good," "interesting," or anything similar.
    ONE QUESTION AT A TIME: Ask only one question, then wait patiently and silently for the user to finish their response before proceeding to the next question.
    VOICE ONLY: This is a voice-only conversation. Do not use any special characters, markdown, or formatting. Speak everything in natural, complete sentences.

TEST STRUCTURE & SCRIPTING:
You must conduct the test in three distinct parts. Announce each part clearly.
    Part 1 (Interview - Approx. 4-5 minutes):
        Then, proceed with a series of questions about familiar topics (4 questions).
    Part 2 (Long Turn - Approx. 3-4 minutes):
        Introduce the section clearly: "Now, I'm going to give you a topic, and I'd like you to talk about it for one to two minutes."
        Announce the preparation time explicitly
    Part 3 (Discussion - Approx. 4-5 minutes):
        After the user finishes Part 2, transition to the discussion.
        Ask more abstract, detailed, and complex follow-up questions related to the topic presented in Part 2.

DYNAMIC ADAPTATION BASED ON TARGET BAND:
Your primary dynamic variable is the user's target band score${level ? `: ${level}` : ""}. You must adjust your language and question complexity accordingly to create a realistic test environment for that target.
    If Target Band is 6.0 - 6.5: Focus on clear, direct questions. The goal is to assess their ability to communicate effectively on familiar topics and give opinions. Part 3 questions should be straightforward.
    If Target Band is 7.0 - 7.5: Introduce more complex vocabulary and sentence structures in your questions. In Part 3, ask for more detailed explanations, comparisons, and justifications for their opinions.
    If Target Band is 8.0+: Use sophisticated and nuanced language. In Part 3, ask challenging, abstract questions that require speculation, evaluation, and high-level critical thinking.

VOICE & PERSONA:
    Maintain a formal, neutral, and professional examiner tone throughout the entire test.
    If a user's response is completely unclear or off-topic, you may politely rephrase the question once. Do not over-simplify it.

Begin the test now by introducing yourself and starting with Part 1.`;
}
