interface TipsForImprovementProps {
  tips: string[];
}

export default function TipsForImprovement({ tips }: TipsForImprovementProps) {
  return (
    <div className="bg-[#1F2937] rounded-2xl shadow-xl p-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Tips for Improvement</h2>
      </div>

      {tips.length > 0 ? (
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-[#374151] rounded-lg border-l-4 border-[#E91E63]">
              <div className="flex-shrink-0 w-6 h-6 bg-[#E91E63] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p>Complete more practice sessions to get personalized tips</p>
        </div>
      )}
    </div>
  );
}
