import { create } from 'zustand';
import { ChatSession, ChatMessage } from '../types/chat';
import { chatService } from '../services/chat/chat-service';
import { puterAIService } from '../services/ai/puter-ai-service';
import { analyticsService } from '../services/admin/analytics-service';

interface ChatStoreState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  // Session actions
  loadSessions: (userId: string | null) => Promise<void>;
  createSession: (userId: string | null, title?: string) => Promise<string | null>;
  setActiveSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  deleteAllSessions: (userId: string) => Promise<void>;

  // Message actions
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isTyping: false,
  isLoadingSessions: false,
  isLoadingMessages: false,
  error: null,

  loadSessions: async (userId: string | null) => {
    set({ isLoadingSessions: true, error: null });
    try {
      const sessions = await chatService.getSessions(userId);
      set({ sessions, isLoadingSessions: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load sessions', isLoadingSessions: false });
    }
  },

  createSession: async (userId: string | null, title?: string) => {
    set({ error: null });
    try {
      const session = await chatService.createSession(userId, title);
      if (!session) {
        set({ error: 'Failed to create conversation.' });
        return null;
      }

      // Add welcome message
      const welcomeMsg = await chatService.addMessage({
        session_id: session.id,
        sender: 'assistant',
        content: 'Hello! I\'m **HealthWise AI**, your educational assistant for public health awareness and disease prevention.\n\nYou can ask me about:\n- 🦟 Disease symptoms and prevention (dengue, diabetes, hypertension, etc.)\n- 💉 Vaccination schedules and safety\n- 🧼 Hygiene and infection control\n- 🥗 Nutrition and healthy lifestyle habits\n\n> *Note: I provide educational information only and cannot diagnose or prescribe treatment. Always consult a qualified doctor for medical advice.*\n\nHow can I help you today?',
        intent: null,
        urgency_level: 'normal',
        sources: [
          { name: 'World Health Organization (WHO)', url: 'https://www.who.int' },
          { name: 'CDC Public Health Guidelines', url: 'https://www.cdc.gov' },
        ],
      });

      const messages = welcomeMsg ? [welcomeMsg] : [];

      set((state) => ({
        sessions: [session, ...state.sessions],
        activeSessionId: session.id,
        messages,
      }));
      return session.id;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create conversation.' });
      return null;
    }
  },

  setActiveSession: async (sessionId: string) => {
    set({ activeSessionId: sessionId, isLoadingMessages: true, error: null });
    try {
      const messages = await chatService.getMessages(sessionId);
      set({ messages, isLoadingMessages: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load messages', isLoadingMessages: false });
    }
  },

  deleteSession: async (sessionId: string) => {
    const success = await chatService.deleteSession(sessionId);
    if (success) {
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        messages: state.activeSessionId === sessionId ? [] : state.messages,
      }));
    }
  },

  deleteAllSessions: async (userId: string) => {
    const success = await chatService.deleteAllSessions(userId);
    if (success) {
      set({ sessions: [], activeSessionId: null, messages: [] });
    }
  },

  sendMessage: async (content: string) => {
    const { activeSessionId, messages } = get();
    if (!activeSessionId || !content.trim()) return;

    set({ error: null });

    // 1. Persist user message
    const userMsg = await chatService.addMessage({
      session_id: activeSessionId,
      sender: 'user',
      content: content.trim(),
      intent: null,
      urgency_level: 'normal',
      sources: [],
    });

    if (!userMsg) {
      set({ error: 'Failed to send message.' });
      return;
    }

    set((state) => ({ messages: [...state.messages, userMsg] }));

    // 2. Auto-title session from first user message
    const userMsgCount = [...messages, userMsg].filter(m => m.sender === 'user').length;
    if (userMsgCount === 1) {
      const autoTitle = content.trim().length > 50
        ? content.trim().slice(0, 47) + '...'
        : content.trim();
      await chatService.updateSessionTitle(activeSessionId, autoTitle);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === activeSessionId ? { ...s, title: autoTitle } : s
        ),
      }));
    }

    // 3. Generate response using Puter.js AI (with system prompt, emergency detection, & graceful fallback)
    set({ isTyping: true });

    const conversationHistory = messages
      .filter((m) => m.sender === 'user' || m.sender === 'assistant')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const aiResult = await puterAIService.generateResponse(content, conversationHistory);

    const assistantMsg = await chatService.addMessage({
      session_id: activeSessionId,
      sender: 'assistant',
      content: aiResult.content,
      intent: null,
      urgency_level: aiResult.urgency,
      sources: aiResult.sources,
    });

    if (assistantMsg) {
      if (aiResult.isEmergency) {
        assistantMsg.isEmergencyAlert = true;
      }
      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isTyping: false,
      }));

      // Log privacy-safe query answered event for Admin Analytics (No PII)
      try {
        const topicGuessed = aiResult.sources?.[0]?.name ? aiResult.sources[0].name.replace(/^WHO\s*-\s*/, '') : 'General Health Inquiry';
        analyticsService.logEvent({
          event_type: 'query_answered',
          topic: topicGuessed,
          language: 'en',
          metadata: {
            urgency: aiResult.urgency,
            grounded: Boolean(aiResult.sources && aiResult.sources.length > 0),
            sourcesCount: aiResult.sources?.length || 0,
          },
        }).catch(() => {});
      } catch {
        // Analytics must never disrupt chat flow
      }
    } else {
      set({ isTyping: false, error: 'Failed to save AI response.' });
    }
  },

  clearMessages: () => set({ messages: [], activeSessionId: null }),
  clearError: () => set({ error: null }),
}));
