"use client";

import { useState, useEffect } from "react";
import { UserSubscription } from "@/lib/subscription-helpers";

interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    subscription: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/subscriptions/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscription status: ${response.status}`
        );
      }

      const data = await response.json();

      setStatus({
        isSubscribed: data.isSubscribed,
        subscription: data.subscription,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription status",
      }));
    }
  };

  return {
    ...status,
    refetch: fetchSubscriptionStatus,
  } as SubscriptionStatus & { refetch: () => Promise<void> };
}
