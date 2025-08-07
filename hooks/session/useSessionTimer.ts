import { CallStatus } from "@/types/sessionTypes";
import { useState, useEffect } from "react";


export function useSessionTimer(callStatus: CallStatus) {
  /**
   * a simple timer for the conversation session.
   */
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => setSessionTime((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);



  return  sessionTime ;
}