"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SubscriptionDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();
      setResult({
        status: response.status,
        data: data,
        ok: response.ok,
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Subscription Status Debug</h2>

      <Button
        onClick={testSubscriptionStatus}
        disabled={loading}
        className="mb-4"
      >
        {loading ? "Testing..." : "Test Subscription Status API"}
      </Button>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">API Response:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
