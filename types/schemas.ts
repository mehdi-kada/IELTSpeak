import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(10, "Age must be at least 10")
    .max(100, "Age must be less than 100"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  hometown: z.string().min(1, "Hometown is required"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  occupation: z.string().min(2, "Occupation must be at least 2 characters"),
  education_level: z.string().min(2, "Please select your education level"),
  favorite_subject: z.string().min(1, "Favorite subject is required"),
  hobbies: z.array(z.string()).min(1, "Please select at least one hobby"),
  travel_experience: z.string().min(1, "Travel experience is required"),
  favorite_food: z.string().min(1, "Favorite food is required"),
  life_goal: z.string().min(1, "Life goal is required"),
});

export type profileValues = z.infer<typeof userProfileSchema>;

export const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Passwords do not match",
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password == data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Passwords do not match",
  });

export type updatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type loginFormData = z.infer<typeof loginSchema>;
