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
  const { t, language } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecognitionAvailable, setIsRecognitionAvailable] = useState(true);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  
  const isListeningRef = useRef(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const voiceStateRef = useRef<VoiceState>('idle');
  const manualStopRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const isMobileRef = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  const useNativeFallbackRef = useRef(false); // Switch to window.SpeechRecognition if server STT lacks API key

  // Sync ref
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Check SpeechRecognition capability on mount
  useEffect(() => {
    setIsRecognitionAvailable(true); // Since we have server fallback, it's always true initially
  }, []);

  const stopAudioTracks = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }, []);

  // Stop recognition helper
  const stopRecognition = useCallback(() => {
    isListeningRef.current = false;
    
    // Stop native recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
      recognitionRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (silenceTimerRef.current) {
      cancelAnimationFrame(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Stop speech playback helper
  const stopSpeech = useCallback(() => {
    voiceService.cancelSpeech();
  }, []);

  // Native SpeechRecognition start logic
  const startNativeRecognition = useCallback(() => {
    const RecognitionClass = voiceService.getSpeechRecognitionConstructor();
    if (!RecognitionClass) {
      setVoiceState('error');
      setErrorMessage(t('voice', 'statusError') || 'Voice recognition not supported');
      return;
    }

    try {
      const recognition = new RecognitionClass();
      const langConfig = voiceService.getLanguageConfig(language);
      recognition.lang = langConfig.recognitionLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        accumulatedTranscriptRef.current = '';
        setVoiceState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        if (voiceStateRef.current === 'speaking') {
          stopSpeech();
          setVoiceState('interrupted');
        }

        let interim = '';
        let finalSegment = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSegment += chunk;
          } else {
            interim += chunk;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (finalSegment.trim()) {
          const currentAcc = accumulatedTranscriptRef.current.trim();
          const newSeg = finalSegment.trim();
          
          if (currentAcc && newSeg.toLowerCase().startsWith(currentAcc.toLowerCase())) {
            accumulatedTranscriptRef.current = newSeg;
          } else {
            accumulatedTranscriptRef.current = currentAcc ? currentAcc + ' ' + newSeg : newSeg;
          }

          setTranscript(accumulatedTranscriptRef.current);
          setInterimTranscript('');

          if (!isMobileRef.current) {
            stopRecognition();
            setVoiceState('thinking');

            onSendMessage(accumulatedTranscriptRef.current).catch((err) => {
              console.error('[VoiceMode] Failed to send message:', err);
              setVoiceState('error');
              setErrorMessage(t('voice', 'statusError') || 'Failed to get answer');
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          if (isListeningRef.current && voiceStateRef.current === 'listening') return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('error');
          setErrorMessage(t('voice', 'micPermissionDenied') || 'Microphone denied');
          stopRecognition();
          return;
        }

        if (event.error === 'network') {
          // Changed: Do not assume network error means no internet. It means Google STT rejected/failed.
          setVoiceState('error');
          setErrorMessage('Speech recognition service is currently unavailable. Please try typing your message.');
          stopRecognition();
          return;
        }

        if (event.error === 'aborted') return;

        console.warn('[VoiceMode] Recognition error:', event.error);
        if (voiceStateRef.current !== 'speaking' && voiceStateRef.current !== 'thinking') {
          setVoiceState('error');
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (
          isMobileRef.current &&
          voiceStateRef.current === 'listening' &&
          accumulatedTranscriptRef.current
        ) {
          const finalMessage = accumulatedTranscriptRef.current;
          accumulatedTranscriptRef.current = '';
          isListeningRef.current = false;
          setVoiceState('thinking');

          onSendMessage(finalMessage).catch((err) => {
            console.error('[VoiceMode] Failed to send message:', err);
            setVoiceState('error');
            setErrorMessage(t('voice', 'statusError') || 'Failed to get answer');
          });
          return;
        }

        if (
          isListeningRef.current &&
          !manualStopRef.current &&
          voiceStateRef.current === 'listening'
        ) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[VoiceMode] Error starting native recognition:', err);
      setVoiceState('error');
      setErrorMessage(err.message || 'Unable to access microphone.');
    }
  }, [language, onSendMessage, stopRecognition, stopSpeech, t]);

  // Start MediaRecorder (Server STT)
  const startListening = useCallback(async () => {
    stopSpeech();
    stopRecognition();

    if (useNativeFallbackRef.current) {
      startNativeRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (!isListeningRef.current && !accumulatedTranscriptRef.current) return;
        
        isListeningRef.current = false;
        stopAudioTracks();

        if (audioChunks.length === 0) return;

        setVoiceState('thinking');
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const response = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64, language })
            });

            const contentType = response.headers.get('content-type');

            if (response.status === 404 || response.status === 501 || (contentType && contentType.includes('text/html'))) {
              // Server lacks API key or endpoint is missing (e.g. Vite dev server), fallback to native SpeechRecognition
              useNativeFallbackRef.current = true;
              console.warn('[VoiceMode] Server STT not configured or missing, falling back to browser-native SpeechRecognition');
              
              // Start native immediately to not drop user experience
              startNativeRecognition();
              return;
            }

            if (!response.ok) {
              throw new Error('STT API failed');
            }

            const data = await response.json();
            const finalTranscript = data.transcript?.trim();
            
            if (finalTranscript) {
              setTranscript(finalTranscript);
              accumulatedTranscriptRef.current = finalTranscript;
              
              onSendMessage(finalTranscript).catch((err) => {
                console.error('[VoiceMode] Failed to send message:', err);
                setVoiceState('error');
                setErrorMessage(t('voice', 'statusError') || 'Failed to get answer');
              });
            } else {
              setVoiceState('idle'); // No transcript, just go idle
            }
          } catch (err) {
            console.error('[VoiceMode] STT processing error:', err);
            setVoiceState('error');
            setErrorMessage('Network error during secure speech transcription.');
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      // Silence detection to auto-stop recording
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let silenceStart = Date.now();
        let isSpeaking = false;

        const checkSilence = () => {
          if (mediaRecorder.state !== 'recording') return;
          
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;

          // Simple amplitude threshold
          if (average > 10) {
            isSpeaking = true;
            silenceStart = Date.now();
            if (voiceStateRef.current !== 'listening') {
              setVoiceState('listening');
            }
          } else {
            if (isSpeaking && Date.now() - silenceStart > 1800) {
              // 1.8 seconds of silence -> stop recording and process
              mediaRecorder.stop();
              return;
            }
          }
          silenceTimerRef.current = requestAnimationFrame(checkSilence);
        };
        
        silenceTimerRef.current = requestAnimationFrame(checkSilence);
      } else {
        // No AudioContext support, rely purely on manual stop via onInterrupt/onClose
      }

      mediaRecorder.start();
      isListeningRef.current = true;
      // Show an interim indication so the user knows it's actively recording audio
      setInterimTranscript('Listening securely...');
      setVoiceState('listening');
      setErrorMessage(null);

    } catch (err: any) {
      console.error('[VoiceMode] Microphone error:', err);
      // Fallback to native immediately if user denies MediaRecorder but perhaps allowed SpeechRec
      useNativeFallbackRef.current = true;
      startNativeRecognition();
    }
  }, [language, onSendMessage, startNativeRecognition, stopRecognition, stopSpeech, stopAudioTracks, t]);

  // Handle Interruption / Barge-in button or speech trigger
  const handleInterrupt = useCallback(() => {
    stopSpeech();
    
    // If we were recording and user clicked pause, stop it immediately and process it
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }
    
    // For native recognition, restart it
    if (useNativeFallbackRef.current) {
      setVoiceState('interrupted');
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [stopSpeech, startListening]);

  // Open Voice Mode
  const openVoiceMode = useCallback(() => {
    manualStopRef.current = false;
    setIsOpen(true);
    setTranscript('');
    setInterimTranscript('');
    setSpokenResponse('');
    setErrorMessage(null);

    startListening();
  }, [startListening]);

  // Close Voice Mode
  const closeVoiceMode = useCallback(() => {
    manualStopRef.current = true;
    stopSpeech();
    stopRecognition();
    stopAudioTracks();
    setVoiceState('ended');
    setIsOpen(false);
  }, [stopSpeech, stopRecognition, stopAudioTracks]);

  // Monitor AI Response to trigger Speech Synthesis
  useEffect(() => {
    if (!isOpen) return;

    if (isSearching || isTyping) {
      if (voiceState !== 'thinking') {
        setVoiceState('thinking');
      }
      return;
    }

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

        voiceService.speakText(lastMsg.content, language, {
          onStart: () => {
            setVoiceState('speaking');
          },
          onEnd: () => {
            setVoiceState('listening');
            startListening();
          },
          onError: (err) => {
            console.warn('[VoiceMode] TTS error callback:', err);
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
      stopRecognition();
      stopAudioTracks();
    };
  }, [stopRecognition, stopAudioTracks]);

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
