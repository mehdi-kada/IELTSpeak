"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SubscriptionButtonProps {
  productId: string;
  className?: string;
  children?: React.ReactNode;
}

export function SubscriptionButton({
  productId,
  className = "",
  children = "Subscribe Monthly",
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Failed to create checkout:", error);
      alert("Failed to start subscription process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={loading} className={className}>
      {loading ? "Creating checkout..." : children}
    </Button>
  );
}

export default SubscriptionButton;
