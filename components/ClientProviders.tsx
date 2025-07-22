"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the PostHog provider to prevent SSR issues
const DynamicPostHogProvider = dynamic(
  () => import("../app/providers").then((mod) => ({ default: mod.PostHogProvider })),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DynamicPostHogProvider>
        {children}
      </DynamicPostHogProvider>
    </Suspense>
  );
}
