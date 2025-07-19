"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: false,
        debug: process.env.NODE_ENV === "development",
        autocapture: true,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture("$pageview", {
        path: pathname + (search?.toString() ? `?${search}` : ""),
      });
    }
  }, [pathname, search]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
