"use client";

import React from "react";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { Button } from "@/components/ui/button";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

/**
 * Client-side subscription guard component
 * Wraps premium features and shows upgrade prompt for non-subscribers
 */
export function SubscriptionGuard({
  children,
  fallback,
  showUpgrade = true,
}: SubscriptionGuardProps) {
  const { isSubscribed, loading } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSubscribed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUpgrade) {
      return null;
    }

    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
        <p className="text-gray-600 mb-4">
          This feature is available for premium subscribers only.
        </p>
        <Button asChild>
          <a href="/subscribe">Upgrade to Premium</a>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component version for wrapping entire components
 */
export function withSubscriptionGuard<T extends object>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType
) {
  return function SubscriptionGuardedComponent(props: T) {
    return (
      <SubscriptionGuard
        fallback={FallbackComponent ? <FallbackComponent /> : undefined}
      >
        <Component {...props} />
      </SubscriptionGuard>
    );
  };
}

export default SubscriptionGuard;
