"use client";

import { useState, useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import { configureAssistant } from "@/lib/utils";
import Link from "next/link";

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
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    // clean up function :

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.stop();
    };
  }, [level]);

  const EndCall = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <Link href={`/results/${sessionID}`}>End Session</Link>
    </>
  );
}

export default Session;
