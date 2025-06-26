"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  renews_at: string;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  /**
   * Fetches the user's current subscription status
   */
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles subscription cancellation
   */
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      setCancelling(true);

      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          "Subscription cancelled successfully. You will retain access until the end of your billing period."
        );
        fetchSubscriptionStatus(); // Refresh the data
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  // Load subscription status on component mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Subscribe now to access
            premium features!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActive = subscription.status === "active";
  const endDate = new Date(subscription.renews_at).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Your Subscription</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {subscription.status.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription>{subscription.plan_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            {subscription.renews_at
              ? `Your subscription will end on ${endDate}`
              : `Next billing date: ${endDate}`}
          </p>
        </div>

        {isActive && !subscription.cancel_at_period_end && (
          <Button
            variant="outline"
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="w-full"
          >
            {cancelling ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
