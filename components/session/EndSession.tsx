"use client";
import React, { memo } from 'react';

interface EndSessionButtonProps {
  isSavingResults: boolean;
  onEndCall: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * End Session Button Component
 * Provides user feedback during session termination process
 * Memoized to prevent unnecessary re-renders
 */
const EndSessionButton = memo<EndSessionButtonProps>(({
  isSavingResults,
  onEndCall,
  disabled = false,
  className = "",
}) => {
  const isDisabled = isSavingResults || disabled;

  return (
    <button
      onClick={onEndCall}
      disabled={isDisabled}
      className={`
        bg-[#E91E63] hover:bg-[#E91E63] 
        disabled:bg-[#E91E63]/20 disabled:cursor-not-allowed 
        transition-colors text-white font-bold py-2 px-2 md:px-4 
        rounded-lg flex items-center gap-2 text-sm md:text-base
        focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2
        ${className}
      `}
      aria-label={isSavingResults ? "Processing session results" : "End current session"}
    >
      {isSavingResults ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className='text-gray-200'>Processing...</span>
        </>
      ) : (
        <span>End Session</span>
      )}
    </button>
  );
});

EndSessionButton.displayName = 'EndSessionButton';

export default EndSessionButton;