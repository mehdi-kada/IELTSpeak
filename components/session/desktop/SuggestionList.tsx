"use client";
import React from "react";
import LoadingSpinner from "@/components/Loading";

interface SuggestionsListProps {
  suggestionStatus: "waiting" | "generating" | "ready";
  suggestions: string[];
  streamedResponse: string;
}

export default function SuggestionsList({
  suggestionStatus,
  suggestions,
  streamedResponse,
}: SuggestionsListProps) {
  console.log("suggestions : ", suggestions);
  if (suggestionStatus === "waiting") {
    return (
      <div className="bg-[#374151] p-4 rounded-lg border border-transparent text-center">
        <h4 className="font-bold text-gray-400 mb-2">
          Waiting for conversation to start...
        </h4>
        <p className="text-sm text-gray-500">
          Once the conversation starts you will get suggestions on what to say
          next
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
          <div className="bg-[#374151] p-4 rounded-lg border border-[#E91E63] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#E91E63] rounded-full mt-2 flex-shrink-0 animate-pulse" />
              <p className="text-md text-gray-300">{streamedResponse}</p>
            </div>
          </div>
        )}

        {/* Show previous suggestions */}
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-[#374151] p-4 rounded-lg border border-transparent hover:border-[#E91E63] transition-colors"
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

  if (suggestions.length > 0) {
    return (
      <>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-[#374151] p-4 rounded-lg border border-transparent hover:border-[#E91E63] transition-colors"
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

  return (
    <div className="bg-[#374151] p-4 rounded-lg border border-transparent text-center">
      <h4 className="font-bold text-gray-300">No suggestions available</h4>
    </div>
  );
}
