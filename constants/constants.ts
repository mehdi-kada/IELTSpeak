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

export const geminiPrompt = (level: string|null, message: string) => {
  return `
    you are an intermidary between the user an
    d the examiner in an english speaking test ,
     your job is to provide on what the user should say next 
     in reponse to the examiner , just provide the answer , and make it a proper answer to an ielts and toefl tests , just provide the answer, (suggestion based on the user level ${level}) , make answers little bit short , 
     exactely how the candidate should answer and make sure to make the answers fit the user's level ${level}
    er in a real ielts and toefl interviews, this is the the examiner's message : ${message}
  `;
};
