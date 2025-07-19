"use client";
import { useAuth } from "@/hooks/sessions/useAuth";
import { useUserProfile } from "@/hooks/sessions/useProfileData";
import { requiredFields } from "@/constants/constants";
import { insertSession } from "@/lib/actions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface cardProps {
  level: string;
  title: string;
  description: string;
}

function LevelCard({ level, title, description }: cardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { userId, error } = useAuth();
  if(error){
    throw new Error("couldnt get the user id ")
  }
  const { profileData, loading: profileLoading } = useUserProfile(userId);
  // determine if profile has all required fields
  const isProfileComplete = React.useMemo(() => {
    if (!profileData) return false;
    return requiredFields.every(
      (field) =>
        profileData[field as keyof typeof profileData] != null &&
        profileData[field as keyof typeof profileData] !== ""
    );
  }, [profileData]);

  const handleSubmit = async () => {
    // ensure profile is loaded and complete
    if (profileLoading) return;
    if (!isProfileComplete) {
      router.push("/profile?reason=empty");
      return;
    }
    setLoading(true);
    try {
      const result = await insertSession({ level });
      if (result?.redirect) {
        router.push(result.redirect);
        return;
      }
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  return (
    <div className="group relative bg-[#374151] border space-y-12 sm:space-y-0 border-white/10 p-6 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#E91E63]">
      <div className="relative z-10 pointer-events-none ">
        <h3 className="text-4xl font-black text-[#E91E63]">{level}</h3>
        <h4 className="font-bold text-2xl mb-2 mt-2 text-white">{title}</h4>
        <p className="text-gray-400 mt-4 h-24 transition-opacity duration-300 sm:group-hover:opacity-0">
          {description}
        </p>
      </div>
      <div className="absolute inset-0 p-8 flex flex-col justify-end items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <div className="flex flex-col gap-4 w-full">
          <button
            disabled={loading || profileLoading}
            onClick={() => handleSubmit()}
            className={`w-full text-center font-bold py-3 px-4 rounded-lg transition-all duration-200
              ${
                loading
                  ? "bg-[#E91E63]/20 text-gray-600 cursor-not-allowed"
                  : "bg-[#E91E63] text-white hover:shadow-md hover:shadow-[#E91E63]/30 hover:-translate-y-px"
              }`}
          >
            {loading || profileLoading ? "Starting Session..." : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LevelCard;
