"use client";
import { SubscriptionStatusProps } from "@/types/types";
import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../Loading";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useStatus } from "@/hooks/subscriptions/useStatus";

function SubscriptionStatus() {
  const params = useSearchParams();
  const limitReached = params.get("reason");
  const toastRefshown = useRef(false);
  const { loading, error, subData, subStatus, refetch } = useStatus();


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
  }, [limitReached]);


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
            Plan:{" "}
            <strong className="text-white">
              {subData?.plan_name || "Premium Plan"}
            </strong>
          </p>
          <p className="text-gray-300">
            {subData?.cancel_at_period_end
              ? `Your subscription will end on ${endDate}`
              : `Your subscription will renew on ${renews_at}`}
          </p>

        </div>
      </div>
    );
  }

  if (subStatus === "cancelled") {
    return (
      <div className="bg-[#374151] border border-orange-500 px-6 py-4 rounded-xl space-y-3">
        <p className="text-xl font-bold text-orange-400">
          Subscription Cancelled
        </p>
        <p className="text-gray-300">
          Your subscription will end on{" "}
          <strong className="text-white">{endDate}</strong>
        </p>
        <p className="text-sm text-gray-400">
          You still have access to premium features until your billing period
          ends.
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
