import { PracticeHistoryProps } from "@/types/types";
import Link from "next/link";

export function PracticeHistory({ sessions }: PracticeHistoryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 5.5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[#1F2937] rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Practice History</h2>
        <span className="text-sm text-gray-400">{sessions.length} sessions</span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <Link key={session.id} href={session.resultsUrl}>
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#E91E63] hover:shadow-md transition-all duration-200 cursor-pointer bg-[#374151]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#E91E63] rounded-full"></div>
                  <span className="font-medium text-white">Level {session.level}</span>
                </div>
                <span className="text-sm text-gray-400">{formatDate(session.date)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">IELTS Band Score</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(session.ieltsScore)}`}>
                  {session.ieltsScore.toFixed(1)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p>No practice sessions yet</p>
        </div>
      )}
    </div>
  );
}
