import { SavedMessage } from "@/types/sessionTypes";
import React from "react";



interface MobileTranscriptPanelProps {
  messages: SavedMessage[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

function MobileMessageList({
  messagesContainerRef,
  messages,
}: MobileTranscriptPanelProps) {
  return (
    <div className="flex flex-col p-4 overflow-hidden h-full">
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
            .reverse()
            .map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
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
                <div
                  className={`p-4 max-w-xl ${
                    message.role === "assistant"
                      ? "bg-[#2F2F7F] rounded-r-xl rounded-bl-xl"
                      : "bg-[#E62136] rounded-l-xl rounded-br-xl"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
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
            ))
        )}
      </div>
    </div>
  );
}

export default MobileMessageList;
