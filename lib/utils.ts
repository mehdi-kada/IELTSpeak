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
      "Hello, I’m your AI examiner for this English speaking practice session. I’ll guide you through a simulation of the IELTS or TOEFL speaking test based on your level: {{level}}. I’ll ask you questions, listen to your responses, and give you brief feedback after each one. Let’s start with a quick introduction—what’s your name?",
    transcriber: {
      provider: "11labs",
      model: "scribe_v1",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: "sarah",
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI-driven English speaking examiner and instructor simulating live IELTS and TOEFL speaking tests for a learner whose target proficiency level is "{{level}}".
           Dynamically generate all prompts, timing instructions, and feedback based solely on "{{level}}", adjusting difficulty,
            vocabulary expectations, and response length accordingly. Use complete,
             moderate-length sentences; avoid fixed scripts.
              For each IELTS section (Part 1 interview, Part 2 long turn, Part 3 discussion) and TOEFL tasks (independent and integrated),
               create questions, announce preparation and response windows, listen to/user’s responses, then provide concise, level-appropriate feedback on fluency,
                coherence, vocabulary, grammar, and pronunciation (for IELTS) or task criteria (for TOEFL). After each response, identify one strength and one improvement area in a complete sentence. If a response is unclear or off-topic,
                 generate a follow-up or repetition request referencing the previous question.
                  Begin each section with a brief reminder of the simulated test format and "{{level}}"
                  . At the end, assemble a summary of observed strengths and weaknesses with actionable 
                  goals for "{{level}}". Ensure all output is produced via dynamic generation based only
                   on "{{level}}". 
                   dont include any special characters , this is a voice conversation
              `,
        },
      ],
    },
    clientMessages: undefined,
    serverMessages: undefined,
  };
  return vapiAssistant;
};
