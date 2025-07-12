"use client";
import { SavedMessage } from "@/types/sessionTypes";
import React from "react";


interface MessageProps {
  message: SavedMessage;
}

export default function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex items-start gap-4 ${
        message.role === "user" ? "justify-end" : ""
      }`}
    >
      {/* Assistant Avatar */}
      {message.role === "assistant" && (
        <div className="flex-shrink-0 h-10 w-10 bg-[#1F2937] rounded-full flex items-center justify-center border ">
          <svg
            className="mx-auto h-6 w-6 text-[#E91E63]"
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
            ? "bg-[#374151] rounded-r-xl rounded-bl-xl"
            : "bg-[#E91E63] rounded-l-xl rounded-br-xl"
        }`}
      >
        <p>{message.content}</p>
      </div>

      {/* User Avatar */}
      {message.role === "user" && (
        <div className="flex-shrink-0 h-10 w-10 bg-[#374151] rounded-full flex items-center justify-center">
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
