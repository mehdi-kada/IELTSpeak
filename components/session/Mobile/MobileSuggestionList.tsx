import LoadingSpinner from "@/components/Loading";
import React from "react";

interface MobileSuggestionsPanelProps {
  suggestionStatus: "waiting" | "generating" | "ready";
  streamedResponse: string | null;
  suggestions: string[];
}

function MobileSuggestionList({
  suggestionStatus,
  streamedResponse,
  suggestions,
}: MobileSuggestionsPanelProps) {
  return (
    <div className="flex flex-col p-4 bg-black/10 overflow-hidden h-full">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Real-time Suggestions</h2>
      </div>
      {!streamedResponse && suggestionStatus === "generating" && (
        <LoadingSpinner size="sm" fullScreen={false} message="" />
      )}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {suggestionStatus === "waiting" ? (
          <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
            <h4 className="font-bold text-gray-400 mb-2">
              Waiting for conversation to start...
            </h4>
            <p className="text-sm text-gray-500">
              Start speaking to get AI-powered suggestions
            </p>
          </div>
        ) : suggestionStatus === "generating" ? (
          <div>
            {/* Show current streaming suggestion if available */}
            {streamedResponse && (
              <div className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-red-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
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
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-md text-gray-300">{suggestion}</p>
                </div>
              </div>
            ))}
            {/* Show generating indicator if no streaming response yet */}
          </div>
        ) : suggestions.length > 0 ? (
          /* Show all suggestions when ready or waiting */
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 ${index === 0 ? "bg-red-500" : "bg-green-500"} rounded-full mt-2 flex-shrink-0`}
                ></div>
                <p className="text-md text-gray-300">{suggestion}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
            <h4 className="font-bold text-gray-400">
              No suggestions available
            </h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileSuggestionList;
