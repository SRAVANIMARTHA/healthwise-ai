/**
 * HealthWise AI — useVoiceMode Hook (Phase 17)
 *
 * Encapsulates the ChatGPT-style voice interaction loop:
 * IDLE -> LISTENING -> THINKING -> SPEAKING -> LISTENING (continuous loop)
 * Supports real-time interruption (barge-in): speaking -> speech detected/interrupted -> listening.
 * Directly integrates with the existing useChat / useChatStore pipeline.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceService, VoiceState } from '../services/voice/voice-service';
import { useTranslation } from './useTranslation';

interface UseVoiceModeProps {
  onSendMessage: (content: string) => Promise<void>;
  isTyping: boolean;
  isSearching: boolean;
  messages: Array<{
    id: string;
    sender: 'user' | 'assistant' | 'system';
    content: string;
    isEmergencyAlert?: boolean;
    urgency_level?: string;
  }>;
}

export function useVoiceMode({
  onSendMessage,
  isTyping,
  isSearching,
  messages,
}: UseVoiceModeProps) {
  const { language } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecognitionAvailable, setIsRecognitionAvailable] = useState(true);

  // References
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const voiceStateRef = useRef<VoiceState>('idle');
  const manualStopRef = useRef(false);

  // Sync ref
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Check SpeechRecognition capability on mount
  useEffect(() => {
    setIsRecognitionAvailable(voiceService.isSpeechRecognitionSupported());
  }, []);

  // Stop recognition helper
  const stopRecognition = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  // Stop speech playback helper
  const stopSpeech = useCallback(() => {
    voiceService.cancelSpeech();
  }, []);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      setVoiceState('error');
      setErrorMessage(
        'Voice recognition is not supported in this browser. You can continue using text chat.'
      );
      return;
    }

    // Cancel any active speech output when listening starts
    stopSpeech();
    stopRecognition();

    const RecognitionClass = voiceService.getSpeechRecognitionConstructor();
    if (!RecognitionClass) return;

    try {
      const recognition = new RecognitionClass();
      const langConfig = voiceService.getLanguageConfig(language);
      recognition.lang = langConfig.recognitionLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setVoiceState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        // Interruption / Barge-in detection:
        // If recognition gets speech while we were speaking or thinking, abort TTS immediately
        if (voiceStateRef.current === 'speaking') {
          stopSpeech();
          setVoiceState('interrupted');
        }

        let currentInterim = '';
        let finalResult = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalResult += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalResult.trim()) {
          const trimmedFinal = finalResult.trim();
          setTranscript(trimmedFinal);
          setInterimTranscript('');

          // Temporarily stop recognition while AI processes to prevent echo/feedback
          stopRecognition();
          setVoiceState('thinking');

          // Send to existing chat pipeline
          onSendMessage(trimmedFinal).catch((err) => {
            console.error('[VoiceMode] Failed to send message:', err);
            setVoiceState('error');
            setErrorMessage('Failed to get answer. Please try speaking again.');
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // If no speech is heard, don't crash; just keep listening if still active
          if (isListeningRef.current && voiceStateRef.current === 'listening') {
            return;
          }
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('error');
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permission in your browser.'
          );
          stopRecognition();
          return;
        }

        if (event.error === 'network') {
          setVoiceState('error');
          setErrorMessage('Network error during speech recognition. Please check your connection.');
          stopRecognition();
          return;
        }

        // Ignore aborted errors from manual stop / restart
        if (event.error === 'aborted') {
          return;
        }

        console.warn('[VoiceMode] Recognition error:', event.error);
        if (voiceStateRef.current !== 'speaking' && voiceStateRef.current !== 'thinking') {
          setVoiceState('error');
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If ended unexpectedly while we intended to keep listening, restart
        if (
          isListeningRef.current &&
          !manualStopRef.current &&
          voiceStateRef.current === 'listening'
        ) {
          try {
            recognition.start();
          } catch {
            // Already active or error
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[VoiceMode] Error starting recognition:', err);
      setVoiceState('error');
      setErrorMessage(err.message || 'Unable to access microphone.');
    }
  }, [language, onSendMessage, stopRecognition, stopSpeech]);

  // Handle Interruption / Barge-in button or speech trigger
  const handleInterrupt = useCallback(() => {
    stopSpeech();
    setVoiceState('interrupted');
    setTimeout(() => {
      startListening();
    }, 100);
  }, [stopSpeech, startListening]);

  // Open Voice Mode
  const openVoiceMode = useCallback(() => {
    manualStopRef.current = false;
    setIsOpen(true);
    setTranscript('');
    setInterimTranscript('');
    setSpokenResponse('');
    setErrorMessage(null);

    // Initial state
    if (voiceService.isSpeechRecognitionSupported()) {
      startListening();
    } else {
      setVoiceState('error');
      setErrorMessage(
        'Voice recognition is not supported in this browser. You can continue using text chat.'
      );
    }
  }, [startListening]);

  // Close Voice Mode
  const closeVoiceMode = useCallback(() => {
    manualStopRef.current = true;
    stopSpeech();
    stopRecognition();
    setVoiceState('ended');
    setIsOpen(false);
  }, [stopSpeech, stopRecognition]);

  // Monitor AI Response to trigger Speech Synthesis
  useEffect(() => {
    if (!isOpen) return;

    // While searching / typing in chatStore, ensure state is 'thinking'
    if (isSearching || isTyping) {
      if (voiceState !== 'thinking') {
        setVoiceState('thinking');
      }
      return;
    }

    // Check if the latest message is from assistant and hasn't been spoken yet
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (
        lastMsg.sender === 'assistant' &&
        lastMsg.id !== lastSpokenMessageIdRef.current &&
        lastMsg.content.trim()
      ) {
        lastSpokenMessageIdRef.current = lastMsg.id;
        setSpokenResponse(lastMsg.content);
        setVoiceState('speaking');

        // Speak the text aloud
        voiceService.speakText(lastMsg.content, language, {
          onStart: () => {
            setVoiceState('speaking');
          },
          onEnd: () => {
            // Once speech completes naturally, return to listening for continuous conversation
            setVoiceState('listening');
            startListening();
          },
          onError: (err) => {
            console.warn('[VoiceMode] TTS error callback:', err);
            // Fallback to listening even if TTS encounters voice error
            setVoiceState('listening');
            startListening();
          },
        });
      }
    }
  }, [isOpen, isSearching, isTyping, messages, language, startListening, voiceState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      voiceService.cancelSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // safe ignore
        }
      }
    };
  }, []);

  return {
    isOpen,
    voiceState,
    transcript,
    interimTranscript,
    spokenResponse,
    errorMessage,
    isRecognitionAvailable,
    openVoiceMode,
    closeVoiceMode,
    startListening,
    handleInterrupt,
  };
}
