

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

        const savedProfile = localStorage.getItem(`${userId}_userProfile`);
        console.log("fetched profile data from LS:", savedProfile);

        if (savedProfile) {
          const cachedData = JSON.parse(savedProfile);
          setProfileData(cachedData);
          return;
        }

        const dbData = await fetchUserProfileData(userId);
        console.log("fetched profile data from DB:", dbData);

        if (dbData) {
          
          localStorage.setItem(`${userId}_userProfile`, JSON.stringify(dbData));
        }

        setProfileData(dbData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        console.error("Error handling profile data:", err);
        setError(errorMessage);
        setProfileData(null); 
      } finally {
        setLoading(false); 
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
