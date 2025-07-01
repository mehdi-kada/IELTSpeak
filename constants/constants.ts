import { profileValues } from "@/types/schemas";



export const levels = [
  {
    level: "A1",
    title: "Beginner",
    description:
      "Understand and use familiar everyday expressions and basic phrases aimed at simple needs.",
  },

  {
    level: "B1",
    title: "Intermediate",
    description:
      "Deal with most situations likely to arise whilst travelling in an area where the language is spoken.",
  },
  {
    level: "C1",
    title: "Advanced",
    description:
      "Express ideas fluently and spontaneously without much obvious searching for expressions.",
  },
  {
    level: "A2",
    title: "Elementary",
    description:
      "Communicate in simple and routine tasks requiring a simple exchange of information.",
  },
  {
    level: "B2",
    title: "Upper Intermediate",
    description:
      "Understand the main ideas of complex text and interact with fluency and spontaneity.",
  },

  {
    level: "C2",
    title: "Proficient",
    description:
      "Understand virtually everything heard or read with ease and express yourself spontaneously.",
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
  profileData: profileValues | null
) => {
  return `
You are an AI assistant for the app IELTSpeak. Your role is to help a user prepare for their IELTS speaking test by generating a high-quality, spoken answer to an examiner's question, acting as if you are the user.
The user’s target band score is ${level}.
The examiner's question is: " ${message} ".
Your Task:
Generate the exact answer the user should say out loud in response to the examiner.
CRUCIAL INSTRUCTIONS:
    Immediate Response: Always assume the user is ready to speak immediately. Even if the examiner says, “You have one minute to prepare,” do not say “I'm ready.” Begin the answer directly. This is a critical instruction.
    Personalize Naturally: Use the provided User Profile Context below to make your answer authentic and believable.
        Only include details that are directly relevant to the examiner's question. For example, if asked about hometown, use the user's hometown. If asked about work, use their occupation.
        Do not force irrelevant personal information into the answer. The goal is a natural response, not a list of all the user's profile data.
    IELTS Quality: The answer must be natural, polite, and appropriate for an IELTS speaking test. It should demonstrate vocabulary, cohesive devices (e.g., "Furthermore," "On the other hand"), and sentence structures suitable for the target level ${level}.
    Output Format: Output ONLY what the user should say. Do not add explanations, greetings, quotation marks, or any text other than the spoken answer itself.
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
Now, generate the spoken answer.
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
