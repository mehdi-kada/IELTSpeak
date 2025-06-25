"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="text-orange-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Subscription Cancelled</h2>
        <p className="text-gray-600 mb-6">
          Your subscription process was cancelled. You can try again anytime.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push("/subscribe")} className="w-full">
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
