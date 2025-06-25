"use client";

import { useEffect, useState } from "react";

interface Subscription {
  id: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  amount?: number;
  currency: string;
}

interface UseSubscriptionResult {
  isSubscribed: boolean;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubscription(): UseSubscriptionResult {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subscriptions/status");

      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
      setSubscription(data.subscription);
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  return {
    isSubscribed,
    subscription,
    loading,
    error,
    refetch: fetchSubscriptionStatus,
  };
}

export default useSubscription;
