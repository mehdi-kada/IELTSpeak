"use client";
import React from "react";
import { SavedMessage } from "@/types/sessionTypes";
import Message from "../Message";

interface MessageListProps {
  messages: SavedMessage[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

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
