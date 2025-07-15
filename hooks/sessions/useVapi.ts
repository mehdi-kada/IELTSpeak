import { useState, useEffect, useRef, useMemo } from "react";
import Vapi from "@vapi-ai/web";
import { CallStatus, SavedMessage } from "@/types/sessionTypes";
import { configureAssistant } from "@/lib/utils";
import { geminiPrompt } from "@/constants/constants";
import { profileValues } from "@/types/schemas";

let globalVapiInstance: Vapi | null = null;

export function useVapi(
  userId: string | null,
  profileData: profileValues | null,
  level: string,
  sessionId: string,
  suggestions: string[],
  onSuggestion: (prompt: string) => void,
  onCallEndCallback?: () => void
) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  const callStartRef = useRef(false);
  const vapiRef = useRef<Vapi | null>(null);
  const suggestionsRef = useRef<string[]>(suggestions);
  // store external end callback in ref to avoid re-triggering init effect
  const onCallEndCallbackRef = useRef<(() => void) | undefined>(
    onCallEndCallback
  );

  // Update suggestions ref whenever suggestions change
  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);
  // update onCallEndCallback ref when it changes
  useEffect(() => {
    onCallEndCallbackRef.current = onCallEndCallback;
  }, [onCallEndCallback]);

  // Memoize profile data to prevent unnecessary re-renders
  const stableProfileData = useMemo(
    () => profileData,
    [profileData?.name, profileData?.age, profileData?.gender]
  );

  useEffect(() => {
    // make sure that both the user id and profile data are available
    if (!userId || !stableProfileData) {
      return;
    }

    let cancelled = false;
    let vapi: Vapi | null = null;

    // to prevent multiple instances of vapi gloabally
    if (globalVapiInstance || vapiRef.current) {
      return;
    }
    callStartRef.current = false;

    // b4 initializing vapi insure that the session hasnt been stopped imedialtly by the user
    const initializeVapi = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (cancelled || globalVapiInstance || vapiRef.current) {
        return;
      }

      vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      vapiRef.current = vapi;
      globalVapiInstance = vapi;

      // event handlers
      const onCallStart = () => {
        console.log("starting call");
        setCallStatus(CallStatus.ACTIVE);
      };

      // if the assistant triggers the session end webhook it sends the conversation for evaluation
      const onCallEnd = () => {
        console.log("Call ended");
        setCallStatus(CallStatus.FINISHED);
        // trigger external callback on session end
        if (onCallEndCallbackRef.current) {
          onCallEndCallbackRef.current();
        }
      };

      const onVapiMessage = (msg: any) => {
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const message = { role: msg.role, content: msg.transcript };
          setMessages((prevMessages) => [...prevMessages, message]);

          // generate suggestions
          if (message.role === "assistant") {
            try {
              if (stableProfileData) {
                const newPrompt = geminiPrompt(
                  level,
                  message.content,
                  stableProfileData,
                  suggestionsRef.current
                );

                onSuggestion(newPrompt);
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
        });
        setCallStatus(CallStatus.INACTIVE);
      };

      const onSpeechStart = () => {
        setIsSpeaking(true);
      };

      const onSpeechEnd = () => {
        setIsSpeaking(false);
      };

      // attach event listeners
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onVapiMessage);
      vapi.on("error", onError);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);

      // start the call
      const startCall = async () => {
        if (callStartRef.current) return;
        callStartRef.current = true;
        setCallStatus(CallStatus.CONNECTING);

        const assistantConfig = configureAssistant();
        const overrides = { variableValues: { level } };

        try {
          await vapi!.start(assistantConfig, overrides);
        } catch (err: any) {
          console.error("vapi.start() failed:", err);
          setCallStatus(CallStatus.INACTIVE);
          callStartRef.current = false;
        }
      };

      startCall();
    };

    initializeVapi();
    setLoading(false);

    // cleanup function for the hooks
    return () => {
      cancelled = true;

      const v = vapiRef.current;
      // insure that it is stopped when navigating away from the page
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
  }, [level, sessionId, userId, stableProfileData]);

  // toggle the micophone on and off
  // if the session hasnt started prevent error
  const toggleMicrophone = () => {
    if (!vapiRef.current) {
      console.warn("vapi instance not available");
      return;
    }

    try {
      const muted = vapiRef.current.isMuted();
      vapiRef.current.setMuted(!muted);
      setIsMuted(!muted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  const endCall = () => {
    console.log("Ending call");
    setCallStatus(CallStatus.FINISHED);

    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (error) {
        console.error("Error stopping Vapi during EndCall:", error);
      }
      vapiRef.current = null;
      globalVapiInstance = null;
    }
  };

  return {
    callStatus,
    isSpeaking,
    messages,
    isMuted,
    loading,
    vapiRef,
    toggleMicrophone,
    endCall,
  };
}
