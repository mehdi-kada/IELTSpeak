"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const initPostHog = async () => {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (posthogKey && posthogHost) {
        try {
          const posthog = (await import("posthog-js")).default;
          
          if (!posthog.__loaded) {
            posthog.init(posthogKey, {
              api_host: posthogHost,
              person_profiles: "identified_only",
              capture_pageview: false,
              debug: process.env.NODE_ENV === "development",
              autocapture: true,
            });
          }
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to initialize PostHog:", error);
        }
      }
    };

    initPostHog();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      const capturePageview = async () => {
        try {
          const posthog = (await import("posthog-js")).default;
          if (posthog.__loaded) {
            posthog.capture("$pageview", {
              path: pathname + (search?.toString() ? `?${search}` : ""),
            });
          }
        } catch (error) {
          console.error("Failed to capture pageview:", error);
        }
      };

      capturePageview();
    }
  }, [pathname, search, isInitialized]);

  return <>{children}</>;
}
