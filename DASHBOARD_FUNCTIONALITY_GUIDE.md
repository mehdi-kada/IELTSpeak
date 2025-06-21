# Dashboard Functionality Guide: Making Your Dashboard Dynamic with Real Data

## Table of Contents

1. [Overview: From Static to Dynamic](#overview)
2. [Understanding the Data Flow](#data-flow)
3. [Creating API Routes for Dashboard Data](#api-routes)
4. [Updating Dashboard Components](#dashboard-components)
5. [Fetching and Managing State](#state-management)
6. [Error Handling and Loading States](#error-handling)
7. [Complete Implementation Examples](#implementation)
8. [Testing Your Dashboard](#testing)

---

## Overview: From Static to Dynamic

Right now, your dashboard shows **sample data** (hardcoded arrays and numbers). We need to transform it to show **real data from your Supabase database**:

### Current State ❌

```tsx
// Hardcoded sample data
const sampleResults = [
  { id: 1, date: "2024-01-15", overallScore: 7.5, level: "IELTS Level 2" },
  { id: 2, date: "2024-01-10", overallScore: 6.0, level: "IELTS Level 1" },
];
```

### Goal State ✅

```tsx
// Real data from database
const [userResults, setUserResults] = useState<SessionResult[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchUserSessions();
}, []);
```

---

## Understanding the Data Flow

### How Dashboard Data Flows

```
1. User visits /dashboard
2. Dashboard page loads → triggers data fetch
3. API route queries Supabase for user's sessions
4. Data flows back to components
5. Components render with real data
```

### What Data We Need

1. **All user sessions** with scores and feedback
2. **Latest session** for recent feedback
3. **Overall statistics** (average scores, improvement trends)
4. **Suggestions for improvement** from recent sessions

---

## Creating API Routes for Dashboard Data

### Step 1: Create User Sessions API Route

Create `app/api/user-sessions/route.ts`:

```tsx
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get authenticated user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all sessions for this user, ordered by creation date
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Transform data for dashboard use
    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      date: new Date(session.created_at).toLocaleDateString(),
      level: session.level || "Unknown Level",
      ieltsScore: session.ielts_rating?.overall || 0,
      toeflScore: session.toefl_rating?.overall || 0,
      scores: {
        // IELTS scores
        fluency: session.ielts_rating?.fluency || 0,
        grammar: session.ielts_rating?.grammar || 0,
        vocabulary: session.ielts_rating?.vocabulary || 0,
        pronunciation: session.ielts_rating?.pronunciation || 0,
        // TOEFL scores
        delivery: session.toefl_rating?.delivery || 0,
        language_use: session.toefl_rating?.language_use || 0,
        topic_development: session.toefl_rating?.topic_development || 0,
      },
      feedback: {
        positivePoints: session.feedback?.positives || [],
        negativePoints: session.feedback?.negatives || [],
      },
    }));

    // Calculate averages
    const ieltsScores = transformedSessions
      .map((s) => s.ieltsScore)
      .filter((score) => score > 0);
    const toeflScores = transformedSessions
      .map((s) => s.toeflScore)
      .filter((score) => score > 0);

    const averageIeltsScore =
      ieltsScores.length > 0
        ? ieltsScores.reduce((sum, score) => sum + score, 0) /
          ieltsScores.length
        : 0;

    const averageToeflScore =
      toeflScores.length > 0
        ? toeflScores.reduce((sum, score) => sum + score, 0) /
          toeflScores.length
        : 0;

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      totalSessions: transformedSessions.length,
      averageIeltsScore,
      averageToeflScore,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 2: Update Types

Add to `types/types.ts`:

```tsx
// Dashboard types that match the actual Supabase database structure
export interface DashboardSession {
  id: string; // UUID from database
  user_id: string;
  created_at: string;
  level: string; // proficiency_level enum
  ielts_rating: {
    fluency: number;
    grammar: number;
    overall: number;
    vocabulary: number;
    pronunciation: number;
  } | null;
  toefl_rating: {
    overall: number;
    delivery: number;
    language_use: number;
    topic_development: number;
  } | null;
  feedback: {
    negatives: string[];
    positives: string[];
  } | null;
}

// Transformed session for dashboard display
export interface TransformedDashboardSession {
  id: string;
  date: string;
  level: string;
  ieltsScore: number;
  toeflScore: number;
  scores: {
    // IELTS scores
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    // TOEFL scores
    delivery: number;
    language_use: number;
    topic_development: number;
  };
  feedback: {
    positivePoints: string[];
    negativePoints: string[];
  };
}

export interface DashboardData {
  success: boolean;
  sessions: TransformedDashboardSession[];
  totalSessions: number;
  averageIeltsScore: number;
  averageToeflScore: number;
}
```

---

## Updating Dashboard Components

### Step 3: Update Dashboard Page

Update `app/(main-app)/dashboard/page.tsx`:

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverallScores } from "@/components/dashboard/OverallScores";
import { TipsForImprovement } from "@/components/dashboard/TipsForImprovement";
import { StartNewSession } from "@/components/dashboard/StartNewSession";
import { PracticeHistory } from "@/components/dashboard/PracticeHistory";
import { DashboardData, TransformedDashboardSession } from "@/types/types";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Check user authentication and fetch data
  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Please log in to view your dashboard");
        setLoading(false);
        return;
      }

      setUser(user);
      await fetchDashboardData();
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication failed");
      setLoading(false);
    }
  };

  // Fetch user sessions data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user-sessions", {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={checkUserAndFetchData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData || dashboardData.sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            title="Your Progress"
            description="Review your scores, practice history, and get tips for improvement."
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Practice Sessions Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first practice session to see your progress here!
              </p>
              <StartNewSession href="/levels" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with data
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader
          title="Your Progress"
          description="Review your scores, practice history, and get tips for improvement."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {" "}
            <OverallScores
              sessions={dashboardData.sessions}
              averageIeltsScore={dashboardData.averageIeltsScore}
              averageToeflScore={dashboardData.averageToeflScore}
            />
            <PracticeHistory
              sessions={dashboardData.sessions}
              onRefresh={fetchDashboardData}
            />
          </div>

          <div className="space-y-8">
            <TipsForImprovement sessions={dashboardData.sessions} />
            <StartNewSession href="/levels" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Update OverallScores Component

Update `components/dashboard/OverallScores.tsx`:

```tsx
import React from "react";
import { TransformedDashboardSession } from "@/types/types";

interface OverallScoresProps {
  sessions: TransformedDashboardSession[];
  averageIeltsScore: number;
  averageToeflScore: number;
}

export default function OverallScores({
  sessions,
  averageIeltsScore,
  averageToeflScore,
}: OverallScoresProps) {
  // Calculate IELTS category averages
  const calculateIeltsAverage = (
    category: "fluency" | "grammar" | "vocabulary" | "pronunciation"
  ) => {
    if (sessions.length === 0) return 0;

    const validScores = sessions
      .map((session) => session.scores[category])
      .filter((score) => score > 0);

    if (validScores.length === 0) return 0;

    const sum = validScores.reduce((total, score) => total + score, 0);
    return Math.round((sum / validScores.length) * 10) / 10;
  };

  // Calculate TOEFL category averages
  const calculateToeflAverage = (
    category: "delivery" | "language_use" | "topic_development"
  ) => {
    if (sessions.length === 0) return 0;

    const validScores = sessions
      .map((session) => session.scores[category])
      .filter((score) => score > 0);

    if (validScores.length === 0) return 0;

    const sum = validScores.reduce((total, score) => total + score, 0);
    return Math.round((sum / validScores.length) * 10) / 10;
  };

  const ieltsAverages = {
    fluency: calculateIeltsAverage("fluency"),
    grammar: calculateIeltsAverage("grammar"),
    vocabulary: calculateIeltsAverage("vocabulary"),
    pronunciation: calculateIeltsAverage("pronunciation"),
  };

  const toeflAverages = {
    delivery: calculateToeflAverage("delivery"),
    language_use: calculateToeflAverage("language_use"),
    topic_development: calculateToeflAverage("topic_development"),
  };

  // Get latest session for trend indication
  const latestSession = sessions[0]; // Already sorted by date in API
  const previousSession = sessions[1];

  const getTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return "neutral";
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };

  const ieltsOverallTrend =
    latestSession && previousSession
      ? getTrend(latestSession.ieltsScore, previousSession.ieltsScore)
      : "neutral";

  const toeflOverallTrend =
    latestSession && previousSession
      ? getTrend(latestSession.toeflScore, previousSession.toeflScore)
      : "neutral";

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") {
      return <span className="text-green-500">↗️</span>;
    } else if (trend === "down") {
      return <span className="text-red-500">↘️</span>;
    }
    return <span className="text-gray-400">→</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Overall Performance
        </h2>
        <div className="text-sm text-gray-500">
          Based on {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* IELTS Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                IELTS Average
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {averageIeltsScore.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <TrendIcon trend={ieltsOverallTrend} />
                <span className="ml-1">
                  {ieltsOverallTrend === "up"
                    ? "Improving"
                    : ieltsOverallTrend === "down"
                    ? "Needs focus"
                    : "Stable"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TOEFL Score */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                TOEFL Average
              </h3>
              <p className="text-3xl font-bold text-emerald-600">
                {averageToeflScore.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <TrendIcon trend={toeflOverallTrend} />
                <span className="ml-1">
                  {toeflOverallTrend === "up"
                    ? "Improving"
                    : toeflOverallTrend === "down"
                    ? "Needs focus"
                    : "Stable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IELTS Category Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">
          IELTS Skills Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ieltsAverages).map(([category, score]) => (
            <div
              key={category}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h5 className="text-sm font-medium text-gray-600 capitalize mb-2">
                {category}
              </h5>
              <p className="text-xl font-bold text-gray-800">
                {score.toFixed(1)}
              </p>

              {/* Progress bar for IELTS (0-9 scale) */}
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(score / 9) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOEFL Category Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">
          TOEFL Skills Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(toeflAverages).map(([category, score]) => (
            <div
              key={category}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h5 className="text-sm font-medium text-gray-600 capitalize mb-2">
                {category.replace("_", " ")}
              </h5>
              <p className="text-xl font-bold text-gray-800">
                {score.toFixed(1)}
              </p>

              {/* Progress bar for TOEFL (0-4 scale) */}
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(score / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {sessions.length}
            </p>
            <p className="text-sm text-gray-600">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {sessions.length > 0
                ? Math.max(...sessions.map((s) => s.ieltsScore)).toFixed(1)
                : "0.0"}
            </p>
            <p className="text-sm text-gray-600">Best IELTS</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {latestSession
                ? new Date(latestSession.date).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Last Practice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 5: Update TipsForImprovement Component

Update `components/dashboard/TipsForImprovement.tsx`:

```tsx
import React from "react";
import { TransformedDashboardSession } from "@/types/types";

interface TipsForImprovementProps {
  sessions: TransformedDashboardSession[];
}

export default function TipsForImprovement({
  sessions,
}: TipsForImprovementProps) {
  // Get tips from the most recent sessions (last 3)
  const recentSessions = sessions.slice(0, 3);

  // Collect all positive and negative feedback
  const collectFeedback = () => {
    const positivePoints: string[] = [];
    const negativePoints: string[] = [];

    recentSessions.forEach((session) => {
      if (session.feedback.positivePoints) {
        positivePoints.push(...session.feedback.positivePoints);
      }
      if (session.feedback.negativePoints) {
        negativePoints.push(...session.feedback.negativePoints);
      }
    });

    // Remove duplicates and limit to most relevant
    return {
      strengths: [...new Set(positivePoints)].slice(0, 3),
      improvements: [...new Set(negativePoints)].slice(0, 4),
    };
  };

  const feedback = collectFeedback();

  // Identify weakest areas for focus (both IELTS and TOEFL)
  const getWeakestAreas = () => {
    if (sessions.length === 0) return [];

    // Calculate averages for both IELTS and TOEFL
    const ieltsAverages = {
      fluency:
        sessions.reduce((sum, s) => sum + s.scores.fluency, 0) /
        sessions.length,
      vocabulary:
        sessions.reduce((sum, s) => sum + s.scores.vocabulary, 0) /
        sessions.length,
      grammar:
        sessions.reduce((sum, s) => sum + s.scores.grammar, 0) /
        sessions.length,
      pronunciation:
        sessions.reduce((sum, s) => sum + s.scores.pronunciation, 0) /
        sessions.length,
    };

    const toeflAverages = {
      delivery:
        sessions.reduce((sum, s) => sum + s.scores.delivery, 0) /
        sessions.length,
      language_use:
        sessions.reduce((sum, s) => sum + s.scores.language_use, 0) /
        sessions.length,
      topic_development:
        sessions.reduce((sum, s) => sum + s.scores.topic_development, 0) /
        sessions.length,
    };

    // Get lowest scoring areas
    const ieltsWeak = Object.entries(ieltsAverages)
      .filter(([, score]) => score > 0) // Only include areas with scores
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([category]) => `IELTS ${category}`);

    const toeflWeak = Object.entries(toeflAverages)
      .filter(([, score]) => score > 0) // Only include areas with scores
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([category]) => `TOEFL ${category.replace("_", " ")}`);

    return [...ieltsWeak, ...toeflWeak].slice(0, 3);
  };

  const weakestAreas = getWeakestAreas();

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tips for Improvement
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">
            Complete a practice session to get personalized tips!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Personalized Tips
      </h2>

      {/* Your Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <span className="mr-2">💪</span>
            Your Strengths
          </h3>
          <div className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <p className="text-sm text-gray-700">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas to Focus On */}
      {weakestAreas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Focus Areas
          </h3>
          <div className="space-y-2">
            {weakestAreas.map((area, index) => (
              <div key={index} className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-700">{area}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Consider extra practice in this area
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.improvements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            AI Feedback for Improvement
          </h3>
          <div className="space-y-2">
            {feedback.improvements.map((tip, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">
            🌟 Keep practicing regularly to see continuous improvement!
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Update PracticeHistory Component

Update `components/dashboard/PracticeHistory.tsx`:

```tsx
import React, { useState } from "react";
import Link from "next/link";
import { TransformedDashboardSession } from "@/types/types";

interface PracticeHistoryProps {
  sessions: TransformedDashboardSession[];
  onRefresh?: () => void;
}

export default function PracticeHistory({
  sessions,
  onRefresh,
}: PracticeHistoryProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600 bg-green-100";
    if (score >= 5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Fair";
    return "Needs Improvement";
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Practice History</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No practice sessions yet</p>
          <Link
            href="/levels"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Your First Session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Practice History</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div
            key={session.sessionId}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
          >
            {/* Session Header */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        session.overallScore
                      )}`}
                    >
                      {session.overallScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {session.level}
                    </h3>
                    <p className="text-sm text-gray-600">{session.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${getScoreColor(
                      session.overallScore
                    )}`}
                  >
                    {getScoreLabel(session.overallScore)}
                  </span>
                  <button
                    onClick={() => toggleExpanded(session.sessionId)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedSession === session.sessionId ? "▼" : "▶"}
                  </button>
                </div>
              </div>

              {/* Quick Scores */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {Object.entries(session.scores).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs text-gray-500 capitalize">
                      {category}
                    </p>
                    <p className="text-sm font-semibold">{score.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedSession === session.sessionId && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positive Feedback */}
                  {session.feedback.positivePoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">
                        ✅ Strengths
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {session.feedback.positivePoints
                          .slice(0, 3)
                          .map((point, idx) => (
                            <li key={idx}>• {point}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvement Areas */}
                  {session.feedback.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-600 mb-2">
                        🎯 Areas to Improve
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {session.feedback.improvements
                          .slice(0, 3)
                          .map((point, idx) => (
                            <li key={idx}>• {point}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Session ID: {session.sessionId}
                  </div>
                  <div className="space-x-2">
                    <Link
                      href={`/results/${session.sessionId}`}
                      className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                    >
                      View Full Results
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button (if many sessions) */}
      {sessions.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors">
            Show More Sessions
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Your Dashboard

### Step 7: Test the Complete Flow

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Complete a practice session:**

   - Go to `/levels`
   - Choose a level and complete a session
   - Check that it saves to database

3. **Visit the dashboard:**

   - Go to `/dashboard`
   - Verify it loads your real session data
   - Check that all components show real information

4. **Test error handling:**
   - Try accessing dashboard without being logged in
   - Check network tab for API calls

### Step 8: Common Issues and Solutions

**Issue: "Unauthorized" error**

```tsx
// Solution: Make sure you're logged in with Supabase
// Check that the user session is valid
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  // Redirect to login page
  window.location.href = "/auth/login";
}
```

**Issue: No data showing**

```tsx
// Check the console for errors
// Verify database has data:
console.log("Dashboard data:", dashboardData);
```

**Issue: Loading forever**

```tsx
// Add timeout to fetch:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const response = await fetch("/api/user-sessions", {
  signal: controller.signal,
  credentials: "include",
});
```

---

## Next Steps

Now your dashboard is fully functional with real data! You can:

1. **Add more analytics** (weekly/monthly trends)
2. **Add filtering** (by date, score, level)
3. **Add export functionality** (download results as PDF)
4. **Add goal setting** (target scores, practice frequency)
5. **Add comparison** (compare with other users anonymously)

Remember: Always test your changes and check both the console and network tab for any errors!
