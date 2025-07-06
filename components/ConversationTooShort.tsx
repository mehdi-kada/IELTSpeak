"use client";

import Link from "next/link";

export default function ConversationTooShort() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">

      <div className="w-24 h-24 bg-[#2F2F7F]/50 rounded-full flex items-center justify-center border-2 border-dashed border-white/20 mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-12 h-12 text-[#E62136]"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12c0 2.224 1.213 4.2 3.086 5.67l-1.167 3.5a.75.75 0 0 0 .966.966l3.5-1.167A9.01 9.01 0 0 0 12 20.25Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 12h.01M12 12h.01M14.25 12h.01"
          />
        </svg>
      </div>

      <div>
        <h1 className="text-4xl font-bold text-white">
          Conversation Too Short
        </h1>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          The AI needs a bit more to work with. Please try again and speak for a
          little longer to get an accurate score and feedback.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard"
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/levels"
          className="bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
        >
          Try Again
        </Link>
      </div>
    </main>
  );
}
