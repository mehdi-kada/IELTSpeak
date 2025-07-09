"use client";
import { SavedMessage } from "@/types/sessionTypes";
import React from "react";


interface MessageProps {
  message: SavedMessage;
}

/**
 * Message Component
 *
 * Purpose: Renders a single message in the transcript
 *
 * Features:
 * - Different styling for user vs assistant messages
 * - Icons for message types
 * - Responsive layout
 *
 * Best Practices:
 * - Single responsibility (renders one message)
 * - Conditional rendering based on message role
 * - Reusable component
 */
export default function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex items-start gap-4 ${
        message.role === "user" ? "justify-end" : ""
      }`}
    >
      {/* Assistant Avatar */}
      {message.role === "assistant" && (
        <div className="flex-shrink-0 h-10 w-10 bg-[#1a1a3a] rounded-full flex items-center justify-center border border-[#E62136]">
          <svg
            className="mx-auto h-6 w-6 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`p-4 max-w-xl ${
          message.role === "assistant"
            ? "bg-[#2F2F7F] rounded-r-xl rounded-bl-xl"
            : "bg-[#E62136] rounded-l-xl rounded-br-xl"
        }`}
      >
        <p>{message.content}</p>
      </div>

      {/* User Avatar */}
      {message.role === "user" && (
        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
