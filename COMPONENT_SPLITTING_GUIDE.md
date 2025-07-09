# Component Splitting Guide for Session Page

## Overview

Your current `Session` component is a large, complex component that handles multiple responsibilities. This guide will teach you how to split it into smaller, reusable components following React best practices.

## Why Split Components?

### Benefits of Component Splitting:

1. **Maintainability**: Smaller components are easier to understand and modify
2. **Reusability**: Components can be used in multiple places
3. **Testing**: Smaller components are easier to test
4. **Performance**: Better optimization opportunities
5. **Collaboration**: Team members can work on different components simultaneously
6. **Debugging**: Easier to isolate and fix issues

## Current Component Analysis

Your `Session` component currently handles:

- ✅ Session state management (call status, timer, messages)
- ✅ Vapi integration (voice AI)
- ✅ User profile data fetching
- ✅ Real-time suggestions
- ✅ Live transcript display
- ✅ Navigation and controls
- ✅ Mobile/desktop responsive layout

## Proposed Component Structure

```
Session (Main Container)
├── SessionNavigation
│   ├── MuteButton
│   ├── SessionTitle
│   └── EndSessionButton
├── AIAgentStatus
├── SessionContent
│   ├── SuggestionsPanel
│   │   ├── SuggestionsList
│   │   └── SuggestionsLoading
│   └── TranscriptPanel
│       └── MessageList
│           └── Message
└── MobileTabs
```

## Step-by-Step Implementation Guide

### Step 1: Create a Components Directory Structure

First, create a new directory structure for your session components:

```
components/
└── session/
    ├── SessionNavigation.tsx
    ├── MuteButton.tsx
    ├── EndSessionButton.tsx
    ├── AIAgentStatus.tsx
    ├── SessionContent.tsx
    ├── SuggestionsPanel.tsx
    ├── SuggestionsList.tsx
    ├── TranscriptPanel.tsx
    ├── MessageList.tsx
    ├── Message.tsx
    ├── MobileTabs.tsx
    └── types.ts
```

### Step 2: Define Types and Interfaces

**File: `components/session/types.ts`**

```typescript
// Define all the types used across session components
export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

export interface SavedMessage {
  role: string;
  content: string;
}

export interface SessionProps {
  sessionId: string;
  level: string;
}

export interface NavigationProps {
  isMuted: boolean;
  callStatus: CallStatus;
  level: string;
  isSavingResults: boolean;
  onToggleMicrophone: () => void;
  onEndCall: () => void;
  vapiRef: React.RefObject<any>;
}

export interface AIAgentStatusProps {
  callStatus: CallStatus;
  isSpeaking: boolean;
  level: string;
  sessionTime: number;
}

export interface SuggestionsPanelProps {
  suggestionStatus: "waiting" | "generating" | "ready";
  suggestions: string[];
  streamedResponse: string;
  isVisible: boolean;
}

export interface TranscriptPanelProps {
  messages: SavedMessage[];
  isVisible: boolean;
}

export interface MobileTabsProps {
  suggestionsVisible: boolean;
  onTabChange: (showSuggestions: boolean) => void;
}
```

### Step 3: Create Individual Components

#### 3.1 MuteButton Component

**File: `components/session/MuteButton.tsx`**

```typescript
"use client";
import React from 'react';
import { CallStatus } from './types';

interface MuteButtonProps {
  isMuted: boolean;
  callStatus: CallStatus;
  onToggle: () => void;
  vapiRef: React.RefObject<any>;
}

/**
 * MuteButton Component
 *
 * Purpose: Handles microphone muting/unmuting functionality
 *
 * Props:
 * - isMuted: Current mute state
 * - callStatus: Current call status to determine if button should be enabled
 * - onToggle: Function to call when button is clicked
 * - vapiRef: Reference to Vapi instance to check availability
 *
 * Best Practices Demonstrated:
 * - Single responsibility: Only handles mute functionality
 * - Clear prop interface with TypeScript
 * - Accessibility features (aria-label, title)
 * - Conditional styling based on state
 */
export default function MuteButton({
  isMuted,
  callStatus,
  onToggle,
  vapiRef
}: MuteButtonProps) {
  const isDisabled = !vapiRef.current || callStatus === CallStatus.INACTIVE;

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`${isMuted ? "bg-red-600" : "bg-white/10"} ${
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white/20"
      } p-2 rounded-full transition-colors`}
      aria-label="Mute Microphone"
      title={
        isDisabled
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
          />
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
  );
}
```

#### 3.2 EndSessionButton Component

**File: `components/session/EndSessionButton.tsx`**

