"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutId = searchParams.get("checkout_id");

    if (!checkoutId) {
      setError("No checkout ID provided");
      setIsProcessing(false);
      return;
    }

    // Call the API endpoint instead of the server function directly
    fetch("/api/subscriptions/success", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkoutId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process checkout");
        }
        return response.json();
      })
      .then(() => {
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error("Failed to process checkout success:", err);
        setError("Failed to process subscription");
        setIsProcessing(false);
      });
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            Processing your subscription...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="text-green-500 text-4xl mb-4">✅</div>
        <h2 className="text-xl font-semibold mb-2">Subscription Activated!</h2>
        <p className="text-gray-600 mb-6">
          Welcome to your premium subscription! You now have access to all
          premium features.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="w-full">
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}
