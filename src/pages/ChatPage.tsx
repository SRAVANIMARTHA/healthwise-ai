import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ArrowLeft,
  ExternalLink,
  History,
  Trash2,
  MessageSquare,
  X,
  Menu,
  Sparkles,
  PhoneCall,
  Mic,
  FileText,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmergencyBanner } from '../components/common/EmergencyBanner';
import { HotlineModal } from '../components/common/HotlineModal';
import { AIAvatar } from '../components/chat/AIAvatar';
import { VoiceModeModal } from '../components/chat/VoiceModeModal';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { useVoiceMode } from '../hooks/useVoiceMode';
import { puterAIService } from '../services/ai/puter-ai-service';
import { feedbackService } from '../services/admin/feedback-service';
import { securitySanitizer } from '../services/security/sanitizer';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const initialPrompt = searchParams.get('prompt') || '';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'positive' | 'negative'>>({});

  const {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isSearching,
    isLoadingSessions,
    isLoadingMessages,
    error,
    startNewChat,
    send,
    setActiveSession,
    removeSession,
    clearMessages,
    clearError,
  } = useChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHotlinesOpen, setIsHotlinesOpen] = useState(false);
  const [dismissedEmergency, setDismissedEmergency] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedPromptRef = useRef<string | null>(null);

  // Phase 17: Voice Mode integration
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load session from URL parameter
  useEffect(() => {
    if (urlSessionId && urlSessionId !== activeSessionId) {
      setActiveSession(urlSessionId);
    }
  }, [urlSessionId, activeSessionId, setActiveSession]);

  // Handle initial prompt from URL idempotently and clear search param upon consumption
  useEffect(() => {
    if (initialPrompt && processedPromptRef.current !== initialPrompt && !isLoadingSessions) {
      processedPromptRef.current = initialPrompt;
      // Strip prompt query parameter from URL so it cannot be re-triggered
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('prompt');
      const nextSearch = nextParams.toString();
      navigate(
        { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' },
        { replace: true }
      );
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isLoadingSessions, searchParams, navigate, location.pathname]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    setInput('');
    await send(query.trim());
  };

  const handleNewChat = async () => {
    const newId = await startNewChat();
    if (newId) {
      navigate(`/chat/${newId}`, { replace: true });
    }
    setSidebarOpen(false);
  };

  const handleSelectSession = async (sid: string) => {
    await setActiveSession(sid);
    navigate(`/chat/${sid}`, { replace: true });
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    await removeSession(sid);
  };

  const samplePrompts = [
    'What are common symptoms of dengue?',
    'How can I prevent diabetes through diet?',
    'What vaccines are recommended for adults?',
    'How to manage high blood pressure naturally?',
    'What are hand hygiene best practices?',
    'Is dengue contagious from person to person?',
  ];

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 86400000) return 'Today';
      if (diff < 172800000) return 'Yesterday';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  // Render markdown-like bold and blockquote text
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-2 border-teal-400 pl-3 my-2 text-xs text-slate-600 italic">
            {part.slice(2)}
          </blockquote>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem-2.5rem)] sm:h-[calc(100vh-5rem-2.5rem)] max-w-7xl mx-auto">
      {/* Sidebar: Chat History */}
      <aside
        className={`${
          sidebarOpen ? 'fixed inset-0 z-50 bg-black/40' : 'hidden'
        } md:relative md:flex md:bg-transparent md:z-auto`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`w-72 bg-white border-r border-slate-200 flex flex-col h-full ${
            sidebarOpen ? 'animate-in slide-in-from-left' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal-600" />
              Conversations
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={handleNewChat} className="px-2">
                <Plus className="w-4 h-4" />
              </Button>
              <button
                className="md:hidden p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {isLoadingSessions ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No conversations yet</p>
                <Button size="sm" variant="outline" onClick={handleNewChat} className="mt-3">
                  Start First Chat
                </Button>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all group flex items-start justify-between gap-2 ${
                    activeSessionId === session.id
                      ? 'bg-teal-50 text-teal-900 border border-teal-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{session.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(session.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Auth Status */}
          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400">
            {isAuthenticated
              ? `Signed in as ${user?.email} • Conversations persist`
              : 'Guest mode • Conversations stored locally'}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 px-2 sm:px-4 py-2 sm:py-3">
        {/* Chat Header */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-3 sm:px-4 py-2.5 shadow-sm mb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 hidden sm:block md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 truncate">HealthWise AI</h2>
                <Badge variant="success" size="sm">Evidence Grounded</Badge>
                <Badge variant="neutral" size="sm" className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-slate-600">
                  <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                  {import.meta.env.VITE_PUTER_AI_MODEL || 'gpt-4o-mini'}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                {activeSessionId
                  ? sessions.find(s => s.id === activeSessionId)?.title || 'Active Conversation'
                  : 'Start a conversation to begin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/report')}
              className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Explain Report</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openVoiceMode}
              className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200"
              leftIcon={<Mic className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Voice Mode</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsHotlinesOpen(true)}
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
              leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Emergency Hotlines</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleNewChat} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
        </div>

        {/* Emergency Alert Banner if red-flag detected in current thread */}
        {hasEmergencyAlert && !dismissedEmergency && (
          <EmergencyBanner
            onOpenHotlines={() => setIsHotlinesOpen(true)}
            onDismiss={() => setDismissedEmergency(true)}
          />
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2 min-h-0">
          {isLoadingMessages ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
                <span className="text-xs text-slate-500">Loading conversation...</span>
              </div>
            </div>
          ) : messages.length === 0 && !activeSessionId ? (
            /* Empty state — greeting card */
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <AIAvatar size="lg" className="mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('chat', 'startTitle')}</h3>
                  <p className="text-sm text-teal-700 font-medium mt-1">
                    Hi! I'm <strong>HealthWise AI</strong> 👋
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    {t('chat', 'startDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {samplePrompts.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-700 p-3 rounded-xl border border-slate-200/70 transition-all group"
                    >
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message thread */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <AIAvatar isThinking={isTyping && msg === messages[messages.length - 1]} />
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : msg.isEmergencyAlert || msg.urgency_level === 'critical'
                        ? 'bg-rose-50 border-2 border-rose-400 text-rose-950 rounded-tl-sm'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {(msg.isEmergencyAlert || msg.urgency_level === 'critical') && (
                      <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 pb-2 border-b border-rose-200 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>EMERGENCY RED-FLAG ADVISORY</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line text-xs sm:text-sm">
                      {renderContent(msg.content)}
                    </div>

                    {/* Source citations */}
                    {msg.sources && msg.sources.length > 0 && msg.sender === 'assistant' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                        <span className="font-semibold text-slate-600 text-[10px] block uppercase tracking-wider">
                          {t('chat', 'sources')}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((s, idx) => {
                            const isSafe = securitySanitizer.isSafeUrl(s.url);
                            return (
                              <a
                                key={idx}
                                href={isSafe ? s.url : '#'}
                                target={isSafe ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-slate-50 hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-300 px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                              >
                                <span>{s.name}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timestamp & actions */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1">
                      <span>{formatTime(msg.created_at)}</span>
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigator.clipboard?.writeText(msg.content)}
                            className="hover:text-slate-700 p-0.5" title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={async () => {
                              if (feedbackGiven[msg.id]) return;
                              const userMsg = [...messages].reverse().find(m => m.sender === 'user');
                              await feedbackService.submitFeedback({
                                query_text: userMsg?.content || 'Health Inquiry',
                                rating: 'positive',
                                message_id: msg.id,
                                user_id: user?.id,
                              });
                              setFeedbackGiven(prev => ({ ...prev, [msg.id]: 'positive' }));
                            }}
                            className={`p-0.5 transition-colors ${feedbackGiven[msg.id] === 'positive' ? 'text-teal-600' : 'hover:text-teal-600'}`}
                            title={feedbackGiven[msg.id] === 'positive' ? 'Recorded as helpful' : 'Helpful'}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={async () => {
                              if (feedbackGiven[msg.id]) return;
                              const userMsg = [...messages].reverse().find(m => m.sender === 'user');
                              await feedbackService.submitFeedback({
                                query_text: userMsg?.content || 'Health Inquiry',
                                rating: 'negative',
                                message_id: msg.id,
                                user_id: user?.id,
                              });
                              setFeedbackGiven(prev => ({ ...prev, [msg.id]: 'negative' }));
                            }}
                            className={`p-0.5 transition-colors ${feedbackGiven[msg.id] === 'negative' ? 'text-rose-600' : 'hover:text-rose-600'}`}
                            title={feedbackGiven[msg.id] === 'negative' ? 'Report recorded' : 'Report'}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Two-phase loading indicator: Phase 1 = searching knowledge base, Phase 2 = composing response */}
              {(isSearching || isTyping) && (
                <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                  <AIAvatar isThinking={isTyping} />
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="flex gap-1" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {isSearching ? 'Searching health knowledge base…' : t('chat', 'analyzing')}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick prompt chips */}
        {activeSessionId && messages.length <= 2 && (
          <div className="pt-1 pb-0.5 overflow-x-auto flex gap-1.5 no-scrollbar flex-shrink-0">
            {samplePrompts.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="flex-shrink-0 text-[11px] bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 px-2.5 py-1.5 rounded-full border border-slate-200 transition-all font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error bar */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700 flex items-center justify-between mb-1 flex-shrink-0">
            <span>{error}</span>
            <button onClick={clearError} className="text-rose-500 hover:text-rose-700 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Input */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-md flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat', 'placeholder')}
              className="flex-1 text-sm bg-transparent border-none focus:outline-none px-2 text-slate-800 placeholder:text-slate-400"
              disabled={isTyping}
            />
            <button
              type="button"
              onClick={openVoiceMode}
              title="Voice Mode"
              aria-label="Start Voice Mode"
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isTyping}
              rightIcon={<Send className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">{t('chat', 'send')}</span>
            </Button>
          </form>
          <div className="px-2 pt-1.5 border-t border-slate-100 mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{t('chat', 'disclaimer')}</span>
            <span className="text-teal-600 font-medium hidden sm:inline">
              {isAuthenticated ? 'Conversations saved' : 'Guest mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Phase 17: Voice Mode Modal */}
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

      {/* Global Emergency Hotlines Directory Modal */}
      <HotlineModal
        isOpen={isHotlinesOpen}
        onClose={() => setIsHotlinesOpen(false)}
      />
    </div>
  );
};
