import { profileValues } from "@/types/schemas";



export const levels = [
  {
    level: "6.5",
    title: "Band 6.5 - Competent User",
    description: "Good operational command of English with some inaccuracies and misunderstandings."
  },
  {
    level: "7",
    title: "Band 7 - Good User", 
    description: "Operational command of English with occasional inaccuracies and inappropriate usage."
  },
  {
    level: "7.5",
    title: "Band 7.5 - Good User",
    description: "Good operational command with occasional inaccuracies in unfamiliar situations."
  },
  {
    level: "8",
    title: "Band 8 - Very Good User",
    description: "Very good command of English with only occasional unsystematic inaccuracies."
  },
  {
    level: "8.5", 
    title: "Band 8.5 - Very Good User",
    description: "Very good command with only occasional inaccuracies and inappropriate usage."
  },
  {
    level: "9",
    title: "Band 9 - Expert User",
    description: "Fully operational command of English with complete accuracy and fluency."
  }
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
The user's target band score is ${level}.
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
    dont make the answers too long , just make them fit an ielts exam based on the level , also only refer to the user's info when neccessary
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
