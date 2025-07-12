"use client";
import { AIAgentStatusProps, CallStatus } from "@/types/sessionTypes";
import React from "react";

export default function AIAgentStatus({
  callStatus,
  isSpeaking,
  level,
  sessionTime,
}: AIAgentStatusProps) {
  // Helper function for time formatting
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Helper function for status text
  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.ACTIVE:
        return isSpeaking ? "AI is speaking" : "Your turn to speak";
      case CallStatus.FINISHED:
        return "Session ended";
      default:
        return "Ready to start";
    }
  };

  return (
    <div className="h-1/4 min-h-[200px] flex-shrink-0 bg-[#1F2937] p-4 text-center flex flex-col items-center justify-center border-b border-white/10 relative">
      {/* AI Agent Visual Indicator */}
      <div className="relative inline-flex items-center justify-center w-28 h-28 mx-auto">
        <div
          className={`absolute w-full h-full bg-[#E91E63]/50 rounded-full ${
            isSpeaking ? "animate-pulse" : ""
          }`}
        />
        <div className="relative w-24 h-24 bg-[#1F2937] rounded-full flex items-center justify-center">
          <p className="font-bold text-2xl text-[#E91E63]">{level}</p>
        </div>
      </div>

      {/* Status Text */}
      <p className="text-xl font-bold mt-4">{getStatusText()}</p>

      {/* Session Timer */}
      <p className="text-gray-400 text-sm">
        Session Timer: {formatTime(sessionTime)}
      </p>
    </div>
  );
}
