/**
 * HealthWise AI — VoiceModeModal Component (Phase 17)
 *
 * A focused conversational voice interface modeled after modern AI voice assistants.
 * Provides clear visual states:
 * - IDLE
 * - LISTENING (microphone captures speech)
 * - THINKING (RAG retrieval and Puter AI processing)
 * - SPEAKING (synthesized speech output)
 * - INTERRUPTED (barge-in triggered)
 * - ERROR (permission denied or unsupported browser fallback)
 *
 * Invariants:
 * - NOT a phone call interface (no dial pad, call timers, or phone vocabulary).
 * - Live transcripts shown for user speech and assistant response.
 * - One-tap barge-in / interrupt button.
 * - Seamless return to text chat.
 * - Accessible keyboard navigation (Escape closes).
 * - Full emergency detection support with urgent warning banner.
 */

import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  X,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { VoiceState } from '../../services/voice/voice-service';
import { AIAvatar } from './AIAvatar';
import { useTranslation } from '../../hooks/useTranslation';

interface VoiceModeModalProps {
  isOpen: boolean;
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  spokenResponse: string;
  errorMessage: string | null;
  onClose: () => void;
  onInterrupt: () => void;
  onStartListening: () => void;
  hasEmergencyAlert?: boolean;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  voiceState,
  transcript,
  interimTranscript,
  spokenResponse,
  errorMessage,
  onClose,
  onInterrupt,
  onStartListening,
  hasEmergencyAlert = false,
}) => {
  const { t, language } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap / keyboard accessibility (Escape to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking';
  const isSpeaking = voiceState === 'speaking';
  const isInterrupted = voiceState === 'interrupted';
  const isError = voiceState === 'error';

  // Status message mapping
  let statusText = 'HealthWise Voice';
  if (isListening) statusText = 'Listening... Speak naturally';
  else if (isThinking) statusText = 'Thinking & checking medical facts...';
  else if (isSpeaking) statusText = 'Speaking... (Tap or speak to interrupt)';
  else if (isInterrupted) statusText = 'Interrupted! Listening again...';
  else if (isError) statusText = 'Voice mode unavailable';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="HealthWise AI Voice Mode"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[500px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors p-1.5 -ml-2 rounded-lg hover:bg-slate-200/50"
            aria-label="Exit Voice Mode and return to text chat"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Chat</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Voice Mode ({language.toUpperCase()})
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close voice mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner if detected */}
        {hasEmergencyAlert && (
          <div
            className="px-6 py-3 bg-red-600 text-white flex items-center gap-3 text-sm font-semibold"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span>
              URGENT MEDICAL WARNING: If you are experiencing severe symptoms or an emergency, call emergency services immediately.
            </span>
          </div>
        )}

        {/* Central Voice Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {/* Animated Avatar Sphere */}
          <div className="relative mb-6">
            {/* Outer pulsating sound waves */}
            {isListening && (
              <>
                <span className="absolute -inset-6 rounded-full bg-teal-500/15 animate-ping" />
                <span className="absolute -inset-12 rounded-full bg-teal-500/10 animate-pulse" />
              </>
            )}

            {isSpeaking && (
              <>
                <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-pulse" />
                <span className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-ping" />
              </>
            )}

            {isThinking && (
              <span className="absolute -inset-4 rounded-full bg-amber-400/20 animate-spin" />
            )}

            {/* Central Robot Avatar */}
            <div className="relative z-10">
              <AIAvatar size="lg" isThinking={isThinking} />
            </div>
          </div>

          {/* Status Label */}
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
            {isSpeaking && <Volume2 className="w-5 h-5 text-emerald-600 animate-bounce" />}
            {isListening && <Mic className="w-5 h-5 text-teal-600 animate-pulse" />}
            {statusText}
          </h2>

          <p className="text-xs text-slate-500 mb-6">
            Evidence grounded by WHO & Public Health Guidelines
          </p>

          {/* Live Transcript Display Box */}
          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[140px] max-h-[220px] overflow-y-auto text-left shadow-inner flex flex-col justify-between">
            <div>
              {/* User transcript (Interim / Final) */}
              {(transcript || interimTranscript) && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold tracking-wide uppercase text-slate-400 block mb-1">
                    You
                  </span>
                  <p className="text-sm font-medium text-slate-800">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-slate-400 italic"> {interimTranscript}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Spoken Response Preview */}
              {spokenResponse && (
                <div>
                  <span className="text-[11px] font-bold tracking-wide uppercase text-teal-600 block mb-1">
                    HealthWise AI
                  </span>
                  <p className="text-sm text-slate-700 line-clamp-4">
                    {spokenResponse}
                  </p>
                </div>
              )}

              {/* Placeholder when idle / first opened */}
              {!transcript && !interimTranscript && !spokenResponse && !errorMessage && (
                <p className="text-sm text-slate-400 italic text-center py-6">
                  "Ask a health question: for example, 'What are dengue symptoms?' or 'How is malaria spread?'"
                </p>
              )}

              {/* Error state message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center">
                  <p className="font-semibold">{errorMessage}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                  >
                    Switch to Text Chat
                  </button>
                </div>
              )}
            </div>

            {/* Subtle waveform animation when active */}
            {(isListening || isSpeaking) && (
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-slate-200/60">
                <span className="w-1 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-4 bg-teal-500 rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Voice Controls */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-center gap-4">
          {/* Barge-In / Interruption Button (when speaking) */}
          {isSpeaking && (
            <button
              onClick={onInterrupt}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-semibold shadow-md hover:bg-amber-600 active:scale-95 transition-all text-sm"
              aria-label="Interrupt AI and start speaking"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Interrupt / Speak Now</span>
            </button>
          )}

          {/* Toggle Listening / Stop button */}
          {isListening ? (
            <button
              onClick={onInterrupt}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 active:scale-95 transition-all text-sm"
              aria-label="Pause listening"
            >
              <MicOff className="w-4 h-4" />
              <span>Pause Listening</span>
            </button>
          ) : !isSpeaking ? (
            <button
              onClick={onStartListening}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 text-white font-semibold shadow-lg hover:bg-teal-700 active:scale-95 transition-all text-sm"
              aria-label="Tap to speak"
            >
              <Mic className="w-4 h-4" />
              <span>Tap to Speak</span>
            </button>
          ) : null}

          {/* End Voice Mode button */}
          <button
            onClick={onClose}
            className="px-5 py-3.5 rounded-2xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 active:scale-95 transition-all text-sm"
          >
            End Voice Mode
          </button>
        </div>
      </div>
    </div>
  );
};
