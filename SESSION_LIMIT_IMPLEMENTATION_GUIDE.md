# Free User Session Limit Implementation Guide

## Overview

This guide explains how to implement a 3-session trial limit for free users in your ToEILET application. Free users will be able to complete only 3 practice sessions before being prompted to subscribe.

## How It Works

1. **Track Session Count**: Count completed sessions for each user
2. **Check Limit Before Session**: Verify if user can start a new session
3. **Enforce Limit**: Block new sessions and redirect to subscription page
4. **Bypass for Subscribers**: Allow unlimited sessions for paid users

## Database Changes Needed

### Option 1: Add Column to Existing Sessions Table

```sql
-- Add a session_status column to track completed sessions
ALTER TABLE sessions
ADD COLUMN session_status TEXT DEFAULT 'incomplete';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_status
ON sessions(user_id, session_status);
```

### Option 2: Create User Limits Table (Recommended)

```sql
-- Create a separate table to track user limits
CREATE TABLE IF NOT EXISTS user_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sessions_used INTEGER DEFAULT 0,
    sessions_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id
ON user_limits(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own limits
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own limits
CREATE POLICY "Users can update own limits" ON user_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can manage all limits
CREATE POLICY "Service role can manage limits" ON user_limits
  FOR ALL USING (auth.role() = 'service_role');
```

## Implementation Steps

### Step 1: Create Helper Functions

Create a new file: `/lib/session-limits.ts`

```typescript
// lib/session-limits.ts
import { createClient } from "@/lib/supabase/server";

const FREE_SESSION_LIMIT = 3;

/**
 * Get the number of completed sessions for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .not("ielts_rating", "is", null) // Only count completed sessions
    .gt("ielts_rating->>overall", 0); // Sessions with actual ratings

  if (error) {
    console.error("Error fetching session count:", error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Check if user has subscription (using existing function)
 */
export async function isUserSubscribed(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if user has active subscription in your existing subscription tables
  const { data, error } = await supabase
    .from("subscriptions") // or "user_subscriptions" based on your setup
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return !!data && !error;
}

/**
 * Check if user can start a new session
 */
export async function canUserStartSession(userId: string): Promise<{
  canStart: boolean;
  reason?: string;
  sessionsUsed?: number;
  sessionsLimit?: number;
}> {
  // First check if user is subscribed
  const isSubscribed = await isUserSubscribed(userId);

  if (isSubscribed) {
    return { canStart: true };
  }

  // For free users, check session limit
  const sessionsUsed = await getUserSessionCount(userId);

  if (sessionsUsed >= FREE_SESSION_LIMIT) {
    return {
      canStart: false,
      reason: "Free trial limit reached. Please subscribe to continue.",
      sessionsUsed,
      sessionsLimit: FREE_SESSION_LIMIT,
    };
  }

  return {
    canStart: true,
    sessionsUsed,
    sessionsLimit: FREE_SESSION_LIMIT,
  };
}

/**
 * Increment session count after completion (if using Option 2)
 */
export async function trackSessionCompletion(userId: string): Promise<void> {
  const supabase = await createClient();

  // Upsert user limits record
  const { error } = await supabase.from("user_limits").upsert(
    {
      user_id: userId,
      sessions_used: await getUserSessionCount(userId),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("Error tracking session completion:", error);
  }
}
```

### Step 2: Update Session Creation Logic

Modify `/lib/actions.ts`:

```typescript
// lib/actions.ts
"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { canUserStartSession } from "./session-limits"; // Import new helper

interface sessionProps {
  level: string;
}

export const insertSession = async ({ level }: sessionProps) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // CHECK SESSION LIMIT BEFORE CREATING SESSION
  const sessionCheck = await canUserStartSession(user.id);

  if (!sessionCheck.canStart) {
    // Redirect to subscription page with information
    redirect(
      `/subscribe?reason=limit&used=${sessionCheck.sessionsUsed}&limit=${sessionCheck.sessionsLimit}`
    );
  }

  const sessionData = {
    level: level as string,
    user_id: user?.id,
    session_status: "in_progress", // Track session status
  };

  const { data: newSession, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select("id")
    .single();

  if (error) {
    console.error("error creating session : ", error);
    throw new Error("error");
  }

  return {
    sessionId: newSession.id,
    redirectUrl: `/levels/${newSession.id}?level=${level}`,
  };
};

// ...existing code...
```

