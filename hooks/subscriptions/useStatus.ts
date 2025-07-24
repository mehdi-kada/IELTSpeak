"use client"
import { SubscriptionStatusProps } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export const useStatus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState("");
  const [subData, setSubData] = useState<SubscriptionStatusProps | null>(null);

  const fetchSubStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/subscriptions/status");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
      setSubStatus(data.status || "inactive");
      setSubData(data.subData);
    } catch (error) {
      console.error("Error when fetching the user's status:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription status"
      );
    } finally {
      setLoading(false);
    }
  },[]) 

  useEffect(()=>{
    fetchSubStatus()
  }, [fetchSubStatus])
  return {
    loading,
    error,
    subData,
    subStatus,
    refetch : fetchSubStatus
  };
};
