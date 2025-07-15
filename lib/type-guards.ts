/**
 * Type guards and utility functions for better type safety
 */

import { levels, HobbyOption, EducationLevel, Gender } from "@/constants/constants";

/**
 * Type guard to check if a string is a valid IELTS level
 */
export function isValidIELTSLevel(level: string): level is string {
  return levels.some(l => l.level === level);
}

/**
 * Type guard to check if a string is a valid hobby option
 */
export function isValidHobby(hobby: string): hobby is HobbyOption {
  return ["reading", "watching movies", "cooking", "traveling", "sports", "music", "gaming", "photography", "writing", "drawing", "dancing", "swimming"].includes(hobby);
}

/**
 * Type guard to check if a string is a valid education level
 */
export function isValidEducationLevel(level: string): level is EducationLevel {
  return ["High School", "Bachelor's", "Master's", "PhD", "Other"].includes(level);
}

/**
 * Type guard to check if a string is a valid gender
 */
export function isValidGender(gender: string): gender is Gender {
  return ["Male", "Female", "Other"].includes(gender);
}

/**
 * Type guard to check if an object has all required properties
 */
export function hasRequiredProperties<T extends Record<string, any>>(
  obj: any,
  requiredKeys: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return requiredKeys.every(key => {
    const value = obj[key];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Safe JSON parsing with error handling
 */
export function safeParseJSON<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate IELTS overall score from individual scores
 */
export function calculateOverallIELTSScore(scores: {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
}): number {
  const { fluency, grammar, vocabulary, pronunciation } = scores;
  const average = (fluency + grammar + vocabulary + pronunciation) / 4;
  
  // Round to nearest 0.5
  return Math.round(average * 2) / 2;
}

/**
 * Get IELTS level description by score
 */
export function getIELTSLevelDescription(score: number): string {
  const level = levels.find(l => l.numericValue === score);
  return level?.description || 'Unknown level';
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate a random ID for temporary use
 */
export function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}