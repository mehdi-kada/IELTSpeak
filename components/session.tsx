"use client";

import { useState, useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Vapi from "@vapi-ai/web";
import Image from "next/image";
import React from "react";
import { configureAssistant } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

interface sessionComponentProps {
  level: string;
  sessionID: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface savedMessage {
  role: string;
  content: string;
}

function Session({ level, sessionID }: sessionComponentProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<savedMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const vapiRef = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking]);

  useEffect(() => {
    console.log("starting the vapi session");

    const onCallStart = () => {
      console.log("call started");
      setCallStatus(CallStatus.ACTIVE);
      // here we add to the session
    };

    const onCallEnd = () => {
      console.log("call Ended");
      setCallStatus(CallStatus.FINISHED);
      // here we send the data for feedback ,mybe redirect as well ?
      // send the data to the api which will handle data insertion to the db and redirect to the results
      // maybe analyze the data for results as well there ? yes yes insert analyzed data to db and than display it in results
    };

    // here where i will send the messages to gemini
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
      } else {
        console.log("message not processed", message.type);
      }
    };

    setCallStatus(CallStatus.CONNECTING);

    const onError = (error: Error) => console.log("vapi error : ", error);

    // function for lottie animations
    // on ai speech end send data for suggestions
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    // Remove any lingering DailyIframe if present
    const dailyIframes = document.querySelectorAll('iframe[src*="daily.co"]');
    dailyIframes.forEach((iframe) => iframe.remove());

    // Clean up previous instance
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }

    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    const vapi = vapiRef.current;

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    const startVapiCall = async () => {
      try {
        setCallStatus(CallStatus.CONNECTING);

        const assistantOverrides = {
          variableValues: { level },
          clientMessages: ["transcript"],
          serverMessages: [],
        };

        // @ts-expect-error
        await vapi.start(configureAssistant(), assistantOverrides);
      } catch (error) {
        console.log("error when connecting to vapi : ", error);
        setCallStatus(CallStatus.INACTIVE);
      }
    };

    startVapiCall();
    // clean up function :

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.stop();
      vapiRef.current = null;
    };
  }, [level, sessionID]);

  const EndCall = () => {
    setCallStatus(CallStatus.FINISHED);
    vapiRef.current.stop();
    redirect(`/results/${sessionID}`);
  };

  const toggleMicrophone = () => {
    const isMuted = vapiRef.current.isMuted();
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };
  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
      {/* Session Navigation */}
      <nav className="bg-[#2F2F7F] p-4 shadow-lg z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <svg
              className="h-8 w-8 text-[#E62136]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            <span className="text-xl font-bold text-white">ToEILET</span>
          </Link>
          <div>
            <span className="font-semibold text-lg">
              IELTS Speaking {level}
            </span>
          </div>
          <button
            onClick={EndCall}
            className="bg-red-600 hover:bg-red-700 transition-colors text-white font-bold py-2 px-4 rounded-lg"
          >
            End Session
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
          <button
            onClick={toggleMicrophone}
            className={`absolute top-4 right-4 ${
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6-4.72 4.72a.75.75 0 0 0 0 1.06l4.72 4.72a.75.75 0 0 0 1.06 0l4.72-4.72a.75.75 0 0 0 0-1.06l-4.72-4.72a.75.75 0 0 0-1.06 0Z"
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

        {/* Bottom Section: Suggestions and Transcript */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Suggestions */}
          <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col p-4 sm:p-6 bg-black/10 overflow-hidden border-r border-white/10">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold">Real-time Suggestions</h2>
              <button
                onClick={() => setSuggestionsVisible(!suggestionsVisible)}
                className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
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
            {suggestionsVisible && (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent hover:border-red-400 transition-colors">
                  <h4 className="font-bold text-red-400">Expand Your Answer</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Good start! Try to add more details to your response.
                  </p>
                </div>
                <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent hover:border-red-400 transition-colors">
                  <h4 className="font-bold text-red-400">Vocabulary Boost</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Consider using more advanced vocabulary to enhance your
                    response.
                  </p>
                </div>
                <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent hover:border-red-400 transition-colors">
                  <h4 className="font-bold text-red-400">Grammar Check</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Your grammar is good! Keep maintaining this level.
                  </p>
                </div>
                <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent hover:border-red-400 transition-colors">
                  <h4 className="font-bold text-red-400">Fluency Tip</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Try to connect your ideas with linking words for better
                    flow.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Transcript */}
          <div className="w-full md:w-1/2 lg:w-2/3 flex flex-col p-4 sm:p-6">
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0">
              Live Transcript
            </h2>
            <div className="flex-grow overflow-y-auto pr-4 space-y-6 custom-scrollbar">
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
                            className="h-6 w-6 text-[#E62136]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75"
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
