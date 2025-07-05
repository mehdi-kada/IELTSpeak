"use client";

import { EvaluationData } from "@/types/types";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/Loading";
import { useRouter } from "next/router";

function Practice() {
  const params = useParams();
  const sessionId = params.sessionID as string;

  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadEvaluationData = () => {
      try {
        const storedData = localStorage.getItem(`evaluation_${sessionId}`);
        if (storedData) {
          setEvaluationData(JSON.parse(storedData));
          setLoading(false);
          console.log("fetched Data from localStorage ");
          return;
        }
        fetchFromDatabase();
      } catch (error) {
        console.error("Error loading evaluation data:", error);
        setError("Failed to load evaluation data");
        setLoading(false);
      }
    };

    const fetchFromDatabase = async () => {
      try {
        const res = await fetch(`/api/results/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setEvaluationData(data);
          console.log("fetched data from data base");
        } else {
          setError("No evaluation data found in database for that session");
        }
      } catch (error) {
        setError("Failed to fetch evaluation data");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadEvaluationData();
    }
  }, [sessionId]);

  // Helper function to calculate progress bar width
  const getProgressWidth = (score: number, maxScore: number = 9) => {
    return (score / maxScore) * 100;
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return router.push("/too-short");
  }

  // No data state
  if (!evaluationData) {
    return (
      <div className="bg-[#1a1a3a] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">No Results Available</h2>
          <p className="text-gray-400 mb-6">
            No evaluation data found for this session.
          </p>
          <Link
            href="/dashboard"
            className="bg-[#E62136] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#1a1a3a] text-white min-h-screen"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Main Content Area */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold">Session Feedback</h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Here's a detailed breakdown of your performance for the "
            {evaluationData.level}" session.
          </p>
        </header>

        {/* Scores Section */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#2F2F7F] border border-white/10 rounded-2xl p-6 w-full max-w-4xl">
            <h2 className=" text-3xl sm:text-center font-bold mb-6">
              IELTS Results
            </h2>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-[#E62136]">
                  {evaluationData.evaluation.ielts_ratings.overall}
                </p>
                <span className="font-medium text-gray-300">Overall</span>
              </div>
              <div className="w-full sm:w-auto">
                <Link
                  href="/levels"
                  className="block w-full sm:w-auto text-center bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px text-white font-bold py-3 px-4 sm:px-6 rounded-lg transition-all whitespace-nowrap"
                >
                  Start a New Session
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold w-24 sm:w-32 text-sm sm:text-base">
                  Fluency
                </span>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div
                    className="bg-[#E62136] h-3 rounded-full"
                    style={{
                      width: `${getProgressWidth(
                        evaluationData.evaluation.ielts_ratings.fluency
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="font-bold text-sm sm:text-base w-8 sm:w-10 text-right">
                  {evaluationData.evaluation.ielts_ratings.fluency}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold w-24 sm:w-32 text-sm sm:text-base">
                  Vocabulary
                </span>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div
                    className="bg-[#E62136] h-3 rounded-full"
                    style={{
                      width: `${getProgressWidth(
                        evaluationData.evaluation.ielts_ratings.vocabulary
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="font-bold text-sm sm:text-base w-8 sm:w-10 text-right">
                  {evaluationData.evaluation.ielts_ratings.vocabulary}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold w-24 sm:w-32 text-sm sm:text-base">
                  Grammar
                </span>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div
                    className="bg-[#E62136] h-3 rounded-full"
                    style={{
                      width: `${getProgressWidth(
                        evaluationData.evaluation.ielts_ratings.grammar
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="font-bold text-sm sm:text-base w-8 sm:w-10 text-right">
                  {evaluationData.evaluation.ielts_ratings.grammar}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold w-24 sm:w-32 text-sm sm:text-base">
                  Pronunciation
                </span>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div
                    className="bg-[#E62136] h-3 rounded-full"
                    style={{
                      width: `${getProgressWidth(
                        evaluationData.evaluation.ielts_ratings.pronunciation
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="font-bold text-sm sm:text-base w-8 sm:w-10 text-right">
                  {evaluationData.evaluation.ielts_ratings.pronunciation}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Consolidated Feedback Section */}
        <div className="mt-10">
          {" "}
          {/* Add top margin to separate sections */}
          <h2 className="text-3xl font-bold text-center mb-8">
            Overall Performance Feedback
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Positives */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-400">
                  What Went Well
                </h3>
              </div>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                {evaluationData.evaluation.feedback.positives.map(
                  (positive, index) => (
                    <li key={index}>{positive}</li>
                  )
                )}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-500/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-yellow-400">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                {evaluationData.evaluation.feedback.negatives.map(
                  (negative, index) => (
                    <li key={index}>{negative}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Review and Continue */}
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-center mb-4">
            Review and Continue
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Print Results
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Practice;
