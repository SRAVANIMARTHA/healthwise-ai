/**
 * FloatingHealthWiseAI.tsx — Global Floating AI Assistant / Robot Chat Interface (Phase 16)
 *
 * A modern, accessible, floating HealthWise AI robot companion anchored near the bottom-right corner.
 * Connects directly to the existing Chat / RAG / Puter / Safety architecture via useChat().
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  ExternalLink,
  Maximize2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Mic,
  FileText,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useTranslation } from '../../hooks/useTranslation';
import { useVoiceMode } from '../../hooks/useVoiceMode';
import { VoiceModeModal } from './VoiceModeModal';
import { securitySanitizer } from '../../services/security/sanitizer';

export const FloatingHealthWiseAI: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Connect directly to the existing chat hook
  const {
    messages,
    isTyping,
    isSearching,
    error,
    send,
    startNewChat,
    activeSessionId,
    clearError,
  } = useChat();

  // Phase 17: Conversational Voice Mode Hook
  const {
    isOpen: isVoiceModalOpen,
    voiceState,
    transcript,
    interimTranscript,
    spokenResponse,
    errorMessage: voiceErrorMessage,
    openVoiceMode,
    closeVoiceMode,
    startListening,
    handleInterrupt,
  } = useVoiceMode({
    onSendMessage: send,
    isTyping,
    isSearching,
    messages,
  });

  const hasEmergencyAlert = messages.some(
    (m) => m.isEmergencyAlert || m.urgency_level === 'critical'
  );

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissedIntro, setHasDismissedIntro] = useState(() => {
    try {
      return localStorage.getItem('hw_intro_bubble_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not display on full /chat page to avoid redundant floating assistant
  const isChatRoute = location.pathname.startsWith('/chat');

  // Auto-scroll messages in panel
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Click outside to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerBtnRef.current &&
        !triggerBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [isOpen]);

  // Escape key handler: close panel and restore focus to robot trigger button
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerBtnRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Toggle open/close with focus restoration on close
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) {
        triggerBtnRef.current?.focus();
      }
      return next;
    });
    // Dismiss intro bubble upon explicit interaction
    if (!hasDismissedIntro) {
      setHasDismissedIntro(true);
      try {
        localStorage.setItem('hw_intro_bubble_dismissed', 'true');
      } catch {
        // ignore storage errors
      }
    }
  }, [hasDismissedIntro]);

  const handleDismissIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasDismissedIntro(true);
    try {
      localStorage.setItem('hw_intro_bubble_dismissed', 'true');
    } catch {
      // ignore storage errors
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping || isSearching) return;

    setInput('');
    clearError();
    await send(query);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFullChat = () => {
    setIsOpen(false);
    if (activeSessionId) {
      navigate(`/chat/${activeSessionId}`);
    } else {
      navigate('/chat');
    }
  };

  // Safe markdown formatting helper (without double-encoding)
  const renderSimpleMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Sample starter prompts
  const samplePrompts = [
    'What is dengue?',
    'How to prevent diabetes?',
    'What vaccines do adults need?',
  ];

  if (isChatRoute) {
    return null;
  }

  const isWorking = isSearching || isTyping;

  return (
    <aside
      aria-label="HealthWise AI Assistant"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end select-none"
    >
      {/* Introductory Onboarding Speech Bubble (shown until dismissed or interacted with) */}
      {!isOpen && !hasDismissedIntro && (
        <div
          role="status"
          className="mb-2 max-w-xs bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-2xl shadow-lg border border-teal-100 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-teal-800">Hi! I'm HealthWise AI 👋</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Need quick answers to a health question?</p>
          </div>
          <button
            onClick={handleDismissIntro}
            aria-label="Dismiss greeting"
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hover Tooltip (desktop only) */}
      {!isOpen && hasDismissedIntro && showTooltip && (
        <div
          role="tooltip"
          id="hw-floating-tooltip"
          className="hidden sm:block mb-2 bg-slate-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md pointer-events-none transition-opacity"
        >
          Chat with HealthWise AI
        </div>
      )}

      {/* Compact Chat Panel */}
      {isOpen && (
        <section
          ref={panelRef}
          id="hw-floating-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="hw-floating-chat-title"
          className="w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] h-[520px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col mb-3 overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-right"
        >
          {/* Header */}
          <header className="px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
                <Bot className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="hw-floating-chat-title" className="text-sm font-bold leading-tight">
                  HealthWise AI
                </h2>
                <span className="flex items-center gap-1 text-[10px] text-teal-100 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
                  {t('chat', 'evidenceGrounded')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={openVoiceMode}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] font-medium"
                title="Start Voice Mode"
                aria-label="Start Voice Mode"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice</span>
              </button>
              <button
                onClick={handleOpenFullChat}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
                title="Open full chat page"
                aria-label="Open full chat page"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={togglePanel}
                className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
                aria-label="Close HealthWise AI assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-6 px-2 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center mx-auto">
                  <Bot className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Hi! I'm HealthWise AI 👋</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ask me about disease awareness, prevention tips, or health topics.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Try asking:</p>
                  {samplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left p-2 rounded-xl bg-white border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/50 text-slate-700 text-[11px] font-medium transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isAlert = m.isEmergencyAlert || m.urgency_level === 'critical';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                          isUser
                            ? 'bg-teal-600 text-white rounded-br-sm'
                            : isAlert
                            ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-sm'
                            : 'bg-white border border-slate-200/80 text-slate-700 shadow-xs rounded-bl-sm'
                        }`}
                      >
                        {isAlert && (
                          <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1 pb-1 border-b border-rose-200 text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>EMERGENCY ADVISORY</span>
                          </div>
                        )}
                        <div>{renderSimpleMarkdown(m.content)}</div>

                        {/* Citations chip */}
                        {m.sources && m.sources.length > 0 && !isUser && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                            {m.sources.map((s, idx) => {
                              const isSafe = securitySanitizer.isSafeUrl(s.url);
                              return (
                                <a
                                  key={idx}
                                  href={isSafe ? s.url : '#'}
                                  target={isSafe ? '_blank' : undefined}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200/70 px-1.5 py-0.5 rounded text-[9px] font-medium hover:bg-teal-100 transition-colors"
                                >
                                  <span>{s.name}</span>
                                  <ExternalLink className="w-2 h-2 opacity-60" aria-hidden="true" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading / Searching indicator */}
                {isWorking && (
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-xl w-fit shadow-xs animate-in fade-in" role="status">
                    <RefreshCw className="w-3 h-3 text-teal-600 animate-spin" aria-hidden="true" />
                    <span>
                      {isSearching ? 'Searching knowledge base…' : t('chat', 'analyzing')}
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-2 rounded-xl flex items-center justify-between" role="alert">
                    <span>{error}</span>
                    <button onClick={clearError} className="p-0.5 hover:text-rose-900">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Footer Links */}
          <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenFullChat}
                className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
              >
                <span>Full chat</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/report');
                }}
                className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
                title="Explain a lab report"
              >
                <FileText className="w-2.5 h-2.5" />
                <span>Report</span>
              </button>
            </div>
            <button
              onClick={() => startNewChat()}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              {t('chat', 'newChat')}
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDownInput}
              disabled={isWorking}
              placeholder={t('chat', 'placeholder')}
              className="flex-1 text-xs py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50"
              aria-label="Type your health question"
            />
            <button
              type="button"
              onClick={openVoiceMode}
              title="Voice Mode"
              aria-label="Start Voice Mode"
              className="w-8 h-8 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isWorking}
              aria-label={t('chat', 'send')}
              className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      )}

      {/* Voice Mode Modal */}
      <VoiceModeModal
        isOpen={isVoiceModalOpen}
        voiceState={voiceState}
        transcript={transcript}
        interimTranscript={interimTranscript}
        spokenResponse={spokenResponse}
        errorMessage={voiceErrorMessage}
        onClose={closeVoiceMode}
        onInterrupt={handleInterrupt}
        onStartListening={startListening}
        hasEmergencyAlert={hasEmergencyAlert}
      />

      {/* Floating Robot Avatar Button */}
      <button
        ref={triggerBtnRef}
        onClick={togglePanel}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Chat with HealthWise AI assistant"
        aria-expanded={isOpen}
        aria-controls="hw-floating-chat-panel"
        aria-describedby={!isOpen && hasDismissedIntro ? 'hw-floating-tooltip' : undefined}
        className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-teal-600/30 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-teal-500 focus:ring-offset-2 active:scale-95 ${
          isOpen ? 'rotate-90 bg-teal-800' : ''
        }`}
      >
        {/* Subtle pulsing status ring when AI is actively thinking/searching */}
        {isWorking && (
          <span
            className="absolute inset-0 rounded-full bg-teal-400/40 animate-ping pointer-events-none"
            aria-hidden="true"
          />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform" aria-hidden="true" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7" aria-hidden="true" />
            {/* Small status dot indicator */}
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                isWorking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
              aria-hidden="true"
            />
          </div>
        )}
      </button>
    </aside>
  );
};
