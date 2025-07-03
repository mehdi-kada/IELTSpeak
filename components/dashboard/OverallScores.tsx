import Link from "next/link";

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Fluency</span>
          <span className="text-lg font-bold text-[#ffffff]">
            {Math.round(averageFluency * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Grammar</span>
          <span className="text-lg font-bold text-[#ffffff]">
            {Math.round(averageGrammar * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Vocabulary</span>
          <span className="text-lg font-bold text-[#f1eced]">
            {Math.round(averageVocab * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-300">Pronunciation</span>
          <span className="text-lg font-bold text-[#f0ebeb]">
            {Math.round(averagePronunciation * 2) / 2}
          </span>
        </div>
        <div className="flex justify-between ">
          <h2 className="text-xl font-bold mb-4 text-red-600  ">
            Overall Band
          </h2>
          <span className="text-3xl font-bold text-red-600 text-center">
            {Math.round(ieltsAverage * 2) / 2}
          </span>
        </div>
        <div className="">
          <Link
            href={"/levels"}
            className="block w-full text-center bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px transition-all duration-200 text-white font-bold py-2 px-2 rounded-lg"
          >
            Start New Session
          </Link>
        </div>
      </div>
    </div>
  );
}
