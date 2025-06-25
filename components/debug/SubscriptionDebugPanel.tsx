"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SubscriptionDebugPanel() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/debug");
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      setDebugData({ error: "Failed to fetch debug data" });
    }
    setLoading(false);
  };

  const cleanupDuplicates = async () => {
    setCleaning(true);
    try {
      const response = await fetch("/api/subscriptions/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup" }),
      });
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Refresh debug data
        await fetchDebugData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to cleanup duplicates");
    }
    setCleaning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Debug Panel</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={fetchDebugData} disabled={loading}>
              {loading ? "Loading..." : "Fetch Debug Data"}
            </Button>

            {debugData && debugData.totalSubscriptions > 1 && (
              <Button
                onClick={cleanupDuplicates}
                disabled={cleaning}
                variant="destructive"
              >
                {cleaning ? "Cleaning..." : "Cleanup Duplicates"}
              </Button>
            )}
          </div>

          {debugData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">User ID</h3>
                  <p className="text-sm text-blue-600 font-mono">
                    {debugData.userId}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">
                    Total Subscriptions
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {debugData.totalSubscriptions}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">
                    Current Status
                  </h3>
                  <p className="text-sm text-purple-600">
                    {debugData.currentSubscription
                      ? debugData.currentSubscription.status
                      : "No active subscription"}
                  </p>
                </div>
              </div>

              {debugData.totalSubscriptions > 1 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Multiple Subscriptions Found
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    You have {debugData.totalSubscriptions} subscription
                    records. This can cause errors.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Click "Cleanup Duplicates" to keep only the most recent one.
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Current Subscription</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugData.currentSubscription, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">All Subscriptions</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(debugData.allSubscriptions, null, 2)}
                  </pre>
                </div>
              </div>

              {debugData.errors &&
                Object.values(debugData.errors).some(Boolean) && (
                  <div>
                    <h3 className="font-semibold mb-2 text-red-600">Errors</h3>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <pre className="text-xs text-red-800">
                        {JSON.stringify(debugData.errors, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
