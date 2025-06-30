interface OverallScoresProps {
  ieltsAverage: number;
}

export function OverallScores({ ieltsAverage }: OverallScoresProps) {
  return (
    <div className="bg-[#2F2F7F] border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Overall Scores</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">IELTS Average</span>
          <span className="text-2xl font-bold text-[#E62136]">
            {Math.round(ieltsAverage * 2) / 2}
          </span>
        </div>
      </div>
    </div>
  );
}
