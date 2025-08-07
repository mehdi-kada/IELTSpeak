"use client";

import { useAuth } from "@/hooks/session/useAuth";
import { useStatus } from "@/hooks/subscriptions/useStatus";
import { useState } from "react";

export function CustomerPortalButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subStatus } = useStatus();
  const handlePortalAccess = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customer-portal", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.portalUrl) {
          window.location.href = data.portalUrl;
        }
      } else {
        const errorData = await response.json();

        if (response.status === 401) {
          setError("Please sign in to access the portal");
        } else if (response.status === 404) {
          setError(
            "No customer portal access available. Please contact support."
          );
        } else {
          setError(errorData.error || "Failed to access portal");
        }
      }
    } catch (err) {
      console.error("Portal access error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!["active", "cancelled", "expired"].includes(subStatus)) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePortalAccess}
        disabled={loading}
        className="px-6 py-3 bg-[#E91E63] text-white rounded-lg hover:bg-[#E91E63]/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Opening Portal..." : "Manage your subscription"}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
