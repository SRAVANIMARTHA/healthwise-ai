export interface ChatMessageSource {
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  intent: string | null;
  urgency_level: 'normal' | 'moderate' | 'urgent' | 'critical';
  sources: ChatMessageSource[];
  created_at: string;
  isEmergencyAlert?: boolean;
}

export interface ChatSession {
  id: string;
  user_id: string | null;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  // Client-side computed
  lastMessage?: string;
  messageCount?: number;
}

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  error: string | null;
}
