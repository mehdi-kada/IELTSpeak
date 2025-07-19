"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      // auto-capture pageviews on navigation
      capture_pageview: true,
      // enable debug logs in development to confirm init
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  // capture on each route change (including the initial load)
  useEffect(() => {
    posthog.capture("$pageview", {
      path: pathname + (search?.toString() ? `?${search}` : ""),
    });
  }, [pathname, search]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
