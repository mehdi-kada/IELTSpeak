import { useState, useEffect, useRef, useCallback } from "react";

export function useSuggestions() {
  /**
   * receives a prompt and generates suggestions based on it.
   */
  
  const [prompt, setPrompt] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<
    "waiting" | "generating" | "ready"
  >("waiting");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!prompt) {
      setSuggestionStatus("waiting");
      return;
    }

    const generateSuggestions = async () => {
      setSuggestionStatus("generating");
      setStreamedResponse("");

      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Suggestions API error:", errorText);
          throw new Error(`Bad status from suggestions API: ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setStreamedResponse(fullResponse);
        }

        // add new suggestion to previous suggestions
        if (fullResponse.trim()) {
          setSuggestions((prev) => [fullResponse.trim(), ...prev]);
        }
      
        setStreamedResponse("");
        setSuggestionStatus("ready");
      } catch (err) {
        console.error("Suggestions in suggestion  error:", err);
        setSuggestionStatus("waiting");
      }
    };
    generateSuggestions();
  }, [prompt]);

  // auto scroll to the top of the dict for the suggestions
  useEffect(() => {
    if (suggestionsContainerRef.current && suggestions.length > 0) {
      suggestionsContainerRef.current.scrollTop = 0;
    }
  }, [suggestions]);


  const generateSuggestion = (newPrompt: string) => {
    setPrompt(newPrompt);
  }

  const clearSuggestions = () => {
    setSuggestions([]);
    setStreamedResponse("");
    setSuggestionStatus("waiting");
    setPrompt("");
  };

  return {
    suggestions,
    streamedResponse,
    suggestionStatus,
    suggestionsContainerRef,
    generateSuggestion,
    clearSuggestions,
  };
}
