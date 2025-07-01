interface OverallScoresProps {
  ieltsAverage: number;
  averageFluency: number;
  averageGrammar: number;
  averageVocab: number;
  averagePronunciation: number;
}

export function OverallScores({
  ieltsAverage,
  averageFluency,
  averageGrammar,
  averageVocab,
  averagePronunciation,
}: OverallScoresProps) {
  return (
    <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4 text-white ">Overall Band</h2>
        <span className="text-2xl font-bold text-white">
          {Math.round(ieltsAverage * 2) / 2}
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Fluency</span>
          <span className="text-xl font-bold text-[#ffffff]">
            {Math.round(averageFluency * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Grammar</span>
          <span className="text-xl font-bold text-[#ffffff]">
            {Math.round(averageGrammar * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Vocabulary</span>
          <span className="text-xl font-bold text-[#f1eced]">
            {Math.round(averageVocab * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Pronunciation</span>
          <span className="text-xl font-bold text-[#f0ebeb]">
            {Math.round(averagePronunciation * 2) / 2}
          </span>
        </div>
      </div>
    </div>
  );
}
