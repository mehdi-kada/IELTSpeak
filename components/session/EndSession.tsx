"use client";
import React from 'react';

interface EndSessionButtonProps {
  isSavingResults: boolean;
  onEndCall: () => void;
}


export default function EndSessionButton({
  isSavingResults,
  onEndCall
}: EndSessionButtonProps) {
  return (
    <button
      onClick={onEndCall}
      disabled={isSavingResults}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-white font-bold py-2 px-2 md:px-4 rounded-lg flex items-center gap-2 text-sm md:text-base"
    >
      {isSavingResults ? (
        <span>Processing...</span>
      ) : (
        <span>End Session</span>
      )}
    </button>
  );
}