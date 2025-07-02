"use client";

const metadata: Metadata = {
  title: "Session",
};

import { useState, useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Vapi from "@vapi-ai/web";
import { configureAssistant } from "@/lib/utils";
import { geminiPrompt } from "@/constants/constants";
import Link from "next/link";
import { redirect, useSearchParams, useParams } from "next/navigation";
import { Metadata } from "next";
import LoadingSpinner from "@/components/Loading";

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
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const callStartRef = useRef(false);
  const vapiRef = useRef<Vapi | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const level = searchParams.get("level") || "1";

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

  // Lottie play/stop
  useEffect(() => {
    if (isSpeaking) lottieRef.current?.play();
    else lottieRef.current?.stop();
  }, [isSpeaking]);

  // Streamed suggestions
  useEffect(() => {
    if (!prompt) return;
    const generate = async () => {
      setStreamedResponse("");
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error("Bad status from suggestions API");
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setStreamedResponse((r) => r + dec.decode(value, { stream: true }));
        }
      } catch (err) {
        console.error("Suggestions error:", err);
      }
    };
    generate();
  }, [prompt]);

  // Vapi setup + cleanup
  useEffect(() => {
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
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const m = { role: msg.role, content: msg.transcript };
          setMessages((ms) => [...ms, m]);

          if (m.role === "assistant") {
            try {
              const savedProfile = localStorage.getItem("userProfile");
              if (savedProfile) {
                const profileData = JSON.parse(savedProfile);
                const newPrompt = geminiPrompt(level, m.content, profileData);
                console.log(
                  " the prompt sent to the gemini api for suggestions is : ",
                  newPrompt
                );
                setPrompt(newPrompt);
              }
            } catch (error) {}
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
  }, [level, sessionId]);
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

    // Use window.location.href instead of redirect
    window.location.href = `/results/${sessionId}`;
  };

  const toggleMicrophone = () => {
    if (!vapiRef.current) return;
    const muted = vapiRef.current.isMuted();
    vapiRef.current.setMuted(!muted);
    setIsMuted(!muted);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
      {/* Session Navigation */}
      <nav className="bg-[#2F2F7F] p-4 shadow-lg z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          {/* Mute button replaces logo on all screens */}
          <div className="flex items-center">
            <button
              onClick={toggleMicrophone}
              className={`${
                isMuted ? "bg-red-600" : "bg-white/10"
              } hover:bg-white/20 p-2 rounded-full transition-colors`}
              aria-label="Mute Microphone"
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
                <LoadingSpinner fullScreen={false} size="sm" />
                <span className="hidden md:inline">Processing...</span>
              </>
            ) : (
              <>
                <span className="hidden md:inline">End Session</span>
                <span className="md:hidden">End</span>
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
          {/* Mobile tabs only on very small screens (below sm) */}
          <div className="w-full sm:w-1/3 flex flex-col overflow-hidden">
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
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  !suggestionsVisible
                    ? "bg-[#2F2F7F] text-white border-b-2 border-[#E62136]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Transcript
              </button>
            </div>

            {/* Suggestions Panel */}
            <div
              className={`${
                suggestionsVisible ? "flex" : "hidden sm:flex"
              } flex-col p-4 bg-black/10 overflow-hidden sm:border-r border-white/10 h-full`}
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Real-time Suggestions
                </h2>
                <button
                  onClick={() => setSuggestionsVisible(!suggestionsVisible)}
                  className="hidden sm:flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  <span>{suggestionsVisible ? "Hide" : "Show"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${
                      suggestionsVisible ? "" : "rotate-180"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                {streamedResponse ? (
                  <div className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors">
                    <p className="text-md text-gray-300 mt-1">
                      {streamedResponse}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent">
                    <h4 className="font-bold text-red-600">
                      Generating suggestion...
                    </h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div
            className={`${
              !suggestionsVisible ? "flex" : "hidden sm:flex"
            } w-full sm:w-2/3 flex-col p-4 overflow-hidden`}
          >
            <h2 className="transcript-title ">Live Transcript</h2>
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
                              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z"
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
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #1a1a3a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e62136;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default Session;