### Step 3: Update Session Completion Logic

Modify `/app/api/rating/[sessionID]/route.ts`:

```typescript
// app/api/rating/[sessionID]/route.ts
import { createClient } from "@/lib/supabase/server";
import { trackSessionCompletion } from "@/lib/session-limits"; // Import helper
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ...existing imports...

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionID: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionID;
    const { messages, level } = await req.json();

    // ...existing validation code...

    // ...existing AI processing code...

    const supabase = await createClient();

    // Get current user for session tracking
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: dbError } = await supabase
      .from("sessions")
      .update({
        ielts_rating: parsedEvaluation.ielts_ratings,
        feedback: parsedEvaluation.feedback,
        session_status: "completed", // Mark as completed
      })
      .eq("id", sessionId)
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to save evaluation",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // TRACK SESSION COMPLETION FOR FREE USERS
    if (user) {
      await trackSessionCompletion(user.id);
    }

    return NextResponse.json({
      sessionId,
      level,
      evaluation: parsedEvaluation,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in rating API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Step 4: Create Session Limit Check Component

Create `/components/SessionLimitGuard.tsx`:

```tsx
// components/SessionLimitGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SessionLimitInfo {
  canStart: boolean;
  reason?: string;
  sessionsUsed?: number;
  sessionsLimit?: number;
}

interface SessionLimitGuardProps {
  children: React.ReactNode;
}

export function SessionLimitGuard({ children }: SessionLimitGuardProps) {
  const [limitInfo, setLimitInfo] = useState<SessionLimitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSessionLimit();
  }, []);

  const checkSessionLimit = async () => {
    try {
      const response = await fetch("/api/session-limit");
      const data = await response.json();
      setLimitInfo(data);
    } catch (error) {
      console.error("Error checking session limit:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (limitInfo && !limitInfo.canStart) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Trial Limit Reached</h2>
          <p className="text-gray-600 mb-4">
            You've used {limitInfo.sessionsUsed} out of{" "}
            {limitInfo.sessionsLimit} free sessions.
          </p>
          <p className="text-gray-600 mb-6">
            Subscribe to get unlimited practice sessions and advanced features!
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/subscribe")}
              className="w-full"
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Step 5: Create API Endpoint for Session Limit Check

Create `/app/api/session-limit/route.ts`:

```typescript
// app/api/session-limit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUserStartSession } from "@/lib/session-limits";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await canUserStartSession(user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking session limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Level Selection Page

Modify `/app/(main-app)/levels/[sessionId]/page.tsx`:

```tsx
// app/(main-app)/levels/[sessionId]/page.tsx
import { SessionLimitGuard } from "@/components/SessionLimitGuard";
// ...existing imports...

export default function SessionPage({
  params,
  searchParams,
}: {
  params: { sessionId: string };
  searchParams: { level?: string };
}) {
  // ...existing code...

  return (
    <SessionLimitGuard>
      {/* Existing session component */}
      <Session />
    </SessionLimitGuard>
  );
}

// ...rest of existing code...
```

### Step 7: Update Dashboard to Show Usage

Create `/components/dashboard/SessionUsage.tsx`:

```tsx
// components/dashboard/SessionUsage.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SessionUsageProps {
  sessionsUsed: number;
  sessionsLimit: number;
  isSubscribed: boolean;
}

export function SessionUsage() {
  const [usage, setUsage] = useState<SessionUsageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/session-limit");
      const data = await response.json();

      // Also check subscription status
      const subResponse = await fetch("/api/subscriptions/status");
      const subData = await subResponse.json();

      setUsage({
        sessionsUsed: data.sessionsUsed || 0,
        sessionsLimit: data.sessionsLimit || 3,
        isSubscribed: subData.hasActiveSub || false,
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!usage) return null;

  if (usage.isSubscribed) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          🎉 Premium Access
        </h3>
        <p className="text-green-700">You have unlimited practice sessions!</p>
      </Card>
    );
  }

  const remainingSessions = Math.max(
    0,
    usage.sessionsLimit - usage.sessionsUsed
  );
  const progressPercentage = (usage.sessionsUsed / usage.sessionsLimit) * 100;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Free Trial Usage</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Sessions Used</span>
          <span>
            {usage.sessionsUsed} / {usage.sessionsLimit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              progressPercentage >= 100 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {remainingSessions > 0 ? (
        <p className="text-gray-600 mb-4">
          You have <strong>{remainingSessions}</strong> free session
          {remainingSessions !== 1 ? "s" : ""} remaining.
        </p>
      ) : (
        <p className="text-red-600 mb-4">
          You've used all your free sessions. Upgrade to continue practicing!
        </p>
      )}

      {remainingSessions <= 1 && (
        <Button
          onClick={() => router.push("/subscribe")}
          className="w-full"
          variant={remainingSessions === 0 ? "default" : "outline"}
        >
          {remainingSessions === 0 ? "Upgrade Now" : "Upgrade to Premium"}
        </Button>
      )}
    </Card>
  );
}
```

### Step 8: Update Dashboard Page

Modify `/app/(main-app)/dashboard/page.tsx`:

```tsx
// app/(main-app)/dashboard/page.tsx
import { SessionUsage } from "@/components/dashboard/SessionUsage";
// ...existing imports...

export default function Dashboard() {
  // ...existing code...

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Add Session Usage Card */}
      <div className="grid gap-6 mb-8">
        <SessionUsage />
      </div>

      {/* Existing dashboard content */}
      <div className="grid gap-6">
        {/* ...existing dashboard components... */}
      </div>
    </div>
  );
}
```

### Step 9: Update Subscription Page

Modify `/app/(main-app)/subscribe/page.tsx` to show trial information:

```tsx
// app/(main-app)/subscribe/page.tsx
// ...existing imports...