```typescript
"use client";
import React from 'react';

interface EndSessionButtonProps {
  isSavingResults: boolean;
  onEndCall: () => void;
}

/**
 * EndSessionButton Component
 *
 * Purpose: Handles session termination
 *
 * Best Practices:
 * - Loading state management
 * - Clear user feedback
 * - Disabled state handling
 */
export default function EndSessionButton({
  isSavingResults,
  onEndCall
}: EndSessionButtonProps) {
  return (
    <button
      onClick={onEndCall}
      disabled={isSavingResults}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-white font-bold py-2 px-2 md:px-4 rounded-lg flex items-center gap-2 text-sm md:text-base"
    >
      {isSavingResults ? (
        <span>Processing...</span>
      ) : (
        <span>End Session</span>
      )}
    </button>
  );
}
```

#### 3.3 SessionNavigation Component

**File: `components/session/SessionNavigation.tsx`**

```typescript
"use client";
import React from 'react';
import MuteButton from './MuteButton';
import EndSessionButton from './EndSessionButton';
import { NavigationProps } from './types';

/**
 * SessionNavigation Component
 *
 * Purpose: Manages the top navigation bar of the session
 *
 * Composition Pattern:
 * - Uses smaller components (MuteButton, EndSessionButton)
 * - Handles layout and positioning
 * - Passes props down to child components
 *
 * Best Practices:
 * - Composition over large monolithic components
 * - Clear prop drilling (passing props to children)
 * - Responsive design considerations
 */
export default function SessionNavigation({
  isMuted,
  callStatus,
  level,
  isSavingResults,
  onToggleMicrophone,
  onEndCall,
  vapiRef
}: NavigationProps) {
  return (
    <nav className="bg-[#2F2F7F] z-5 p-4 shadow-lg flex-shrink-0">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Mute Button */}
        <div className="flex items-center">
          <MuteButton
            isMuted={isMuted}
            callStatus={callStatus}
            onToggle={onToggleMicrophone}
            vapiRef={vapiRef}
          />
        </div>

        {/* Center: Session Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="font-semibold text-sm md:text-lg">
            IELTS Speaking {level}
          </span>
        </div>

        {/* Right: End Session Button */}
        <EndSessionButton
          isSavingResults={isSavingResults}
          onEndCall={onEndCall}
        />
      </div>
    </nav>
  );
}
```

#### 3.4 AIAgentStatus Component

**File: `components/session/AIAgentStatus.tsx`**

```typescript
"use client";
import React from 'react';
import { AIAgentStatusProps } from './types';
import { CallStatus } from './types';

/**
 * AIAgentStatus Component
 *
 * Purpose: Displays the current status of the AI agent and session timer
 *
 * Features:
 * - Visual indicator with pulsing animation
 * - Status text based on call state
 * - Session timer display
 * - Responsive design
 *
 * Best Practices:
 * - Pure component (no side effects)
 * - Clear status messaging
 * - Visual feedback for user
 */
export default function AIAgentStatus({
  callStatus,
  isSpeaking,
  level,
  sessionTime
}: AIAgentStatusProps) {

  // Helper function for time formatting
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Helper function for status text
  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.ACTIVE:
        return isSpeaking ? "AI is speaking" : "Your turn to speak";
      case CallStatus.FINISHED:
        return "Session ended";
      default:
        return "Ready to start";
    }
  };

  return (
    <div className="h-1/4 min-h-[200px] flex-shrink-0 bg-[#2F2F7F]/30 p-4 text-center flex flex-col items-center justify-center border-b border-white/10 relative">
      {/* AI Agent Visual Indicator */}
      <div className="relative inline-flex items-center justify-center w-28 h-28 mx-auto">
        <div
          className={`absolute w-full h-full bg-[#E62136]/50 rounded-full ${
            isSpeaking ? "animate-pulse" : ""
          }`}
        />
        <div className="relative w-24 h-24 bg-[#1a1a3a] rounded-full flex items-center justify-center">
          <p className="font-bold text-2xl text-[#E62136]">{level}</p>
        </div>
      </div>

      {/* Status Text */}
      <p className="text-xl font-bold mt-4">
        {getStatusText()}
      </p>

      {/* Session Timer */}
      <p className="text-gray-400 text-sm">
        Session Timer: {formatTime(sessionTime)}
      </p>
    </div>
  );
}
```

#### 3.5 Message Component

**File: `components/session/Message.tsx`**

