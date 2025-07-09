"use client";
import { CallStatus } from '@/types/sessionTypes';
import React from 'react';


interface MuteButtonProps {
  isMuted: boolean;
  callStatus: CallStatus;
  onToggle: () => void;
  vapiRef: React.RefObject<any>;
}

export default function MuteButton({
  isMuted,
  callStatus,
  onToggle,
  vapiRef
}: MuteButtonProps) {
  const isDisabled = !vapiRef.current || callStatus === CallStatus.INACTIVE;

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`${isMuted ? "bg-red-600" : "bg-white/10"} ${
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white/20"
      } p-2 rounded-full transition-colors`}
      aria-label="Mute Microphone"
      title={
        isDisabled
          ? "Microphone will be available when session starts"
          : isMuted
            ? "Unmute microphone"
            : "Mute microphone"
      }
    >
      {isMuted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
          />
        </svg>
      )}
    </button>
  );
}