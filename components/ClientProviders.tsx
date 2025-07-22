"use client";

import { useState, useEffect } from "react";
import { PostHogProvider } from "../app/providers";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return <PostHogProvider>{children}</PostHogProvider>;
}
