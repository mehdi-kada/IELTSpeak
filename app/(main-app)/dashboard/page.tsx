"use client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverallScores } from "@/components/dashboard/OverallScores";
import { PracticeHistory } from "@/components/dashboard/PracticeHistory";
import StartNewSession from "@/components/dashboard/StartNewSession";
import TipsForImprovement from "@/components/dashboard/TipsForImprovement";
import { DashboardData } from "@/types/types";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/user-sessions", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        redirect("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.log("error while fetching data from database: ", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8 rounded-xl shadow-sm border border-red-600">
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
              <h3 className="text-xl font-semibold mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={checkUserAndFetchData}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    !dashboardData ||
    !dashboardData.sessions ||
    dashboardData.sessions.length === 0
  ) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            title="Welcome to Your Dashboard"
            description="Start practicing to see your progress and get personalized feedback."
          />
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center p-8 rounded-xl shadow-sm border border-red-600 max-w-md">
              <div className="text-red-600 mb-6">
                <svg
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold  mb-3">
                No Practice Sessions Yet
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Take your first practice test to get detailed feedback and track
                your improvement over time.
              </p>
              <StartNewSession href="/levels" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare sessions data for components
  const sessions = dashboardData.sessions.map((session) => ({
    id: session.id,
    date: session.date,
    level: session.level,
    ieltsScore: session.ieltsScore,
    toeflScore: session.toeflScore,
    resultsUrl: `/results/${session.id}`,
  }));

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center gap-2">
        <DashboardHeader
          title="Your Progress"
          description="Review your scores, practice history, and get tips for improvement."
        />
        <div>
          <StartNewSession href="/levls" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats and Tips */}
        <div className="lg:col-span-1 space-y-8">
          <OverallScores
            ieltsAverage={dashboardData.averageIeltsScore}
            toeflAverage={dashboardData.averageToeflScore}
          />

          <TipsForImprovement
            tips={dashboardData.sessions[0]?.feedback?.positivePoints}
          />
        </div>

        {/* Right Column: Practice History */}
        <div className="lg:col-span-2">
          <PracticeHistory sessions={sessions} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
