import { SavedMessage } from "@/types/sessionTypes";
import { useState } from "react";

export function useSessionRating() {
  /**
   * sends the conversation to the api to be evaluated and rated.
   */
  const [isSavingResults, setIsSavingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendConversationToAPI = async (
    sessionId: string,
    messages: SavedMessage[],
  ) => {
    setIsSavingResults(true);
    setError(null);

    try {
      const res = await fetch(`/api/rating/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
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

      // store the result in local storage instead of database for fast retrieval
      localStorage.setItem(`evaluation_${sessionId}`, JSON.stringify(result));

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save results";
      console.error("Error sending messages to rating api:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsSavingResults(false);
    }
  };

  return {
    sendConversationToAPI,
    isSavingResults,
    error,
  };
}