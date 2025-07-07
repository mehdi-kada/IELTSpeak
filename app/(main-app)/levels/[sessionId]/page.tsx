"use client";
import LoadingSpinner from "@/components/Loading";
import { geminiPrompt } from "@/constants/constants";
import { fetchUserProfileData } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { configureAssistant } from "@/lib/utils";
import { profileValues } from "@/types/schemas";
import Vapi from "@vapi-ai/web";

import { Metadata } from "next";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const metadata: Metadata = {
  title: "Session",
};

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: string;
  content: string;
}

let globalVapiInstance: Vapi | null = null;

function Session() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [suggestionStatus, setSuggestionStatus] = useState<
    "waiting" | "generating" | "ready"
  >("waiting");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  const [profileData, setProfileData] = useState<profileValues | null>(null);

  const callStartRef = useRef(false);
  const vapiRef = useRef<Vapi | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const level = searchParams.get("level") || "1";

  const route = useRouter();

  // for updating session and processing conversation
  const [isSavingResults, setIsSavingResults] = useState(false);
  const sendCoversationToAPI = async () => {
    setIsSavingResults(true);
    try {
      console.log("Sending messages to rating API:", messages);

      const res = await fetch(`/api/rating/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          level: level,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `API responded with status ${res.status}: ${errorText}`
        );
      }

      const result = await res.json();
      console.log("Rating API response:", result);

      // Store result for results page
      localStorage.setItem(`evaluation_${sessionId}`, JSON.stringify(result));

      return result;
    } catch (error) {
      console.error("Error sending messages to rating api:", error);
      throw error;
    } finally {
      setIsSavingResults(false);
    }
  };

  // get the user id for localstorage fetch
  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => setSessionTime((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Auto‑scroll transcript
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Streamed suggestions
  useEffect(() => {
    if (!prompt) {
      setSuggestionStatus("waiting");
      return;
    }

    const generate = async () => {
      setSuggestionStatus("generating");
      setStreamedResponse("");
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        console.log("Suggestions API response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Suggestions API error:", errorText);
          throw new Error(`Bad status from suggestions API: ${res.status}`);
        }

        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          fullResponse += chunk;
          console.log("Received suggestion chunk:", chunk);
          setStreamedResponse(fullResponse);
        }

        // Add completed suggestion to the top of suggestions array
        if (fullResponse.trim()) {
          console.log("Adding suggestion to array:", fullResponse.trim());
          setSuggestions((prev) => {
            const newSuggestions = [fullResponse.trim(), ...prev];
            console.log("Updated suggestions array:", newSuggestions);
            return newSuggestions;
          });
        }

        // Clear the streamed response since it's now in the suggestions array
        setStreamedResponse("");
        setSuggestionStatus("ready");
        console.log("Suggestions generation completed");
      } catch (err) {
        console.error("Suggestions error:", err);
        setSuggestionStatus("waiting");
      }
    };
    generate();
  }, [prompt]);

  // Auto-scroll suggestions to top when new suggestion is added
  useEffect(() => {
    if (suggestionsContainerRef.current && suggestions.length > 0) {
      suggestionsContainerRef.current.scrollTop = 0;
    }
  }, [suggestions]);

  //effect for getting profile data either from localstorage or database
  useEffect(() => {
    if (!userId) return;

    const handleProfileData = async () => {
      try {
        const savedProfile = localStorage.getItem(`${userId}_userProfile`);
        console.log("Saved profile from localStorage:", savedProfile);

        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          console.log("Using cached profile data:", profileData);
          setProfileData(profileData);
        } else {
          console.log(
            "Fetching profile data from database for userId:",
            userId
          );
          const profileData = await fetchUserProfileData(userId);
          if (!profileData) {
            console.log("No profile data found, redirecting to profile page");
            window.location.href = "/profile?reason=empty";
            return;
          }
          console.log("Profile data fetched from database:", profileData);
          localStorage.setItem(
            `${userId}_userProfile`,
            JSON.stringify(profileData)
          );
          setProfileData(profileData);
        }
      } catch (error) {
        console.error("Error handling profile data:", error);
      }
    };

    handleProfileData();
  }, [userId]);

  // Vapi setup + cleanup
  useEffect(() => {
    // first wait for the user id before initializing vapi
    if (!userId || !profileData) {
      return;
    }
    let cancelled = false;
    let vapi: Vapi | null = null;

    if (globalVapiInstance || vapiRef.current) return;
    callStartRef.current = false;
    const init = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled || globalVapiInstance || vapiRef.current) return;

      vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      vapiRef.current = vapi;
      globalVapiInstance = vapi; // Define handlers
      const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
      const onCallEnd = () => {
        console.log("call ended");
        setCallStatus(CallStatus.FINISHED);
      };
      const onMessage = (msg: any) => {
        console.log("Received VAPI message:", msg);
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const m = { role: msg.role, content: msg.transcript };
          console.log("Adding message to state:", m);
          setMessages((ms) => [...ms, m]);

          if (m.role === "assistant") {
            try {
              if (profileData) {
                console.log(
                  "Profile data available for suggestions:",
                  profileData
                );
                const newPrompt = geminiPrompt(level, m.content, profileData);
                console.log("Generated prompt for suggestions:", newPrompt);
                setPrompt(newPrompt);
              } else {
                console.log("Profile data not available yet for suggestions");
              }
            } catch (error) {
              console.error("Error generating prompt for suggestions:", error);
            }
          }
        }
      };
      const onError = (err: any) => {
        console.error("Vapi SDK error event:", {
          err,
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
          code: err?.code,
          info: err?.info,
        });
        setCallStatus(CallStatus.INACTIVE);
      };
      const onSpeechStart = () => setIsSpeaking(true);
      const onSpeechEnd = () => setIsSpeaking(false);

      // Attach handlers
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("error", onError);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);

      // Kickoff
      const startCall = async () => {
        if (callStartRef.current) return;
        callStartRef.current = true;
        setCallStatus(CallStatus.CONNECTING);

        const assistantConfig = configureAssistant();
        const overrides = { variableValues: { level } };
        console.log("Starting Vapi with:", { assistantConfig, overrides });
        try {
          await vapi!.start(assistantConfig, overrides);
        } catch (err: any) {
          console.error("vapi.start() failed:", {
            err,
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            ...err,
          });
          setCallStatus(CallStatus.INACTIVE);
          callStartRef.current = false;
        }
      };

      startCall();
    };

    init();
    setLoading(false);

    return () => {
      cancelled = true;
      const v = vapiRef.current;
      if (v) {
        try {
          v.stop();
        } catch (error) {
          console.error("Error stopping Vapi:", error);
        }
        vapiRef.current = null;
      }
      if (globalVapiInstance) {
        globalVapiInstance = null;
      }
      callStartRef.current = false;
    };
  }, [level, sessionId, userId, profileData]);
  const EndCall = async () => {
    console.log("Ending call with messages:", messages);
    setCallStatus(CallStatus.FINISHED);

    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
      globalVapiInstance = null;
    }

    // Send messages to rating API before redirecting
    try {
      if (messages.length > 0) {
        console.log("Sending evaluation request...");
        await sendCoversationToAPI();
        console.log("Evaluation completed successfully");
      } else {
        console.warn("No messages to evaluate");
      }
    } catch (error) {
      console.error("Failed to get evaluation:", error);
      // Continue with redirect even if evaluation fails
    }

    // redirect
    route.push(`/results/${sessionId}`);
  };

  const toggleMicrophone = () => {
    // Check if Vapi instance exists and is ready
    if (!vapiRef.current) {
      console.warn("Vapi instance not available yet");
      return;
    }

    try {
      const muted = vapiRef.current.isMuted();
      vapiRef.current.setMuted(!muted);
      setIsMuted(!muted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
      // Optionally show user feedback here
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return <LoadingSpinner message="callibrating AI" />;
  }

  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
      {/* Session Navigation */}
      <nav className="bg-[#2F2F7F] z-5 p-4  shadow-lg flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          {/* Mute button replaces logo on all screens */}
          <div className="flex items-center">
            <button
              onClick={toggleMicrophone}
              disabled={!vapiRef.current || callStatus === CallStatus.INACTIVE}
              className={`${isMuted ? "bg-red-600" : "bg-white/10"} ${
                !vapiRef.current || callStatus === CallStatus.INACTIVE
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/20"
              } p-2 rounded-full transition-colors`}
              aria-label="Mute Microphone"
              title={
                !vapiRef.current || callStatus === CallStatus.INACTIVE
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
                  {/* Microphone paths */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                  {/* Diagonal slash */}
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
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 ">
            <span className="font-semibold text-sm md:text-lg  ">
              IELTS Speaking {level}
            </span>
          </div>

          <button
            onClick={EndCall}
            disabled={isSavingResults}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-white font-bold py-2 px-2 md:px-4 rounded-lg flex items-center gap-2 text-sm md:text-base"
          >
            {isSavingResults ? (
              <>
                <span>Processing... </span>
              </>
            ) : (
              <>
                <span>End Session</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Section: AI Agent Status */}
        <div className="h-1/4 min-h-[200px] flex-shrink-0 bg-[#2F2F7F]/30 p-4 text-center flex flex-col items-center justify-center border-b border-white/10 relative">
          <div className="relative inline-flex items-center justify-center w-28 h-28 mx-auto">
            <div
              className={`absolute w-full h-full bg-[#E62136]/50 rounded-full ${
                isSpeaking ? "animate-pulse" : ""
              }`}
            ></div>
            <div className="relative w-24 h-24 bg-[#1a1a3a] rounded-full flex items-center justify-center">
              <p className="font-bold text-2xl text-[#E62136]">{level}</p>
            </div>
          </div>
          <p className="text-xl font-bold mt-4">
            {callStatus === CallStatus.CONNECTING
              ? "Connecting..."
              : callStatus === CallStatus.ACTIVE
                ? isSpeaking
                  ? "AI is speaking"
                  : "Your turn to speak"
                : callStatus === CallStatus.FINISHED
                  ? "Session ended"
                  : "Ready to start"}
          </p>
          <p className="text-gray-400 text-sm">
            Session Timer: {formatTime(sessionTime)}
          </p>
        </div>

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
                  {suggestionStatus === "waiting" ? (
                    <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
                      <h4 className="font-bold text-gray-400 mb-2">
                        Waiting for conversation to start...
                      </h4>
                      <p className="text-sm text-gray-500">
                        Once the conversation starts you will get suggestions on
                        what to say next
                      </p>
                    </div>
                  ) : suggestionStatus === "generating" ? (
                    <>
                      {/* Show current streaming suggestion if available */}
                      {!streamedResponse &&
                        suggestionStatus === "generating" && (
                          <LoadingSpinner
                            size="sm"
                            fullScreen={false}
                            message=""
                          />
                        )}
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
            </div>

            {/* Transcript Panel - Desktop */}
            <div className="w-2/3 flex flex-col p-4 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 flex-shrink-0">
                Live Transcript
              </h2>
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
                      {!streamedResponse && (
                        <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
                          <h4 className="font-bold text-red-600 mb-4">
                            Generating suggestions...
                          </h4>
                          <LoadingSpinner
                            size="sm"
                            fullScreen={false}
                            message=""
                          />
                        </div>
                      )}
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
