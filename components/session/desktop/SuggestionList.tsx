"use client";
import React from 'react';
import LoadingSpinner from '@/components/Loading';

interface SuggestionsListProps {
  suggestionStatus: "waiting" | "generating" | "ready";
  suggestions: string[];
  streamedResponse: string;
}

/**
 * SuggestionsList Component
 *
 * Purpose: Renders the list of AI-generated suggestions
 *
 * Features:
 * - Different states (waiting, generating, ready)
 * - Real-time streaming display
 * - Visual indicators for suggestion status
 *
 * Best Practices:
 * - State-based rendering
 * - Loading states
 * - Clear visual hierarchy
 */
export default function SuggestionsList({
  suggestionStatus,
  suggestions,
  streamedResponse
}: SuggestionsListProps) {

  if (suggestionStatus === "waiting") {
    return (
      <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
        <h4 className="font-bold text-gray-400 mb-2">
          Waiting for conversation to start...
        </h4>
        <p className="text-sm text-gray-500">
          Once the conversation starts you will get suggestions on what to say next
        </p>
      </div>
    );
  }

  if (suggestionStatus === "generating") {
    return (
      <>
        {/* Show loading spinner if no streamed response yet */}
        {!streamedResponse && (
          <LoadingSpinner size="sm" fullScreen={false} message="" />
        )}

        {/* Show current streaming suggestion */}
        {streamedResponse && (
          <div className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-red-600 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
              <p className="text-md text-gray-300">{streamedResponse}</p>
            </div>
          </div>
        )}

        {/* Show previous suggestions */}
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-md text-gray-300">{suggestion}</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Ready state or has suggestions
  if (suggestions.length > 0) {
    return (
      <>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 ${
                  index === 0 ? "bg-red-500" : "bg-green-500"
                } rounded-full mt-2 flex-shrink-0`}
              />
              <p className="text-md text-gray-300">{suggestion}</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  // No suggestions available
  return (
    <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
      <h4 className="font-bold text-gray-400">No suggestions available</h4>
    </div>
  );
}