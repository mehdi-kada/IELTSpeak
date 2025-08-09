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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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
    return (
      <div className="min-h-screen bg-[#374151] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Dashboard</title>
        </Head>
        <div className="min-h-screen bg-[#374151] flex items-center justify-center p-4">
          <div className="bg-[#1F2937] rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-300 mb-6">If this error persists, please contact us</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!dashboardData || !dashboardData.sessions || dashboardData.sessions.length === 0) {
    return (
      <>
        <Head>
          <title>Dashboard</title>
        </Head>
        <div className="min-h-screen bg-[#374151] flex items-center justify-center p-4">
          <div className="bg-[#1F2937] rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-[#E91E63]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#E91E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">No Practice Sessions Yet</h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Take your first practice test to get detailed feedback and track your improvement over time.
              </p>
            </div>
            <Link href="/practice">
              <button className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                Start New Session
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

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
      </Head>
      <div className="min-h-screen bg-[#374151]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Your IELTS Dashboard</h1>
            <p className="text-gray-300 text-lg">Track your progress and improve your English skills</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Stats and Tips */}
            <div className="lg:col-span-2 space-y-8">
              <OverallScores
                ieltsAverage={dashboardData.averageIeltsScore}
                averageFluency={dashboardData.averageFluency}
                averageGrammar={dashboardData.averageGrammar}
                averageVocab={dashboardData.averageVocab}
                averagePronunciation={dashboardData.averagePronunciation}
              />
              
              <TipsForImprovement tips={dashboardData.sessions[0].feedback.negativePoints} />
            </div>

            {/* Right Column: Practice History */}
            <div className="lg:col-span-1">
              <PracticeHistory sessions={sessions} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
