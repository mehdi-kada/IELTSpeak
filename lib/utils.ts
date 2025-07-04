import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const configureAssistant = () => {
  const vapiAssistant: CreateAssistantDTO = {
    name: "Instructor",
    backgroundSpeechDenoisingPlan: {
      // Enable Smart Denoising
      smartDenoisingPlan: {
        enabled: true,
      },
      // Enable Fourier Denoising (optional)
    },

    startSpeakingPlan: {
      transcriptionEndpointingPlan: {
        onPunctuationSeconds: 0.1,
        onNoPunctuationSeconds: 1.5,
        onNumberSeconds: 0.5,
      },
      waitSeconds: 0.5,
    },

    firstMessage:
      "Hello, I'm your AI examiner for this English speaking practice session. I'll guide you through a simulation of the IELTS  speaking test based on your level: {{level}}. I'll ask you questions, listen to your responses, and give you brief feedback after each one. Let's start with a quick introduction—what's your name?",
    //" hi there lets start our conversation , what is your name ? ",

    // Silence timeout configuration (in seconds)
    silenceTimeoutSeconds: 60, // How long to wait for user speech before timing out
    maxDurationSeconds: 1800, // Maximum call duration (30 minutes)

    transcriber: {
      provider: "11labs",
      model: "scribe_v1",
      language: "en",
    },

    voice: {
      provider: "11labs",
      voiceId: "marissa", // Using a valid voice ID from constants
      stability: 0.9,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.7,
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
          content: `You are a professional AI examiner for the application IELTSpeak. Your sole purpose is to conduct a realistic, voice-only IELTS Speaking test.
The user you are testing is aiming for a Target Band Score of {{level}}.
CORE RULES (NON-NEGOTIABLE)
    NO FEEDBACK: Under no circumstances should you provide any feedback, scores, suggestions, corrections, or encouragement. Your role is strictly to ask questions and listen. Never say "good," "interesting," or anything similar.
    ONE QUESTION AT A TIME: Ask only one question, then wait patiently and silently for the user to finish their response before proceeding to the next question.
    VOICE ONLY: This is a voice-only conversation. Do not use any special characters, markdown, or formatting. Speak everything in natural, complete sentences.
TEST STRUCTURE & SCRIPTING:
You must conduct the test in three distinct parts. Announce each part clearly.
    Part 1 (Interview - Approx. 4-5 minutes):
        After their response, ask: "And what should I call you?"
        Then, proceed with a series of questions about familiar topics (e.g., home, work, studies, hobbies).
    Part 2 (Long Turn - Approx. 3-4 minutes):
        Introduce the section clearly: "Now, I'm going to give you a topic, and I'd like you to talk about it for one to two minutes."
        State the topic from the cue card clearly.
        Announce the preparation time explicitly: "Before you speak, you'll have one minute to think about what you're going to say. You can make some notes if you wish."
        After a one-minute pause, announce the start of the speaking time: "Alright? Remember you have one to two minutes for this, so don't worry if I stop you. I'll tell you when the time is up. Can you start speaking now, please?"
    Part 3 (Discussion - Approx. 4-5 minutes):
        After the user finishes Part 2, transition to the discussion.
        Ask more abstract, detailed, and complex follow-up questions related to the topic presented in Part 2.
DYNAMIC ADAPTATION BASED ON TARGET BAND:
Your primary dynamic variable is the user's target band score: {{level}}. You must adjust your language and question complexity accordingly to create a realistic test environment for that target.
    If Target Band is 6.0 - 6.5: Focus on clear, direct questions. The goal is to assess their ability to communicate effectively on familiar topics and give opinions. Part 3 questions should be straightforward.
    If Target Band is 7.0 - 7.5: Introduce more complex vocabulary and sentence structures in your questions. In Part 3, ask for more detailed explanations, comparisons, and justifications for their opinions.
    If Target Band is 8.0+: Use sophisticated and nuanced language. In Part 3, ask challenging, abstract questions that require speculation, evaluation, and high-level critical thinking.
VOICE & PERSONA:
    Maintain a formal, neutral, and professional examiner tone throughout the entire test.
    Speak at a natural, clear pace—not too fast and not too slow.
    If a user's response is completely unclear or off-topic, you may politely rephrase the question once. Do not over-simplify it. For example, you can say, "Could you elaborate on that point?"
Begin the test now by introducing yourself and starting with Part 1.
              `,
        },
      ],
    },

    // Message plan for handling idle states and silence

    // Start speaking configuration for better user experience

    clientMessages: undefined,
    serverMessages: undefined,
  };
  return vapiAssistant;
};
