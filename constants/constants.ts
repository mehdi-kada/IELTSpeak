import { profileValues } from "@/types/schemas";

/**
 * Application constants with proper typing and organization
 */

// IELTS Band Levels Configuration
export interface IELTSLevel {
  level: string;
  title: string;
  description: string;
  numericValue: number;
}

export const levels: readonly IELTSLevel[] = [
  {
    level: "6.5",
    title: "Band 6.5 - Competent User",
    description: "Good operational command of English with some inaccuracies and misunderstandings.",
    numericValue: 6.5,
  },
  {
    level: "7",
    title: "Band 7 - Good User", 
    description: "Operational command of English with occasional inaccuracies and inappropriate usage.",
    numericValue: 7.0,
  },
  {
    level: "7.5",
    title: "Band 7.5 - Good User",
    description: "Good operational command with occasional inaccuracies in unfamiliar situations.",
    numericValue: 7.5,
  },
  {
    level: "8",
    title: "Band 8 - Very Good User",
    description: "Very good command of English with only occasional unsystematic inaccuracies.",
    numericValue: 8.0,
  },
  {
    level: "8.5",
    title: "Band 8.5 - Very Good User",
    description: "Very good command with only occasional inaccuracies and inappropriate usage.",
    numericValue: 8.5,
  },
  {
    level: "9",
    title: "Band 9 - Expert User",
    description: "Fully operational command of English with complete accuracy and fluency.",
    numericValue: 9.0,
  },
] as const;

// Navigation Configuration
export interface NavItem {
  name: string;
  href: string;
  authRequired?: boolean;
}

export const navItems: readonly NavItem[] = [
  { name: "Levels", href: "/levels", authRequired: true },
  { name: "Dashboard", href: "/dashboard", authRequired: true },
  { name: "Upgrade", href: "/subscribe", authRequired: false },
] as const;

// Voice Configuration
export interface VoiceConfig {
  male: {
    casual: string;
    formal: string;
  };
  female: {
    casual: string;
    formal: string;
  };
}

export const voices: VoiceConfig = {
  male: { 
    casual: "2BJW5coyhAzSr8STdHbE", 
    formal: "c6SfcYrb2t09NHXiT80T" 
  },
  female: { 
    casual: "ZIlrSGI4jZqobxRKprJz", 
    formal: "sarah" 
  },
} as const;

// User Profile Configuration
export type HobbyOption = 
  | "reading"
  | "watching movies"
  | "cooking"
  | "traveling"
  | "sports"
  | "music"
  | "gaming"
  | "photography"
  | "writing"
  | "drawing"
  | "dancing"
  | "swimming";

export const hobbyOptions: readonly HobbyOption[] = [
  "reading",
  "watching movies",
  "cooking",
  "traveling",
  "sports",
  "music",
  "gaming",
  "photography",
  "writing",
  "drawing",
  "dancing",
  "swimming",
] as const;

export type EducationLevel = 
  | "High School"
  | "Bachelor's"
  | "Master's"
  | "PhD"
  | "Other";

export const educationLevels: readonly EducationLevel[] = [
  "High School",
  "Bachelor's",
  "Master's",
  "PhD",
  "Other",
] as const;

export type Gender = "Male" | "Female" | "Other";

export const genders: readonly Gender[] = [
  "Male", 
  "Female", 
  "Other"
] as const;

// Required profile fields for session creation
export const requiredFields: readonly (keyof profileValues)[] = [
  "name",
  "age",
  "gender",
  "hometown",
  "country",
  "occupation",
  "education_level",
  "favorite_subject",
  "hobbies",
  "travel_experience",
  "favorite_food",
  "life_goal",
] as const;

// Application Limits and Configuration
export const APP_LIMITS = {
  FREE_SESSION_LIMIT: 3,
  MAX_SESSION_DURATION_MINUTES: 15,
  MIN_CONVERSATION_LENGTH: 2,
  MAX_SUGGESTION_HISTORY: 10,
} as const;

// Prompt Templates
export interface GeminiPromptParams {
  level: string | null;
  message: string;
  profileData: profileValues | null;
  suggestions: string[];
}

/**
 * Creates a structured prompt for Gemini AI suggestions
 * Provides context-aware responses based on user profile and history
 */
export const createGeminiPrompt = ({
  level,
  message,
  profileData,
  suggestions,
}: GeminiPromptParams): string => {
  const previousSuggestions =
    suggestions && suggestions.length > 0
      ? `Previous suggestions you provided (do not repeat these, and if the question is similar, provide a new angle or politely mention it was already answered. If the previous answer was cutoff, continue it smoothly): ${suggestions.join(" | ")}`
      : "This is the first suggestion - no previous responses to avoid.";

  const profileContext = profileData
    ? `User Profile Context:
    Name: ${profileData.name || "Not provided"}
    Age: ${profileData.age || "Not provided"}
    Country: ${profileData.country || "Not provided"}
    Hometown: ${profileData.hometown || "Not provided"}
    Education: ${profileData.education_level || "Not provided"}
    Occupation: ${profileData.occupation || "Not provided"}
    Hobbies: ${profileData.hobbies?.join(", ") || "Not provided"}
    Travel Experience: ${profileData.travel_experience || "Not provided"}
    Favorite Food: ${profileData.favorite_food || "Not provided"}
    Life Goals: ${profileData.life_goal || "Not provided"}`
    : "No profile data available.";

  return `
You are an AI assistant for the app IELTSpeak. Your task is to help a user prepare for their IELTS speaking test by generating a spoken answer as if you are the user.
    The user's target band score is ${level}.
    The examiner's question is: "${message}"
${previousSuggestions}

Instructions:
    The questions are asked by another AI and it can make mistakes, ask repetitive questions, or sometimes cut off your previous answer. Handle these gracefully:
    - If the question is a repeat, do not repeat your previous answer. Instead, provide a new perspective or politely mention you have already answered it.
    - If your previous answer was cutoff, continue it naturally and smoothly.
    - If the question is unclear or seems like a mistake, answer as best as possible or ask for clarification in a natural way.
    Answer Naturally and Concisely: Give a clear and natural response that fits the IELTS speaking style for band ${level}. Avoid long or overly detailed answers unless the question requires it.
    Only Include Relevant Personal Info: Use the User Profile Context only if it directly relates to the question. Never force unrelated details into the answer.
    Language Quality: Use vocabulary, sentence structures, and linking words that reflect the target band. Keep it polite, fluent, and appropriate.
    Strict Output Format: Output only the spoken answer. No extra explanations, labels, greetings, or quotation marks.

${profileContext}

Guidelines:
    - Start your answers formally, don't answer with "great question" or "interesting question" or anything like that
    - Only include the required info for the answer, don't try to fit them all in one answer
    - Keep the answer short unless the examiner prompts you to talk for 1 or 2 minutes, then adjust the length accordingly
  `;
};

// Deprecated: Keep for backward compatibility, but mark as deprecated
/** @deprecated Use createGeminiPrompt instead */
export const geminiPrompt = (
  level: string | null,
  message: string,
  profileData: profileValues | null,
  suggestions: string[]
): string => {
  return createGeminiPrompt({ level, message, profileData, suggestions });
};
