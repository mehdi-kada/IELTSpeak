// this hook will get data from local storage or db if it exists if not , will redirect to profile page

import { fetchUserProfileData } from "@/lib/actions";
import { profileValues } from "@/types/schemas";
import { useState, useEffect } from "react";

export function useUserProfile(userId: string | null) {
  const [profileData, setProfileData] = useState<profileValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfileData(null);
      return;
    }

    const handleProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // check localStorage first
        const savedProfile = localStorage.getItem(`${userId}_userProfile`);
        console.log("fetched profile data from LS:", savedProfile);

        if (savedProfile) {
          const cachedData = JSON.parse(savedProfile);
          setProfileData(cachedData);
          return; // Remove the manual setLoading(false) here
        }

        // fetch from database if not cached
        const dbData = await fetchUserProfileData(userId);
        console.log("fetched profile data from DB:", dbData);

        if (dbData) {
          // cache the data only if we got valid data
          localStorage.setItem(`${userId}_userProfile`, JSON.stringify(dbData));
        }

        setProfileData(dbData); // This handles both null and valid data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        console.error("Error handling profile data:", err);
        setError(errorMessage);
        setProfileData(null); // Ensure profileData is null on error
      } finally {
        setLoading(false); // This handles loading state for both paths
      }
    };

    handleProfileData();
  }, [userId]);

  return {
    profileData,
    loading,
    error,
  };
}
