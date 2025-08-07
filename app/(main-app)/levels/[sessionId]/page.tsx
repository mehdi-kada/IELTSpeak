"use client";

import AIAgentStatus from "@/components/session/AIAgentStatus";
import MobileMessageList from "@/components/session/Mobile/MobileMessageList";
import MobileSuggestionList from "@/components/session/Mobile/MobileSuggestionList";
import SessionNavigation from "@/components/session/SessionNav";
import MessageList from "@/components/session/desktop/MessageList";
import SuggestionsList from "@/components/session/desktop/SuggestionList";
import { useAuth } from "@/hooks/session/useAuth";
import { useUserProfile } from "@/hooks/session/useProfileData";
import { useSessionRating } from "@/hooks/session/useSessionRating";
import { useSessionTimer } from "@/hooks/session/useSessionTimer";
import { useSuggestions } from "@/hooks/session/useSuggestions";
import { useVapi } from "@/hooks/session/useVapi";
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

  const { userId, loading: authLoading, error: authError } = useAuth();

  const {
    profileData,
    loading: profileDataLoading,
    error,
  } = useUserProfile(userId);

  const { isSavingResults, sendConversationToAPI } = useSessionRating();

  // get the suggestions & suggestion trigger to ge the prompt from vapi
  const {
    suggestions,
    streamedResponse,
    suggestionStatus,
    generateSuggestion,
  } = useSuggestions();

  const handleEndCall = async () => {
    /**
     * handles ending the call and redirects the user based on conversation length.
     * if the conversation has more than 5 messages, it sends them for evaluation.
     * if it has 0 messages, it does nothing.
     * if it has between 1 and 5 messages, it redirects to a "too-short" page.
     */
    try {
      endCall();
      if (messages.length > 5) {
        await sendConversationToAPI(sessionId, messages);
        route.push(`/results/${sessionId}`);
      } else if (messages.length === 0) {
        return null;
      } else {
        window.location.href = "/too-short";
        return;
      }
    } catch (error) {
      console.error("failed to get evaluation:", error);
      if (messages.length > 5) {
        route.push(`/results/${sessionId}`);
      } else {
        window.location.href = "/too-short";
      }
    }
  };

  // Vapi setup + cleanup
  // pass the suggestion function to generate suggestions based on vapi assistant's messages
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
    handleEndCall
  );

  const sessionTime = useSessionTimer(callStatus);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  return (
    <div className="bg-[#1F2937] text-white flex flex-col h-screen overflow-hidden">
      <SessionNavigation
        isMuted={isMuted}
        callStatus={callStatus}
        level={level}
        isSavingResults={isSavingResults}
        onToggleMicrophone={toggleMicrophone}
        onEndCall={handleEndCall}
        vapiRef={vapiRef}
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <AIAgentStatus
          callStatus={callStatus}
          isSpeaking={isSpeaking}
          level={level}
          sessionTime={sessionTime}
        />

        <div className="flex-grow flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:hidden flex border-b border-white/10">
            <button
              onClick={() => setSuggestionsVisible(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                suggestionsVisible
                  ? "bg-[#374151] text-white border-b-2 border-[#E91E63]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setSuggestionsVisible(false)}
              className={`flex-1 py-3 px-4 text-sm  font-medium transition-colors ${
                !suggestionsVisible
                  ? "bg-[#374151] text-white border-b-2 border-[#E91E63]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Transcript
            </button>
          </div>

          <div className="hidden sm:flex flex-grow overflow-hidden">
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
