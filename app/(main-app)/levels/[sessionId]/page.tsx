"use client";
import LoadingSpinner from "@/components/Loading";
import AIAgentStatus from "@/components/session/AIAgentStatus";
import MessageList from "@/components/session/MessageList";
import SessionNavigation from "@/components/session/SessionNav";
import SuggestionsList from "@/components/session/desktop/SuggestionList";
import { useAuth } from "@/hooks/sessions/useAuth";
import { useUserProfile } from "@/hooks/sessions/useProfileData";
import { useSessionRating } from "@/hooks/sessions/useSessionRating";
import { useSessionTimer } from "@/hooks/sessions/useSessionTimer";
import { useSuggestions } from "@/hooks/sessions/useSuggestions";
import { useVapi } from "@/hooks/sessions/useVapi";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

function Session() {
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;
  const suggestionsContainerRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;

  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const level = searchParams.get("level") || "6.5";
  const route = useRouter();

  // get the user id
  const { userId, loading: authLoading, error: authError } = useAuth();

  // getting profile data either from localstorage or database
  const {
    profileData,
    loading: profileDataLoading,
    error,
  } = useUserProfile(userId);

  // for updating session and processing conversation
  const { isSavingResults, sendConversationToAPI } = useSessionRating();
  // streamed suggestions from gemini , use the function inside the messages webhook
  const {
    suggestions,
    streamedResponse,
    suggestionStatus,
    generateSuggestion,
  } = useSuggestions();

  // Vapi setup + cleanup
  const {
    callStatus,
    isSpeaking,
    messages,
    isMuted,
    loading: vapiLoading,
    vapiRef,
    toggleMicrophone,
    endCall,
  } = useVapi(
    userId,
    profileData,
    level,
    sessionId,
    suggestions,
    generateSuggestion
  );

  const sessionTime = useSessionTimer(callStatus);
  // ref for scrolling to the top of the messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Handle end call with conversation evaluation
  const handleEndCall = async () => {
    try {
      endCall();
      if (messages.length > 5) {
        await sendConversationToAPI(sessionId, messages);
        console.log("Evaluation completed successfully");
        route.push(`/results/${sessionId}`);
      } else {
        window.location.href = "/too-short";
        return;
      }
    } catch (error) {
      console.error("Failed to get evaluation:", error);
      if (messages.length > 5) {
        route.push(`/results/${sessionId}`);
      } else {
        window.location.href = "/too-short";
      }
    }
  };

  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
      {/* Session Navigation */}
      <SessionNavigation
        isMuted={isMuted}
        callStatus={callStatus}
        level={level}
        isSavingResults={isSavingResults}
        onToggleMicrophone={toggleMicrophone}
        onEndCall={handleEndCall}
        vapiRef={vapiRef}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Section: AI Agent Status */}
        <AIAgentStatus
          callStatus={callStatus}
          isSpeaking={isSpeaking}
          level={level}
          sessionTime={sessionTime}
        />

        {/* Bottom Section: Suggestions and Transcript */}
        <div className="flex-grow flex flex-col sm:flex-row overflow-hidden">
          {/* Mobile Tabs - only show on screens smaller than sm */}
          <div className="sm:hidden flex border-b border-white/10">
            <button
              onClick={() => setSuggestionsVisible(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                suggestionsVisible
                  ? "bg-[#2F2F7F] text-white border-b-2 border-red-600"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setSuggestionsVisible(false)}
              className={`flex-1 py-3 px-4 text-sm  font-medium transition-colors ${
                !suggestionsVisible
                  ? "bg-[#2F2F7F] text-white border-b-2 border-[#E62136]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Transcript
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex flex-grow overflow-hidden">
            {/* Suggestions Panel - Desktop */}
            <div className="w-1/3 flex flex-col overflow-hidden">
              <div
                className={`${
                  suggestionsVisible ? "flex" : "hidden sm:flex"
                } flex-col p-4 bg-black/10 overflow-hidden border-r border-white/10 h-full`}
              >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Real-time Suggestions
                  </h2>
                </div>
                <div
                  ref={suggestionsContainerRef}
                  className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow"
                >
                  <SuggestionsList
                    suggestionStatus={suggestionStatus}
                    suggestions={suggestions}
                    streamedResponse={streamedResponse}
                  />
                </div>
              </div>
            </div>

            {/* Transcript Panel - Desktop */}
            <div className="w-2/3 flex flex-col p-4 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 flex-shrink-0">
                Live Transcript
              </h2>
              <MessageList
                messages={messages}
                messagesContainerRef={messagesContainerRef}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden flex-grow overflow-hidden">
            {/* Mobile Suggestions Panel */}
            {suggestionsVisible && (
              <div className="flex flex-col p-4 bg-black/10 overflow-hidden h-full">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h2 className="text-xl font-bold">Real-time Suggestions</h2>
                </div>
                {!streamedResponse && suggestionStatus === "generating" && (
                  <LoadingSpinner size="sm" fullScreen={false} message="" />
                )}
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                  {suggestionStatus === "waiting" ? (
                    <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
                      <h4 className="font-bold text-gray-400 mb-2">
                        Waiting for conversation to start...
                      </h4>
                      <p className="text-sm text-gray-500">
                        Start speaking to get AI-powered suggestions
                      </p>
                    </div>
                  ) : suggestionStatus === "generating" ? (
                    <>
                      {/* Show current streaming suggestion if available */}
                      {streamedResponse && (
                        <div className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-red-600 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                            <p className="text-md text-gray-300">
                              {streamedResponse}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Show previous suggestions */}
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-md text-gray-300">
                              {suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Show generating indicator if no streaming response yet */}
                     
                    </>
                  ) : suggestions.length > 0 ? (
                    /* Show all suggestions when ready or waiting */
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 ${index === 0 ? "bg-red-500" : "bg-green-500"} rounded-full mt-2 flex-shrink-0`}
                          ></div>
                          <p className="text-md text-gray-300">{suggestion}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
                      <h4 className="font-bold text-gray-400">
                        No suggestions available
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Transcript Panel */}
            {!suggestionsVisible && (
              <div className="flex flex-col p-4 overflow-hidden h-full">
                <div
                  ref={messagesContainerRef}
                  className="flex-grow overflow-y-auto pr-4 space-y-6 custom-scrollbar"
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                      <p>
                        Conversation will appear here once the session starts...
                      </p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;
