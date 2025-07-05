"use client";
import { SubscriptionStatusProps } from "@/types/types";
import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../Loading";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
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
  console.log("sub status is : ", subStatus);

  useEffect(() => {
    if (limitReached && !toastRefshown.current) {
      toast("Please upgrade to get unlimited sessions");
      toastRefshown.current = true;
    }
  }, []);

  const fetchSubStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();
      if (!data) {
        console.log(" failed to fetch user status");
      }
      setSubStatus(data.status);
      setSubData(data.subData);
    } catch (error) {
      console.log("error when fetching the user's status : ", error);
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
      <div className="bg-[#2F2F7F] border border-red-600 px-6 py-4 rounded-xl space-y-3">
        <p className="text-2xl font-bold">You are subscribed !</p>

        <div className="">
          <p>
            Your subscription will be renewed at <strong>{renews_at}</strong>
          </p>
          <button
            disabled={cancelling}
            onClick={handleCanceleSub}
            className=" cursor-pointer text-red-600 "
          >
            {cancelling ? "cancelling..." : "Cancel subscription"}
          </button>
        </div>
      </div>
    );
  }
  if (subStatus === "cancelled") {
    return (
      <div className="bg-[#2F2F7F] border border-red-600 px-6 py-4 rounded-xl space-y-3">
        <p>
          Your subscription will end in <strong>{endDate}</strong>
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
