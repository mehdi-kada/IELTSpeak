import { z } from 'zod';

/**
 * Centralized validation schemas and utilities
 * Provides consistent input validation across the application
 */

// Environment variables validation
export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  GOOGLE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// API request validation schemas
export const sessionIdSchema = z.string().uuid();

export const messagesSchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
  })
).min(1);

export const levelSchema = z.enum(['6.5', '7', '7.5', '8', '8.5', '9']);

export const ratingRequestSchema = z.object({
  messages: messagesSchema,
  level: levelSchema,
});

export const ieltsRatingsSchema = z.object({
  fluency: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
  vocabulary: z.number().min(0).max(9),
  pronunciation: z.number().min(0).max(9),
  overall: z.number().min(0).max(9),
});

export const feedbackSchema = z.object({
  positives: z.array(z.string()).length(4),
  negatives: z.array(z.string()).length(4),
});

export const sessionUpdateSchema = z.object({
  ielts_rating: ieltsRatingsSchema,
  feedback: feedbackSchema,
});

// Utility functions for validation
export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    throw new Error(`Environment validation failed: ${error}`);
  }
}

export function createValidationError(message: string, field?: string) {
  return {
    error: 'Validation Error',
    message,
    field,
    status: 400,
  };
}

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}