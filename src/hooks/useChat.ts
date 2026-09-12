import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chat-store';
import { useAuth } from './useAuth';

let pendingSessionPromise: Promise<string | null> | null = null;

export const useChat = () => {
  const {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isLoadingSessions,
    isLoadingMessages,
    error,
    loadSessions,
    createSession,
    setActiveSession,
    deleteSession,
    deleteAllSessions,
    sendMessage,
    clearMessages,
    clearError,
  } = useChatStore();

  const { user } = useAuth();

  const userId = user?.id || null;

  // Load sessions on mount (when user is available)
  useEffect(() => {
    loadSessions(userId);
  }, [userId, loadSessions]);

  const startNewChat = useCallback(async () => {
    return createSession(userId);
  }, [userId, createSession]);

  // Synchronized session creation promise to prevent concurrent race conditions
  const send = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    let targetSessionId = useChatStore.getState().activeSessionId;

    if (!targetSessionId) {
      if (!pendingSessionPromise) {
        pendingSessionPromise = createSession(userId).finally(() => {
          pendingSessionPromise = null;
        });
      }
      targetSessionId = await pendingSessionPromise;
    }

    if (targetSessionId) {
      await sendMessage(trimmed);
    }
  }, [userId, createSession, sendMessage]);

  const removeSession = useCallback(async (sessionId: string) => {
    await deleteSession(sessionId);
  }, [deleteSession]);

  const clearAllHistory = useCallback(async () => {
    if (userId) {
      await deleteAllSessions(userId);
    }
  }, [userId, deleteAllSessions]);

  return {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isLoadingSessions,
    isLoadingMessages,
    error,
    startNewChat,
    send,
    setActiveSession,
    removeSession,
    clearAllHistory,
    clearMessages,
    clearError,
  };
};
