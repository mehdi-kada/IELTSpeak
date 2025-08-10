interface TipsForImprovementProps {
  tips: string[];
}

export default function TipsForImprovement({ tips }: TipsForImprovementProps) {
  return (
  <div className="bg-[#374151] rounded-2xl shadow-xl p-8">
      <div className="flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="40" height="40" id="Lamp">
          <path d="M45.287 47.524c6.339-6.295 10.629-18.074 10.629-25.67C55.916 10.873 46.98 1.938 36 1.938c-10.981 0-19.916 8.935-19.916 19.916 0 7.676 4.219 19.235 10.508 25.55a5.985 5.985 0 0 0-2.222 4.658v10a6 6 0 0 0 6 6h1.358c.445 1.064 1.305 2 2.596 2h2.895c1.291 0 2.235-.936 2.738-2h1.413a6 6 0 0 0 6-6v-10a5.979 5.979 0 0 0-2.083-4.538zM28.45 62.593a1.98 1.98 0 0 1-.08-.53v-4.255l14.861-6.464c.087.224.139.465.139.719v4.04l-14.92 6.49zm1.92-12.53h10.794L28.37 55.627v-3.564a2 2 0 0 1 2-2zM20.084 21.854c0-8.776 7.14-15.916 15.916-15.916 8.775 0 15.916 7.14 15.916 15.916 0 7.314-4.605 19.146-10.771 24.033l.14.176h-10.19c-6.211-4.702-11.011-16.821-11.011-24.209zM41.37 64.063h-11c-.08 0-.155-.015-.233-.023l13.233-5.756v3.779a2 2 0 0 1-2 2z" fill="#e91e63" stroke="#e91e63" strokeWidth="1" className="color000000 svgShape"></path>
          <path d="M36.271 23.062c.27 0 .52-.11.709-.29.181-.19.291-.45.291-.71s-.11-.521-.291-.71c-.369-.37-1.049-.37-1.419 0-.181.189-.29.439-.29.71 0 .27.109.52.29.71.189.18.45.29.71.29zM36.37 25.062a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1zM32.165 32.112a.999.999 0 0 0 .707-1.707l-2.726-2.726a.999.999 0 1 0-1.414 1.414l2.726 2.726a.997.997 0 0 0 .707.293zM40.539 32.112a.997.997 0 0 0 .707-.293l2.727-2.726a.999.999 0 1 0-1.414-1.414l-2.727 2.726a.999.999 0 0 0 .707 1.707z" fill="#e91e63" stroke="#e91e63" strokeWidth="1" className="color000000 svgShape"></path>
        </svg>
        <h2 className="text-2xl font-bold text-white ml-3">Tips for Improvement</h2>
      </div>

      {tips.length > 0 ? (
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-[#1F2937] rounded-lg border-l-4 border-[#E91E63]">
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