```typescript
"use client";
import React from 'react';
import { SavedMessage } from './types';

interface MessageProps {
  message: SavedMessage;
}

/**
 * Message Component
 *
 * Purpose: Renders a single message in the transcript
 *
 * Features:
 * - Different styling for user vs assistant messages
 * - Icons for message types
 * - Responsive layout
 *
 * Best Practices:
 * - Single responsibility (renders one message)
 * - Conditional rendering based on message role
 * - Reusable component
 */
export default function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex items-start gap-4 ${
        message.role === "user" ? "justify-end" : ""
      }`}
    >
      {/* Assistant Avatar */}
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

      {/* Message Content */}
      <div
        className={`p-4 max-w-xl ${
          message.role === "assistant"
            ? "bg-[#2F2F7F] rounded-r-xl rounded-bl-xl"
            : "bg-[#E62136] rounded-l-xl rounded-br-xl"
        }`}
      >
        <p>{message.content}</p>
      </div>

      {/* User Avatar */}
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
  );
}
```

#### 3.6 MessageList Component

**File: `components/session/MessageList.tsx`**

```typescript
"use client";
import React from 'react';
import Message from './Message';
import { SavedMessage } from './types';

interface MessageListProps {
  messages: SavedMessage[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

/**
 * MessageList Component
 *
 * Purpose: Renders the list of messages in the transcript
 *
 * Features:
 * - Scrollable container
 * - Empty state handling
 * - Reverse chronological order (newest first)
 *
 * Best Practices:
 * - List rendering with keys
 * - Empty state handling
 * - Ref forwarding for scroll control
 */
export default function MessageList({
  messages,
  messagesContainerRef
}: MessageListProps) {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto pr-4 space-y-6 custom-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>Conversation will appear here once the session starts...</p>
        </div>
      ) : (
        messages
          .slice()
          .reverse() // Show newest messages first
          .map((message, index) => (
            <Message key={index} message={message} />
          ))
      )}
    </div>
  );
}
```

#### 3.7 SuggestionsList Component

**File: `components/session/SuggestionsList.tsx`**

```typescript
"use client";
import React from 'react';
import LoadingSpinner from '@/components/Loading';

interface SuggestionsListProps {
  suggestionStatus: "waiting" | "generating" | "ready";
  suggestions: string[];
  streamedResponse: string;
}

/**
 * SuggestionsList Component
 *
 * Purpose: Renders the list of AI-generated suggestions
 *
 * Features:
 * - Different states (waiting, generating, ready)
 * - Real-time streaming display
 * - Visual indicators for suggestion status
 *
 * Best Practices:
 * - State-based rendering
 * - Loading states
 * - Clear visual hierarchy
 */
