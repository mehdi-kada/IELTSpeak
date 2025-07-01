interface TipsForImprovementProps {
  tips: string[];
}

export default function TipsForImprovement({ tips }: TipsForImprovementProps) {
  return (
    <div className="bg-[#2F2F7F]/50 border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 ">Tips for Improvement</h2>
      <ul className="space-y-3 list-disc list-inside text-gray-300">
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
