"use client";
import { SubscriptionStatusProps } from "@/types/types";
import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../Loading";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const limitReached = params.get("reason");
  const toastRefshown = useRef(false);
  const [subStatus, setSubStatus] = useState("");
  const [subData, setSubData] = useState<SubscriptionStatusProps | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const endDate = subData?.current_period_end
    ? new Date(subData?.current_period_end).toLocaleString()
    : null;
  const renews_at = subData?.renews_at
    ? new Date(subData?.renews_at).toLocaleString()
    : null;


  useEffect(() => {
    if (limitReached && !toastRefshown.current) {
      toast("Please upgrade to get unlimited sessions");
      toastRefshown.current = true;
    }
  }, []);

  const fetchSubStatus = async () => {
    try {
      setError(null);
      const response = await fetch("/api/subscriptions/status");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log("Subscription status data:", data); // Debug log
      
      setSubStatus(data.status || "inactive");
      setSubData(data.subData);
    } catch (error) {
      console.error("Error when fetching the user's status:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch subscription status");
    } finally {
      setLoading(false);
    }
  };

  const handleCanceleSub = async () => {
    try {
      setCancelling(true);
      
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      const data = await response.json();
      if (data.ok) {
        alert(
          "Subscription cancelled successfully. You will retain access until the end of your billing period."
        );
        fetchSubStatus();
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

  useEffect(() => {
    fetchSubStatus();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        message="Fetching subscription data..."
        fullScreen={false}
        size="sm"
      />
    );
  }

  if (subStatus === "active") {
    return (
      <div className="bg-[#374151] border border-[#E91E63] shadow-xl shadow-[#E91E63] px-6 py-4 rounded-xl space-y-3">
        <p className="text-2xl font-bold">You are subscribed! 🎉</p>
        <div className="space-y-2">
          <p className="text-gray-300">
            Plan: <strong className="text-white">{subData?.plan_name || "Premium Plan"}</strong>
          </p>
          <p className="text-gray-300">
            {subData?.cancel_at_period_end 
              ? `Your subscription will end on ${endDate}` 
              : `Your subscription will renew on ${renews_at}`
            }
          </p>
          {!subData?.cancel_at_period_end && (
            <button
              disabled={cancelling}
              onClick={handleCanceleSub}
              className="cursor-pointer text-[#E91E63] hover:text-[#E91E63]/80 transition-colors text-sm underline"
            >
              {cancelling ? "Cancelling..." : "Cancel subscription"}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (subStatus === "cancelled") {
    return (
      <div className="bg-[#374151] border border-orange-500 px-6 py-4 rounded-xl space-y-3">
        <p className="text-xl font-bold text-orange-400">Subscription Cancelled</p>
        <p className="text-gray-300">
          Your subscription will end on <strong className="text-white">{endDate}</strong>
        </p>
        <p className="text-sm text-gray-400">
          You still have access to premium features until your billing period ends.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="bg-white/5 rounded-full border border-white/10  px-6 py-2 ">
        <p className="text-gray-300 text-l">
          you are currently on the <strong>Free Plan</strong> Upgrade to unlock
          all features
        </p>
      </div>
    </>
  );
}
export default SubscriptionStatus;
