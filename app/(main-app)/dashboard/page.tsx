import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverallScores } from "@/components/dashboard/OverallScores";
import { TipsForImprovement } from "@/components/dashboard/TipsForImprovement";
import { StartNewSession } from "@/components/dashboard/StartNewSession";
import { PracticeHistory } from "@/components/dashboard/PracticeHistory";

function Dashboard() {
  // Sample data - replace with actual data from your API/database
  const overallScores = {
    ieltsAverage: 7.5,
    toeflAverage: 105,
  };

  const improvementTips = [
    "Try to use a wider range of vocabulary. Avoid repeating the same words.",
    'Focus on your fluency by reducing pauses and filler words like "um" or "ah".',
    "Expand on your answers more. Give reasons and examples to support your points.",
  ];

  const practiceSessionsData = [
    {
      id: "1",
      title: "IELTS Speaking Part 2",
      date: "June 12, 2025",
      ieltsScore: 7.0,
      toeflScore: 98,
      transcriptUrl: "/results/session-1",
    },
    {
      id: "2",
      title: "General Conversation",
      date: "June 10, 2025",
      ieltsScore: 8.0,
      toeflScore: 110,
      transcriptUrl: "/results/session-2",
    },
    {
      id: "3",
      title: "TOEFL Integrated Task",
      date: "June 8, 2025",
      ieltsScore: 7.5,
      toeflScore: 108,
      transcriptUrl: "/results/session-3",
    },
    {
      id: "4",
      title: "IELTS Speaking Part 1",
      date: "June 5, 2025",
      ieltsScore: 7.0,
      toeflScore: 100,
      transcriptUrl: "/results/session-4",
    },
  ];

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center gap-2">
        <DashboardHeader
          title="Your Progress"
          description="Review your scores, practice history, and get tips for improvement."
        />
        <div >
          <StartNewSession href="/practice" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats and Tips */}
        <div className="lg:col-span-1 space-y-8">
          <OverallScores
            ieltsAverage={overallScores.ieltsAverage}
            toeflAverage={overallScores.toeflAverage}
          />

          <TipsForImprovement tips={improvementTips} />
        </div>

        {/* Right Column: Practice History */}
        <div className="lg:col-span-2">
          <PracticeHistory sessions={practiceSessionsData} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
