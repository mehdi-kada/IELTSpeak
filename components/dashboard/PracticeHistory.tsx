import { PracticeHistoryProps } from "@/types/types";
import Link from "next/link";


export function PracticeHistory({ sessions }: PracticeHistoryProps) {
  return (
    <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl overflow-auto h-144">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-center">Practice History</h2>
      </div>
      <div className="divide-y divide-white/10">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex justify-between p-6 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center hover:bg-white/5 transition-colors"
          >
            <div>
              <p className="font-bold text-lg">Level  {session.level}</p>
              <p className="text-sm text-gray-400">{session.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400 ">Band</p>
                <p className="font-bold text-lg ">{session.ieltsScore}</p>
              </div>
              <Link
                href={session.resultsUrl}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Feedback
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
