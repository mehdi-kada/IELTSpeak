import { profileValues } from "@/types/schemas";

export const levels = [
  {
    level: "6.5",
    title: "Band 6.5 - Competent User",
    description:
      "Good operational command of English with some inaccuracies and misunderstandings.",
  },
  {
    level: "7",
    title: "Band 7 - Good User",
    description:
      "Operational command of English with occasional inaccuracies and inappropriate usage.",
  },
  {
    level: "7.5",
    title: "Band 7.5 - Good User",
    description:
      "Good operational command with occasional inaccuracies in unfamiliar situations.",
  },
  {
    level: "8",
    title: "Band 8 - Very Good User",
    description:
      "Very good command of English with only occasional unsystematic inaccuracies.",
  },
  {
    level: "8.5",
    title: "Band 8.5 - Very Good User",
    description:
      "Very good command with only occasional inaccuracies and inappropriate usage.",
  },
  {
    level: "9",
    title: "Band 9 - Expert User",
    description:
      "Fully operational command of English with complete accuracy and fluency.",
  },
];

export const navItems = [
  { name: "Levels", href: "/levels" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Upgrade", href: "/subscribe" },
];

export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const geminiPrompt = (
  level: string | null,
  message: string,
  profileData: profileValues | null,
  suggestions: string[]
) => {
  const previousSuggestions =
    suggestions && suggestions.length > 0
      ? `Previous suggestions you provided (do not repeat these, and if the question is similar, provide a new angle or politely mention it was already answered. If the previous answer was cutoff, continue it smoothly): ${suggestions.join(" | ")}`
      : "This is the first suggestion - no previous responses to avoid.";

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
User Profile Context:
    Name: ${profileData?.name || "Not provided"}
    Age: ${profileData?.age || "Not provided"}
    Country: ${profileData?.country || "Not provided"}
    Hometown: ${profileData?.hometown || "Not provided"}
    Education: ${profileData?.education_level || "Not provided"}
    Occupation: ${profileData?.occupation || "Not provided"}
    Hobbies: ${profileData?.hobbies?.join(", ") || "Not provided"}
    Travel Experience: ${profileData?.travel_experience || "Not provided"}
    Favorite Food: ${profileData?.favorite_food || "Not provided"}
    Life Goals: ${profileData?.life_goal || "Not provided"}

    start you are answers formally, dont answer with " greate question " or "intersting question" or anything like that 
    only include the required info for the answer dont try to fit them all in one answer , and keep the answer short unless the examner prompts you to talk for 1 or 2 mins then you can make the lenght of the answer fit
  `;
};

export const hobbyOptions = [
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
];

export const educationLevels = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

export const genders = ["Male", "Female", "Other"];

export const requiredFields = [
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
];