export default function Subscribe() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-400">
          You get 3 free sessions to try IELTSpeak. Upgrade for unlimited
          access!
        </p>
        <SubscriptionStatus />
      </div>

      {/* Add trial information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📚 Free Trial Features
        </h3>
        <ul className="text-blue-700 space-y-1">
          <li>• 3 practice sessions</li>
          <li>• Basic AI feedback</li>
          <li>• Access to all levels (A1-C2)</li>
          <li>• Session results</li>
        </ul>
      </div>

      {/* Existing subscription cards */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-10">
        {/* ...existing subscription cards... */}
      </div>
    </div>
  );
}
```

## Testing the Implementation

### 1. Test Free User Flow

1. Create a new user account
2. Start 3 practice sessions and complete them
3. Try to start a 4th session - should be blocked
4. Verify redirect to subscription page

### 2. Test Subscriber Flow

1. Subscribe a user account
2. Verify unlimited session access
3. Check dashboard shows "Premium Access"

### 3. Test Database

```sql
-- Check session counts
SELECT
  user_id,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN ielts_rating IS NOT NULL THEN 1 END) as completed_sessions
FROM sessions
GROUP BY user_id;

-- Check user limits (if using Option 2)
SELECT * FROM user_limits;
```

## Key Points to Remember

1. **Session Completion**: Only count sessions where `ielts_rating` is not null and has a valid overall score
2. **Subscriber Bypass**: Always check subscription status first before enforcing limits
3. **Database Performance**: Add indexes for user_id and session_status columns
4. **User Experience**: Show progress clearly and provide easy upgrade path
5. **Error Handling**: Gracefully handle cases where API calls fail

## Security Considerations

1. **Server-Side Validation**: Always check limits on the server, not just client-side
2. **Database Security**: Use RLS policies to prevent users from modifying other users' data
3. **API Protection**: Ensure all session limit APIs require authentication

## Future Enhancements

1. **Different Limits**: Allow different limits for different user tiers
2. **Grace Period**: Give 1-2 extra sessions before hard blocking
3. **Analytics**: Track conversion rates from trial to subscription
4. **Reminders**: Send email notifications when approaching limit

This implementation provides a complete solution for limiting free users to 3 sessions while maintaining a smooth user experience and encouraging subscription upgrades.
