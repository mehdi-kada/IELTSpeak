import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(10).max(100),
  gender: z.enum(["Male", "Female", "Other"]),
  hometown: z.string().min(1),
  country: z.string().min(2),
  occupation: z.string().min(2),
  education_level: z.string().min(2),
  favorite_subject: z.string().min(1),
  hobbies: z.array(z.string()).min(1),
  travel_experience: z.string().min(1),
  favorite_food: z.string().min(1),
  life_goal: z.string().min(1),
});

export type profileValues = z.infer<typeof userProfileSchema>;
