"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { checkUserPremiumStatus } from "./lemonsqueezy/subscription-helpers";
import { sessionUpdateProps } from "@/types/types";
import { profileValues } from "@/types/schemas";
import { requiredFields } from "@/constants/constants";
import { logger } from "@/lib/logger";
import { AppError, handleDatabaseError, handleAuthError } from "@/lib/error-handling";

// Constants for better maintainability
const FREE_SESSION_LIMIT = 3;
const REDIRECT_ROUTES = {
  LOGIN: "/auth/login",
  PROFILE_NO_DATA: "/profile?reason=no_data",
  SUBSCRIBE_LIMIT: "/subscribe?reason=limit-hit",
} as const;

export const insertSession = async ({ level }: { level: string }) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      logger.error("Failed to get authenticated user", authError);
      throw handleAuthError(authError);
    }

    if (!user) {
      logger.warn("Unauthenticated user attempted to create session");
      redirect(REDIRECT_ROUTES.LOGIN);
    }

    logger.info("Creating new session", { userId: user.id, level });

    // Fetch user profile data with better error handling
    const profileData = await fetchUserProfileForSession(user.id);
    
    // Check if user is premium
    const isPremium = await checkUserPremiumStatus(user.id);
    logger.debug("User premium status checked", { userId: user.id, isPremium });

    // Enforce session limit for non-premium users
    if (!isPremium) {
      await enforceSessionLimit(user.id);
    }

    // Create new session
    const sessionData = {
      level: level as string,
      user_id: user.id,
    };

    const { data: newSession, error: insertError } = await supabase
      .from("sessions")
      .insert(sessionData)
      .select("id")
      .single();

    if (insertError) {
      throw handleDatabaseError(insertError, "session creation");
    }

    logger.info("Session created successfully", { 
      sessionId: newSession.id, 
      userId: user.id, 
      level 
    });

    return {
      sessionId: newSession.id,
      redirectUrl: `/levels/${newSession.id}?level=${level}`,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Unexpected error in insertSession", error);
    throw new AppError("Failed to create session", 500);
  }
};

export const updateSession = async ({
  sessionId,
  ielts,
  feedback,
}: sessionUpdateProps) => {
  try {
    const supabase = await createClient();
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error("Failed to get authenticated user for session update", authError);
      throw handleAuthError(authError);
    }
    
    if (!user) {
      logger.warn("Unauthenticated user attempted to update session");
      redirect(REDIRECT_ROUTES.LOGIN);
    }

    logger.info("Updating session with ratings", { sessionId, userId: user.user.id });

    const sessionUpdateData = {
      ielts_rating: ielts,
      feedback: feedback,
    };

    const { data: updatedData, error } = await supabase
      .from("sessions")
      .update(sessionUpdateData)
      .eq("id", sessionId)
      .eq("user_id", user.user.id) // Ensure user owns the session
      .select()
      .single();

    if (error) {
      throw handleDatabaseError(error, "session update");
    }

    logger.info("Session updated successfully", { sessionId, userId: user.user.id });
    return updatedData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Unexpected error in updateSession", error);
    throw new AppError("Failed to update session", 500);
  }
};

export const insertProfileData = async (
  data: profileValues,
  userId: string
) => {
  try {
    logger.info("Inserting profile data", { userId });
    
    const profileData = { id: userId, ...data };
    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert(profileData);

    if (error) {
      throw handleDatabaseError(error, "profile data insertion");
    }

    logger.info("Profile data inserted successfully", { userId });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Unexpected error in insertProfileData", error, { userId });
    throw new AppError("Failed to save profile data", 500);
  }
};

export const fetchUserProfileData = async (
  userId: string
): Promise<profileValues | null> => {
  try {
    logger.debug("Fetching user profile data", { userId });
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(requiredFields.join(","))
      .eq("id", userId)
      .single();

    if (error) {
      // If no rows found, return null instead of throwing
      if (error.code === "PGRST116") {
        logger.debug("Profile not found for user", { userId });
        return null;
      }
      throw handleDatabaseError(error, "profile data fetch");
    }

    // Ensure we have valid data before returning
    if (!data) {
      logger.debug("No profile data found for user", { userId });
      return null;
    }

    logger.debug("Profile data fetched successfully", { userId });
    return data as unknown as profileValues;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Unexpected error in fetchUserProfileData", error, { userId });
    return null;
  }
};

/**
 * Helper function to fetch and validate user profile for session creation
 */
async function fetchUserProfileForSession(userId: string) {
  const supabase = await createClient();
  const { data: profileData, error: profileDataError } = await supabase
    .from("profiles")
    .select(requiredFields.join(","))
    .eq("id", userId)
    .single();

  if (profileDataError) {
    logger.error("Failed to fetch user profile for session", profileDataError, { userId });
    redirect(REDIRECT_ROUTES.PROFILE_NO_DATA);
  }

  // Check for missing required fields
  const isProfileComplete = requiredFields.every(
    (field) =>
      profileData &&
      profileData[field as keyof typeof profileData] !== null &&
      profileData[field as keyof typeof profileData] !== ""
  );

  if (!isProfileComplete) {
    logger.info("Incomplete profile detected", { userId, missingFields: requiredFields.filter(field => !profileData?.[field as keyof typeof profileData]) });
    redirect(REDIRECT_ROUTES.PROFILE_NO_DATA);
  }

  return profileData;
}

/**
 * Helper function to enforce session limit for non-premium users
 */
async function enforceSessionLimit(userId: string) {
  const supabase = await createClient();
  
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, created_at")
    .eq("user_id", userId)
    .gt("ielts_rating->>overall", 0)
    .order("created_at", { ascending: false });

  if (error) {
    throw handleDatabaseError(error, "session limit check");
  }

  if (sessions && sessions.length >= FREE_SESSION_LIMIT) {
    logger.info("Session limit reached for non-premium user", { 
      userId, 
      sessionCount: sessions.length, 
      limit: FREE_SESSION_LIMIT 
    });
    return {
      redirect: REDIRECT_ROUTES.SUBSCRIBE_LIMIT,
      reason: "limit_reached",
    };
  }
}
