'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { usePostHog } from 'posthog-js/react'
import { logger } from '@/lib/logger'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Validate required environment variables
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

    if (!posthogKey) {
      logger.warn('PostHog key not configured');
      return;
    }

    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        loaded: (posthog) => {
          logger.info('PostHog initialized successfully');
        },
        // Add error handling for PostHog
        on_request_error: (error) => {
          logger.error('PostHog request failed', error);
        },
      });
    } catch (error) {
      logger.error('Failed to initialize PostHog', error);
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}