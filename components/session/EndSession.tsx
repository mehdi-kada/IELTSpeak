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
      className="bg-[#E91E63] hover:bg-[#E91E63] disabled:bg-[#E91E63]/20 disabled:cursor-not-allowed transition-colors text-white font-bold py-2 px-2 md:px-4 rounded-lg flex items-center gap-2 text-sm md:text-base"
    >
      {isSavingResults ? (
        <span className='text-gray-400'>Processing...</span>
      ) : (
        <span>End Session</span>
      )}
    </button>
  );
}