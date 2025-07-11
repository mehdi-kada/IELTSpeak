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

        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setProfileData(profileData);
          setLoading(false);
          return;
        }

        // fetch from database if not cached
        const profileData = await fetchUserProfileData(userId);

        if (!profileData) {
          console.log("No profile data found, redirecting to profile page");
          window.location.href = "/profile?reason=empty";
          return;
        }

        // cache the data
        localStorage.setItem(
          `${userId}_userProfile`,
          JSON.stringify(profileData)
        );

        setProfileData(profileData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        console.error("Error handling profile data:", err);
        setError(errorMessage);
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
