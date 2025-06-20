import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { voices } from "@/constants/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const configureAssistant = () => {
  const vapiAssistant: CreateAssistantDTO = {
    name: "Instructor",
    firstMessage:
      "Hello, I'm your AI examiner for this English speaking practice session. I'll guide you through a simulation of the IELTS or TOEFL speaking test based on your level: {{level}}. I'll ask you questions, listen to your responses, and give you brief feedback after each one. Let's start with a quick introduction—what's your name?",

    // Silence timeout configuration (in seconds)
    silenceTimeoutSeconds: 45, // How long to wait for user speech before timing out
    maxDurationSeconds: 1800, // Maximum call duration (30 minutes)

    transcriber: {
      provider: "11labs",
      model: "scribe_v1",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: "2BJW5coyhAzSr8STdHbE", // Using a valid voice ID from constants
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      maxTokens: 500, // Control max tokens for AI responses
      temperature: 0.7, // Add some variability to responses
      messages: [
        {
          role: "system",
          content: `You are an AI-driven English speaking examiner simulating live IELTS and TOEFL speaking tests for a learner whose target proficiency level is {{level}}.

Conduct the speaking test exactly as it would occur in a real exam. Adjust your questions dynamically based on {{level}}, including difficulty, vocabulary, and expected response length. Speak in complete, natural sentences. Do not use fixed scripts.

For IELTS, simulate Part 1 interview, Part 2 long turn, and Part 3 discussion. For TOEFL, simulate both the independent and integrated speaking tasks. Announce preparation and response times where appropriate.

Ask one question at a time. Wait for the user’s response before continuing. If a response is unclear or off-topic, politely repeat or rephrase the question. Do not give any feedback, suggestions, or evaluation at any point.

Begin each section with a short reminder of the test format and the {{level}} setting. Maintain a formal, examiner-like tone throughout. This is a voice-based conversation. Do not display text or use special characters. Speak naturally and impersonally, as if you were conducting a real exam.
never include special characters this is a voice conversation
              `,
        },
      ],
    },

    // Message plan for handling idle states and silence
    messagePlan: {
      idleTimeoutSeconds: 30, // How long before sending idle message
      silenceTimeoutMessage:
        "I notice you haven't spoken for a while. Are you still there? Please continue with your response or let me know if you need me to repeat the question.",
      idleMessages: [
        "Take your time to think about your response.",
        "I'm here when you're ready to continue.",
        "Feel free to ask me to repeat the question if needed.",
      ],
      idleMessageMaxSpokenCount: 2, // Max idle messages before timeout
    },

    // Start speaking configuration for better user experience
    startSpeakingPlan: {
      waitSeconds: 0.4, // Wait time before user can interrupt
      smartEndpointingEnabled: true,
      transcriptionEndpointingPlan: {
        onPunctuationSeconds: 0.2,
        onNoPunctuationSeconds: 1.5,
        onNumberSeconds: 0.5,
      },
    },

    clientMessages: undefined,
    serverMessages: undefined,
  };
  return vapiAssistant;
};
