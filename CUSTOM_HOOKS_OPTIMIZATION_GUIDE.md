# Custom Hooks Optimization Guide

## Table of Contents

1. [What are Custom Hooks?](#what-are-custom-hooks)
2. [Why Extract Custom Hooks?](#why-extract-custom-hooks)
3. [Identifying Hook Opportunities](#identifying-hook-opportunities)
4. [Custom Hooks to Create](#custom-hooks-to-create)
5. [Implementation Guide](#implementation-guide)
6. [Performance Optimizations](#performance-optimizations)
7. [Best Practices](#best-practices)
8. [Testing Strategy](#testing-strategy)

---

## What are Custom Hooks?

Custom hooks are **JavaScript functions** that:

- Start with the word "use" (e.g., `useAuth`, `useTimer`)
- Can call other hooks inside them
- Allow you to **reuse stateful logic** between components
- Help **organize complex logic** into smaller, focused pieces

### Example:

```javascript
// Instead of this logic scattered in your component:
const [user, setUser] = useState(null);
useEffect(() => {
  fetchUser().then(setUser);
}, []);

// You can create this custom hook:
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  return user;
}

// And use it like:
const user = useAuth();
```

---

## Why Extract Custom Hooks?

### 🎯 **Benefits:**

1. **Separation of Concerns**: Each hook handles one specific responsibility
2. **Reusability**: Use the same logic in different components
3. **Testability**: Test hooks in isolation
4. **Readability**: Component focuses on UI, hooks handle logic
5. **Performance**: Better optimization opportunities
6. **Maintainability**: Easier to update and debug

### 🔍 **Current Problems in Your Component:**

- **800+ lines of code** - hard to understand
- **Multiple responsibilities** mixed together
- **Complex state management** scattered throughout
- **Difficult to test** individual pieces
- **Hard to reuse** logic in other components

---

## Identifying Hook Opportunities

Look for these patterns in your component:

### ✅ **Good Hook Candidates:**

1. **State + useEffect combinations** that work together
2. **API calls** and related loading/error states
3. **Event handlers** that manage specific functionality
4. **Complex calculations** or data transformations
5. **Browser APIs** (localStorage, geolocation, etc.)

### ❌ **Don't Extract These:**

1. **Simple state** that's only used in one place
2. **UI-specific logic** (like showing/hiding elements)
3. **One-time calculations** without side effects

---

## Custom Hooks to Create

Based on your Session component, here are the hooks we should create:

### 1. **useAuth** - User Authentication

- Manages user ID and authentication state
- Handles Supabase authentication

### 2. **useUserProfile** - Profile Data Management

- Fetches and caches user profile data
- Handles localStorage and database sync

### 3. **useVapi** - Voice AI Integration

- Manages Vapi instance lifecycle
- Handles call events and state

### 4. **useSuggestions** - AI Suggestions

- Manages suggestion generation and streaming
- Handles suggestion state and API calls

### 5. **useMessages** - Message Management

- Manages conversation messages
- Handles message scrolling

### 6. **useSessionAPI** - API Operations

- Handles sending conversation to rating API
- Manages loading states for API calls

---

## Implementation Guide

### 1. **useAuth Hook**

**File: `hooks/sessions/useAuth.ts`**

```typescript
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * useAuth Hook
 *
 * Purpose: Manage user authentication state
 *
 * What it does:
 * - Gets the current user from Supabase
 * - Manages loading state during auth check
 * - Returns user ID when available
 *
 * Why extract this?
 * - Reusable across components that need user data
 * - Centralizes auth logic
 * - Easier to test auth functionality
 */
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error.message);
          return;
        }

        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  return {
    userId,
    loading,
    error,
    isAuthenticated: !!userId,
  };
}
```

**How to use:**

```typescript
// In your component:
const { userId, loading, error, isAuthenticated } = useAuth();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!isAuthenticated) return <LoginForm />;
```

---

### 2. **useUserProfile Hook**

**File: `hooks/sessions/useUserProfile.ts`**

```typescript
import { useState, useEffect } from "react";
import { fetchUserProfileData } from "@/lib/actions";
import { profileValues } from "@/types/schemas";

/**
 * useUserProfile Hook
 *
 * Purpose: Manage user profile data with caching
 *
 * Features:
 * - Checks localStorage first (faster)
 * - Falls back to database if not cached
 * - Automatically caches fetched data
 * - Handles loading and error states
 *
 * Why extract this?
 * - Complex caching logic is reusable
 * - Easier to test profile data flow
 * - Can be used in multiple components
 */
export function useUserProfile(userId: string | null) {
  const [profileData, setProfileData] = useState<profileValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfileData(null);
      return;
    }

    const handleProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check localStorage first
        const savedProfile = localStorage.getItem(`${userId}_userProfile`);
        console.log("Saved profile from localStorage:", savedProfile);

        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          console.log("Using cached profile data:", profileData);
          setProfileData(profileData);
          setLoading(false);
          return;
        }

        // Fetch from database if not cached
        console.log("Fetching profile data from database for userId:", userId);
        const profileData = await fetchUserProfileData(userId);

        if (!profileData) {
          console.log("No profile data found, redirecting to profile page");
          window.location.href = "/profile?reason=empty";
          return;
        }

        console.log("Profile data fetched from database:", profileData);

        // Cache the data
        localStorage.setItem(
          `${userId}_userProfile`,
          JSON.stringify(profileData)
        );

        setProfileData(profileData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        console.error("Error handling profile data:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleProfileData();
  }, [userId]);

  return {
    profileData,
    loading,
    error,
    refetch: () => {
      if (userId) {
        // Clear cache and refetch
        localStorage.removeItem(`${userId}_userProfile`);
        setProfileData(null);
      }
    },
  };
}
```

**How to use:**

```typescript
// In your component:
const { profileData, loading, error, refetch } = useUserProfile(userId);

// Profile data is automatically loaded when userId changes
// Can call refetch() to clear cache and reload
```

---

### 3. **useMessages Hook**

**File: `hooks/sessions/useMessages.ts`**

```typescript
import { useState, useEffect, useRef } from "react";
import { SavedMessage } from "@/types/sessionTypes";

/**
 * useMessages Hook
 *
 * Purpose: Manage conversation messages and scrolling
 *
 * Features:
 * - Manages message state
 * - Auto-scrolls to newest messages
 * - Provides helper functions for adding messages
 *
 * Why extract this?
 * - Message logic is reusable
 * - Scrolling behavior is complex
 * - Easier to test message operations
 */
export function useMessages() {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  const addMessage = (message: SavedMessage) => {
    console.log("Adding message to state:", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getMessageCount = () => messages.length;

  const hasEnoughMessages = (minCount: number = 5) => {
    return messages.length > minCount;
  };

  return {
    messages,
    messagesContainerRef,
    addMessage,
    clearMessages,
    getMessageCount,
    hasEnoughMessages,
  };
}
```

**How to use:**

```typescript
// In your component:
const { messages, messagesContainerRef, addMessage, hasEnoughMessages } =
  useMessages();

// Add messages from Vapi events
onMessage = (msg: any) => {
  if (msg.type === "transcript" && msg.transcriptType === "final") {
    addMessage({ role: msg.role, content: msg.transcript });
  }
};

// Check if we have enough messages
if (hasEnoughMessages()) {
  // Send to API
}
```

---

### 4. **useSuggestions Hook**

**File: `hooks/sessions/useSuggestions.ts`**

```typescript
import { useState, useEffect, useRef } from "react";

/**
 * useSuggestions Hook
 *
 * Purpose: Manage AI-powered suggestion generation
 *
 * Features:
 * - Handles streaming suggestions from API
 * - Manages suggestion states (waiting, generating, ready)
 * - Auto-scrolls suggestions container
 * - Provides suggestion management functions
 *
 * Why extract this?
 * - Complex streaming logic
 * - Reusable suggestion functionality
 * - Easier to test suggestion flow
 */
export function useSuggestions() {
  const [prompt, setPrompt] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<
    "waiting" | "generating" | "ready"
  >("waiting");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  // Generate suggestions when prompt changes
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

        console.log("Suggestions API response status:", res.status);

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
          console.log("Received suggestion chunk:", chunk);
          setStreamedResponse(fullResponse);
        }

        // Add completed suggestion to array
        if (fullResponse.trim()) {
          console.log("Adding suggestion to array:", fullResponse.trim());
          setSuggestions((prev) => {
            const newSuggestions = [fullResponse.trim(), ...prev];
            console.log("Updated suggestions array:", newSuggestions);
            return newSuggestions;
          });
        }

        setStreamedResponse("");
        setSuggestionStatus("ready");
        console.log("Suggestions generation completed");
      } catch (err) {
        console.error("Suggestions error:", err);
        setSuggestionStatus("waiting");
      }
    };

    generateSuggestions();
  }, [prompt]);

  // Auto-scroll suggestions to top when new suggestion is added
  useEffect(() => {
    if (suggestionsContainerRef.current && suggestions.length > 0) {
      suggestionsContainerRef.current.scrollTop = 0;
    }
  }, [suggestions]);

  const generateSuggestion = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

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
```

**How to use:**

```typescript
// In your component:
const { suggestions, streamedResponse, suggestionStatus, generateSuggestion } =
  useSuggestions();

// Generate suggestion when assistant speaks
if (message.role === "assistant") {
  const newPrompt = geminiPrompt(level, message.content, profileData);
  generateSuggestion(newPrompt);
}
```

---

### 5. **useSessionAPI Hook**

**File: `hooks/sessions/useSessionAPI.ts`**

```typescript
import { useState } from "react";
import { SavedMessage } from "@/types/sessionTypes";

/**
 * useSessionAPI Hook
 *
 * Purpose: Handle API operations for session data
 *
 * Features:
 * - Sends conversation to rating API
 * - Manages loading states
 * - Handles errors gracefully
 * - Stores results in localStorage
 *
 * Why extract this?
 * - API logic is reusable
 * - Better error handling
 * - Easier to test API operations
 */
export function useSessionAPI() {
  const [isSavingResults, setIsSavingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendConversationToAPI = async (
    sessionId: string,
    messages: SavedMessage[],
    level: string
  ) => {
    setIsSavingResults(true);
    setError(null);

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
```

**How to use:**

```typescript
// In your component:
const { sendConversationToAPI, isSavingResults, error } = useSessionAPI();

// When ending session:
try {
  await sendConversationToAPI(sessionId, messages, level);
  router.push(`/results/${sessionId}`);
} catch (error) {
  // Handle error
}
```

---

### 6. **useVapi Hook**

**File: `hooks/sessions/useVapi.ts`**

```typescript
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { CallStatus, SavedMessage } from "@/types/sessionTypes";
import { configureAssistant } from "@/lib/utils";
import { geminiPrompt } from "@/constants/constants";
import { profileValues } from "@/types/schemas";

// Global instance to prevent multiple Vapi instances
let globalVapiInstance: Vapi | null = null;

/**
 * useVapi Hook
 *
 * Purpose: Manage Vapi voice AI integration
 *
 * Features:
 * - Handles Vapi instance lifecycle
 * - Manages call status and events
 * - Provides microphone controls
 * - Generates suggestions from assistant messages
 *
 * Why extract this?
 * - Complex Vapi integration logic
 * - Event handling is reusable
 * - Easier to test voice functionality
 */
export function useVapi(
  userId: string | null,
  profileData: profileValues | null,
  level: string,
  sessionId: string,
  onMessage: (message: SavedMessage) => void,
  onSuggestion: (prompt: string) => void
) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  const callStartRef = useRef(false);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    // Wait for user and profile data before initializing Vapi
    if (!userId || !profileData) {
      return;
    }

    let cancelled = false;
    let vapi: Vapi | null = null;

    // Prevent multiple instances
    if (globalVapiInstance || vapiRef.current) return;
    callStartRef.current = false;

    const initializeVapi = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (cancelled || globalVapiInstance || vapiRef.current) return;

      vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      vapiRef.current = vapi;
      globalVapiInstance = vapi;

      // Event handlers
      const onCallStart = () => {
        setCallStatus(CallStatus.ACTIVE);
      };

      const onCallEnd = () => {
        console.log("Call ended");
        setCallStatus(CallStatus.FINISHED);
      };

      const onVapiMessage = (msg: any) => {
        console.log("Received VAPI message:", msg);
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const message = { role: msg.role, content: msg.transcript };
          onMessage(message);

          // Generate suggestions for assistant messages
          if (message.role === "assistant") {
            try {
              if (profileData) {
                const newPrompt = geminiPrompt(
                  level,
                  message.content,
                  profileData
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
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
          code: err?.code,
          info: err?.info,
        });
        setCallStatus(CallStatus.INACTIVE);
      };

      const onSpeechStart = () => {
        setIsSpeaking(true);
      };

      const onSpeechEnd = () => {
        setIsSpeaking(false);
      };

      // Attach event listeners
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onVapiMessage);
      vapi.on("error", onError);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);

      // Start the call
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

    // Cleanup function
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
  }, [level, sessionId, userId, profileData, onMessage, onSuggestion]);

  const toggleMicrophone = () => {
    if (!vapiRef.current) {
      console.warn("Vapi instance not available");
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
    isMuted,
    loading,
    vapiRef,
    toggleMicrophone,
    endCall,
  };
}
```

**How to use:**

```typescript
// In your component:
const { callStatus, isSpeaking, isMuted, toggleMicrophone, endCall } = useVapi(
  userId,
  profileData,
  level,
  sessionId,
  addMessage, // from useMessages
  generateSuggestion // from useSuggestions
);
```

---

## Updated Session Component

Now your main component becomes much cleaner:

**File: `app/(main-app)/levels/[sessionId]/page.tsx`**

```typescript
"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

// Import your custom hooks
import { useAuth } from "@/hooks/sessions/useAuth";
import { useUserProfile } from "@/hooks/sessions/useUserProfile";
import { useSessionTimer } from "@/hooks/sessions/useSessionTimer";
import { useMessages } from "@/hooks/sessions/useMessages";
import { useSuggestions } from "@/hooks/sessions/useSuggestions";
import { useSessionAPI } from "@/hooks/sessions/useSessionAPI";
import { useVapi } from "@/hooks/sessions/useVapi";

// Import components
import LoadingSpinner from "@/components/Loading";
import SessionNavigation from "@/components/session/SessionNav";
import AIAgentStatus from "@/components/session/AIAgentStatus";
import MessageList from "@/components/session/MessageList";
import SuggestionsList from "@/components/session/SuggestionList";

function Session() {
  // URL parameters
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const level = searchParams.get("level") || "1";

  // UI state
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  // Custom hooks
  const { userId, loading: authLoading } = useAuth();
  const { profileData, loading: profileLoading } = useUserProfile(userId);
  const { sessionTime } = useSessionTimer(callStatus);

  const {
    messages,
    messagesContainerRef,
    addMessage,
    hasEnoughMessages
  } = useMessages();

  const {
    suggestions,
    streamedResponse,
    suggestionStatus,
    suggestionsContainerRef,
    generateSuggestion
  } = useSuggestions();

  const {
    sendConversationToAPI,
    isSavingResults
  } = useSessionAPI();

  const {
    callStatus,
    isSpeaking,
    isMuted,
    loading: vapiLoading,
    vapiRef,
    toggleMicrophone,
    endCall
  } = useVapi(
    userId,
    profileData,
    level,
    sessionId,
    addMessage,
    generateSuggestion
  );

  // Handle session end
  const handleEndCall = async () => {
    endCall();

    try {
      if (hasEnoughMessages()) {
        await sendConversationToAPI(sessionId, messages, level);
        router.push(`/results/${sessionId}`);
      } else {
        window.location.href = "/too-short";
      }
    } catch (error) {
      console.error("Failed to get evaluation:", error);
      if (hasEnoughMessages()) {
        router.push(`/results/${sessionId}`);
      } else {
        window.location.href = "/too-short";
      }
    }
  };

  // Loading states
  if (authLoading || profileLoading || vapiLoading) {
    return <LoadingSpinner message="Calibrating AI" />;
  }

  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
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

        {/* Rest of your UI components using the hooks data */}
        {/* ... */}
      </div>
    </div>
  );
}

export default Session;
```

---

## Performance Optimizations

### 1. **React.memo for Components**

Wrap your components with `React.memo` to prevent unnecessary re-renders:

```typescript
// MessageList.tsx
export default React.memo(MessageList);

// SuggestionsList.tsx
export default React.memo(SuggestionsList);
```

### 2. **useMemo for Expensive Calculations**

```typescript
// In your hooks, wrap expensive calculations:
import { useMemo } from "react";

const formattedTime = useMemo(() => {
  return formatTime(sessionTime);
}, [sessionTime]);
```

### 3. **useCallback for Event Handlers**

```typescript
// In your hooks:
import { useCallback } from "react";

const addMessage = useCallback((message: SavedMessage) => {
  setMessages((prev) => [...prev, message]);
}, []);
```

### 4. **Debounce API Calls**

For suggestions API, add debouncing:

```typescript
import { useDebounce } from "use-debounce";

export function useSuggestions() {
  const [prompt, setPrompt] = useState("");
  const [debouncedPrompt] = useDebounce(prompt, 300); // 300ms delay

  useEffect(() => {
    if (!debouncedPrompt) return;
    // Generate suggestions
  }, [debouncedPrompt]);
}
```

---

## Best Practices

### ✅ **Do:**

1. **Start with one hook** and test it thoroughly
2. **Keep hooks focused** on single responsibilities
3. **Use TypeScript** for better type safety
4. **Return objects** from hooks (not arrays) for named properties
5. **Handle loading and error states** in each hook
6. **Write tests** for your custom hooks

### ❌ **Don't:**

1. **Extract everything** into hooks - some simple state can stay in components
2. **Make hooks too generic** - they should solve specific problems
3. **Ignore dependencies** in useEffect arrays
4. **Forget cleanup** functions in useEffect
5. **Create circular dependencies** between hooks

---

## Testing Strategy

### Testing Custom Hooks

Use `@testing-library/react-hooks` to test your hooks:

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useAuth } from "../useAuth";

test("should return user when authenticated", async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAuth());

  expect(result.current.loading).toBe(true);

  await waitForNextUpdate();

  expect(result.current.loading).toBe(false);
  expect(result.current.userId).toBe("user-123");
});
```

### Testing Components with Hooks

Mock your custom hooks in component tests:

```typescript
import { render } from '@testing-library/react';
import Session from '../Session';

// Mock the hooks
jest.mock('@/hooks/sessions/useAuth', () => ({
  useAuth: () => ({
    userId: 'user-123',
    loading: false
  })
}));

test('renders session when authenticated', () => {
  render(<Session />);
  // Test your component
});
```

---

## Migration Plan

### Phase 1: Extract Simple Hooks (Week 1)

1. Start with `useAuth` - simple and isolated
2. Test thoroughly
3. Update Session component to use it

### Phase 2: Extract Data Hooks (Week 2)

1. Create `useUserProfile`
2. Create `useMessages`
3. Test and integrate

### Phase 3: Extract Complex Hooks (Week 3)

1. Create `useSuggestions`
2. Create `useSessionAPI`
3. Test and integrate

### Phase 4: Extract Vapi Hook (Week 4)

1. Create `useVapi` - most complex
2. Extensive testing
3. Final integration

### Phase 5: Optimize (Week 5)

1. Add React.memo
2. Add useMemo/useCallback
3. Performance testing

---

## Summary

### Before: One Giant Component

- 800+ lines of mixed concerns
- Hard to test and maintain
- Difficult to reuse logic
- Poor performance

### After: Organized Custom Hooks

- 6 focused custom hooks
- Clean, readable main component
- Easily testable pieces
- Reusable logic
- Better performance

### Benefits You'll Gain:

1. **Maintainability**: Easier to find and fix bugs
2. **Reusability**: Use hooks in other components
3. **Testability**: Test each piece separately
4. **Performance**: Better optimization opportunities
5. **Team Collaboration**: Multiple people can work on different hooks
6. **Code Quality**: Following React best practices

Start with one hook, test it, then move to the next. You don't need to refactor everything at once!

---

## Next Steps

1. **Create the hooks directory structure**
2. **Start with `useAuth`** (simplest)
3. **Test each hook** as you create it
4. **Gradually migrate** your Session component
5. **Add performance optimizations** once everything works
6. **Write comprehensive tests**

Remember: **Refactoring is a journey, not a destination!** Take it one step at a time. 🚀