export default function SuggestionsList({
  suggestionStatus,
  suggestions,
  streamedResponse
}: SuggestionsListProps) {

  if (suggestionStatus === "waiting") {
    return (
      <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
        <h4 className="font-bold text-gray-400 mb-2">
          Waiting for conversation to start...
        </h4>
        <p className="text-sm text-gray-500">
          Once the conversation starts you will get suggestions on what to say next
        </p>
      </div>
    );
  }

  if (suggestionStatus === "generating") {
    return (
      <>
        {/* Show loading spinner if no streamed response yet */}
        {!streamedResponse && (
          <LoadingSpinner size="sm" fullScreen={false} message="" />
        )}

        {/* Show current streaming suggestion */}
        {streamedResponse && (
          <div className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-red-600 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
              <p className="text-md text-gray-300">{streamedResponse}</p>
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
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-md text-gray-300">{suggestion}</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Ready state or has suggestions
  if (suggestions.length > 0) {
    return (
      <>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-[#2f2f7f]/80 p-4 rounded-lg border border-transparent hover:border-red-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 ${
                  index === 0 ? "bg-red-500" : "bg-green-500"
                } rounded-full mt-2 flex-shrink-0`}
              />
              <p className="text-md text-gray-300">{suggestion}</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  // No suggestions available
  return (
    <div className="bg-[#2F2F7F]/80 p-4 rounded-lg border border-transparent text-center">
      <h4 className="font-bold text-gray-400">No suggestions available</h4>
    </div>
  );
}
```

### Step 4: Update Your Main Session Component

Now you'll update your main Session component to use these smaller components:

**File: `app/(main-app)/levels/[sessionId]/page.tsx`**

```typescript
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

// Import your new components
import SessionNavigation from "@/components/session/SessionNavigation";
import AIAgentStatus from "@/components/session/AIAgentStatus";
import MessageList from "@/components/session/MessageList";
import SuggestionsList from "@/components/session/SuggestionsList";
import { CallStatus, SavedMessage } from "@/components/session/types";

// ... other imports ...

/**
 * Main Session Component
 *
 * Now this component focuses on:
 * - State management
 * - API calls and data fetching
 * - Business logic
 * - Coordination between child components
 *
 * The UI rendering is delegated to specialized components
 */
function Session() {
  // ... all your existing state and logic ...

  return (
    <div className="bg-[#1a1a3a] text-white flex flex-col h-screen overflow-hidden">
      {/* Navigation - Now a separate component */}
      <SessionNavigation
        isMuted={isMuted}
        callStatus={callStatus}
        level={level}
        isSavingResults={isSavingResults}
        onToggleMicrophone={toggleMicrophone}
        onEndCall={EndCall}
        vapiRef={vapiRef}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* AI Agent Status - Now a separate component */}
        <AIAgentStatus
          callStatus={callStatus}
          isSpeaking={isSpeaking}
          level={level}
          sessionTime={sessionTime}
        />

        {/* Rest of your layout with suggestions and transcript */}
        <div className="flex-grow flex flex-col sm:flex-row overflow-hidden">
          {/* Your existing mobile tabs and desktop layout */}
          {/* But now using the new components like SuggestionsList and MessageList */}
        </div>
      </div>
    </div>
  );
}
```

## Best Practices Explained

### 1. **Single Responsibility Principle**

Each component should have one clear purpose:

- `MuteButton` only handles muting
- `Message` only renders a single message
- `AIAgentStatus` only shows status information

### 2. **Props Interface Design**

Always define clear TypeScript interfaces for props:

```typescript
interface ComponentProps {
  requiredProp: string;
  optionalProp?: boolean;
  callback: () => void;
}
```

### 3. **State Management**

- Keep state in the highest component that needs it
- Pass state down through props
- Pass callbacks up for state changes

### 4. **Component Composition**

Build larger components by combining smaller ones:

```typescript
// Good: Composition
<SessionNavigation>
  <MuteButton />
  <SessionTitle />
  <EndSessionButton />
</SessionNavigation>

// Avoid: One giant component doing everything
```

### 5. **Separation of Concerns**

- **Container Components**: Handle logic, state, API calls
- **Presentation Components**: Handle UI rendering only
- **Custom Hooks**: Handle reusable logic

### 6. **File Organization**

```
components/
├── session/           # Feature-based grouping
│   ├── types.ts      # Shared types
│   ├── hooks.ts      # Custom hooks
│   └── components/   # Individual components
└── ui/               # Reusable UI components
```

## Migration Strategy

### Phase 1: Extract Simple Components

Start with components that have no dependencies:

1. `MuteButton`
2. `EndSessionButton`
3. `Message`

### Phase 2: Extract Container Components

Move larger sections:

1. `SessionNavigation`
2. `AIAgentStatus`
3. `MessageList`

### Phase 3: Extract Complex Components

Handle components with complex state:

1. `SuggestionsList`
2. `SuggestionsPanel`
3. `SessionContent`

### Phase 4: Custom Hooks

Extract reusable logic:

1. `useVapi` - Handle Vapi integration
2. `useSessionTimer` - Handle timer logic
3. `useSuggestions` - Handle suggestions logic

## Custom Hooks Example

**File: `hooks/useSessionTimer.ts`**

```typescript
import { useState, useEffect } from "react";
import { CallStatus } from "@/components/session/types";

/**
 * Custom Hook for Session Timer
 *
 * Purpose: Encapsulate timer logic
 * Benefits: Reusable, testable, clean separation
 */
export function useSessionTimer(callStatus: CallStatus) {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => setSessionTime((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { sessionTime, formatTime };
}
```

## Testing Strategy

With smaller components, testing becomes much easier:

```typescript
// Example test for MuteButton
import { render, fireEvent } from '@testing-library/react';
import MuteButton from '@/components/session/MuteButton';

test('calls onToggle when clicked', () => {
  const mockToggle = jest.fn();
  const { getByRole } = render(
    <MuteButton
      isMuted={false}
      callStatus={CallStatus.ACTIVE}
      onToggle={mockToggle}
      vapiRef={{ current: {} }}
    />
  );

  fireEvent.click(getByRole('button'));
  expect(mockToggle).toHaveBeenCalled();
});
```

## Performance Benefits

### 1. **React.memo Optimization**

Smaller components can be optimized individually:

```typescript
export default React.memo(MuteButton);
```

### 2. **Lazy Loading**

Load components only when needed:

```typescript
const SuggestionsPanel = lazy(() => import("./SuggestionsPanel"));
```

### 3. **Bundle Splitting**

Smaller components enable better code splitting.

## Conclusion

Splitting your large component into smaller pieces will:

- Make your code more maintainable
- Improve testability
- Enable better performance optimizations
- Make collaboration easier
- Follow React best practices

Start small, test as you go, and gradually refactor your existing component. Remember: **refactoring is an iterative process** - you don't need to do everything at once!

## Next Steps

1. Create the component files shown above
2. Start with the simplest components first
3. Test each component as you create it
4. Gradually move logic from the main component to specialized components
5. Consider creating custom hooks for complex logic
6. Add TypeScript interfaces for better type safety

Good luck with your refactoring journey! 🚀
