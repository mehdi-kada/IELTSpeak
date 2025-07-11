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