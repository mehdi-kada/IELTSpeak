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
  { name: "levels", href: "/levels" },
  { name: "dashboard", href: "/dashboard" },
  { name: "upgrade", href: "/subscribe" },
];

export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const geminiPrompt = (level: string | null, message: string) => {
  return `
You are an AI assistant helping a user prepare for IELTS and TOEFL speaking tests by acting as an intermediary between the user and the examiner.

The user’s target level is ${level}. Your job is to provide the exact answer the user should give in response to the examiner’s question in ${message}.

Always assume the user is now ready to speak, even if the examiner said “You have one minute to prepare” or “Tell me when you're ready.”

Do not say “I’m ready.” Instead, go ahead and generate a full, realistic answer that fits the expectations for a candidate at level ${level}.

The answer must be natural, polite, and suitable for IELTS or TOEFL speaking tasks. Use complete sentences.

Keep it short and appropriate for speaking — do not explain anything, and do not provide multiple options.

Only output what the user should say out loud, as if in a live exam.
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
