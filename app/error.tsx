"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    <div className="bg-[#1a1a3a] text-white min-h-screen flex flex-col items-center justify-center p-4 text-center font-[Inter]">
      {/* Glitch Effect Error Code */}
      <h1 className="text-9xl font-black glitch relative select-none mb-4">
        Error
        <span
          aria-hidden
          className="absolute left-0 top-0 w-full h-full glitch-before"
        >
          Error
        </span>
        <span
          aria-hidden
          className="absolute left-0 top-0 w-full h-full glitch-after"
        >
          Error
        </span>
      </h1>

      {/* Page Title and Description */}
      <div className="mt-8">
        <h2 className="text-4xl font-bold text-white">
          Oops! Something Went Wrong
        </h2>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          We&apos;ve encountered an unexpected issue. Please try again, or
          contact support if the problem persists.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 flex-wrap justify-center">
        <a
          href="/"
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Go Back Home
        </a>
        <button
          onClick={() => reset()}
          className="bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
