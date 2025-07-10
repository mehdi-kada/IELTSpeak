"use client";

import { OverallScores } from "@/components/dashboard/OverallScores";
import { PracticeHistory } from "@/components/dashboard/PracticeHistory";
import TipsForImprovement from "@/components/dashboard/TipsForImprovement";
import LoadingSpinner from "@/components/Loading";
import { DashboardData } from "@/types/types";
import Head from "next/head";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
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
      setIsPremium(data.isPremium);
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
    return <LoadingSpinner message="loading history data..." />;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Dashboard</title>
          <meta
            name="description"
            content="View your IELTS speaking practice progress and performance analytics"
          />
        </Head>
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
      </>
    );
  }

  if (
    !dashboardData ||
    !dashboardData.sessions ||
    dashboardData.sessions.length === 0
  ) {
    return (
      <>
        <Head>
          <title>Dashboard</title>
          <meta
            name="description"
            content="View your IELTS speaking practice progress and performance analytics"
          />
        </Head>
        <div className="min-h-screen mt-8 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold ">
                Welcome to Your Dashboard
              </h1>
              <p className="text-gray-400 mt-1 ">
                Start practicing to see your progress and get personalized
                feedback.
              </p>
            </header>

            <div className="flex  items-center justify-center min-h-[50vh]">
              <div className="text-center bg-[#2F2F7F]/50 p-8 rounded-xl shadow-sm border border-white/10 max-w-md">
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
                  Take your first practice test to get detailed feedback and
                  track your improvement over time.
                </p>
                <Link
                  href={"/levels"}
                  className="block w-full text-center bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px transition-all duration-200 text-white font-bold py-2 px-2 rounded-lg"
                >
                  Start New Session
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // prepare sessions data for components
  const sessions = dashboardData.sessions.map((session) => ({
    id: session.id,
    date: session.date,
    level: session.level,
    ieltsScore: session.ieltsScore,
    resultsUrl: `/results/${session.id}`,
  }));

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta
          name="description"
          content="View your IELTS speaking practice progress and performance analytics"
        />
      </Head>
      <main className="container mx-auto  p-8 sm:p-6 lg:p-8">
        <div className="items-center gap-2 mb-8">
          <header
            className={`${
              isPremium
                ? "text-center"
                : "flex flex-col lg:flex-row lg:items-center lg:justify-between"
            }`}
          >
            <div className={`${isPremium ? "" : "text-center lg:text-left"}`}>
              <h1 className="text-3xl md:text-4xl font-bold">Your Progress</h1>
              <p className="text-gray-400 mt-1">
                Review your scores, exams history, and get tips for improvement.
              </p>
            </div>

            {/* Session Limit Warning - Only show for non-premium users */}
            {!isPremium && (
              <div className="mt-4 lg:mt-0 lg:ml-8 flex-shrink-0 flex justify-center lg:justify-end ">
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 max-w-xs ">
                  <div className="flex items-centeer gap-3">
                    <div className="text-red-500 flex-shrink-0 mt-0.5">
                      <svg
                        className="h-5 w-5"
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
                    <div>
                      <h3 className="text-sm font-semibold text-red-400 mb-1">
                        Free Plan Limit
                      </h3>
                      <p className="text-xs text-red-200/80 leading-relaxed">
                        You have{" "}
                        {Math.max(0, 3 - (dashboardData?.totalSessions || 0))}{" "}
                        of 3 free sessions remaining.
                      </p>
                      {dashboardData && dashboardData.totalSessions >= 3 && (
                        <Link
                          href="/subscribe"
                          className="inline-block mt-2 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          Upgrade Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats and Tips */}
          <div className="lg:col-span-1 space-y-8">
            <OverallScores
              ieltsAverage={dashboardData.averageIeltsScore}
              averageFluency={dashboardData.averageFluency}
              averageGrammar={dashboardData.averageGrammar}
              averageVocab={dashboardData.averageVocab}
              averagePronunciation={dashboardData.averagePronunciation}
            />

            <TipsForImprovement
              tips={dashboardData.sessions[0]?.feedback?.negativePoints}
            />
          </div>

          {/* Right Column: Practice History */}
          <div className="lg:col-span-2">
            <PracticeHistory sessions={sessions} />
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
