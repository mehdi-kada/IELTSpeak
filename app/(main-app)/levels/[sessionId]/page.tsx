"use client";

import AIAgentStatus from "@/components/session/AIAgentStatus";
import MobileMessageList from "@/components/session/Mobile/MobileMessageList";
import MobileSuggestionList from "@/components/session/Mobile/MobileSuggestionList";
import SessionNavigation from "@/components/session/SessionNav";
import MessageList from "@/components/session/desktop/MessageList";
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
    generateSuggestion,
  );

  const sessionTime = useSessionTimer(callStatus);
  // ref for scrolling to the top of the messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

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

      {/* main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* AI Agent Status */}
        <AIAgentStatus
          callStatus={callStatus}
          isSpeaking={isSpeaking}
          level={level}
          sessionTime={sessionTime}
        />

        {/* Suggestions and Transcript */}
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
            {suggestionsVisible ? (
              <MobileSuggestionList
                suggestionStatus={suggestionStatus}
                streamedResponse={streamedResponse}
                suggestions={suggestions}
              />
            ) : (
              <MobileMessageList
                messages={messages}
                messagesContainerRef={messagesContainerRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;
