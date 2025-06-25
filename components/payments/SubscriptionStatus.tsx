"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Subscription {
  id: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  amount?: number;
  currency: string;
}

interface SubscriptionStatusData {
  isSubscribed: boolean;
  subscription: Subscription | null;
}

export function SubscriptionStatus() {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (response.ok) {
        alert(
          "Subscription will be canceled at the end of the current billing period."
        );
        fetchSubscriptionStatus(); // Refresh status
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!subscriptionData?.isSubscribed || !subscriptionData.subscription) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">
          You don't currently have an active subscription.
        </p>
      </Card>
    );
  }

  const { subscription } = subscriptionData;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : "Unknown";

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Subscription Status</h3>
          <div className="mt-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {subscription.status}
            </span>
          </div>
        </div>
        {subscription.amount && (
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${(subscription.amount / 100).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {subscription.currency.toUpperCase()}/month
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Current period ends:</span>
          <span>{periodEnd}</span>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-4">
            <p className="text-orange-800 text-sm">
              ⚠️ Your subscription is set to cancel at the end of the current
              billing period.
            </p>
          </div>
        )}
      </div>

      {!subscription.cancel_at_period_end && (
        <div className="mt-6">
          <Button
            onClick={handleCancelSubscription}
            variant="outline"
            disabled={canceling}
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            {canceling ? "Canceling..." : "Cancel Subscription"}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default SubscriptionStatus;
