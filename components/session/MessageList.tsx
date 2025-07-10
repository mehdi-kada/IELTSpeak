"use client";
import React from "react";
import Message from "./Message";
import { SavedMessage } from "@/types/sessionTypes";

interface MessageListProps {
  messages: SavedMessage[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}
/**
 * MessageList Component
 *
 * Purpose: Renders the list of messages in the transcript
 *
 * Features:
 * - Scrollable container
 * - Empty state handling
 * - Reverse chronological order (newest first)
 *
 * Best Practices:
 * - List rendering with keys
 * - Empty state handling
 * - Ref forwarding for scroll control
 */
export default function MessageList({
  messages,
  messagesContainerRef,
}: MessageListProps) {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto pr-4 space-y-6 custom-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>Conversation will appear here once the session starts...</p>
        </div>
      ) : (
        messages
          .slice()
          .reverse() // Show newest messages first
          .map((message, index) => <Message key={index} message={message} />)
      )}
    </div>
  );
}
