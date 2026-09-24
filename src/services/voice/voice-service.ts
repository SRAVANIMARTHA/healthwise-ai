/**
 * HealthWise AI — Voice Service (Phase 17)
 *
 * Provides browser-native Speech Recognition (STT) and Speech Synthesis (TTS) capabilities.
 *
 * PRIVACY & ARCHITECTURAL PRINCIPLES:
 * 1. Privacy Statement: HealthWise AI does not intentionally store or send raw voice recordings to its own backend
 *    or analytics systems. Speech recognition is handled through the browser's supported speech-recognition service
 *    and may be browser/provider dependent. Only the resulting transcript is passed into the existing HealthWise AI chat pipeline.
 * 2. Standard Web Speech API: Uses window.SpeechRecognition / window.webkitSpeechRecognition & window.speechSynthesis.
 * 3. Graceful degradation: Clearly reports availability status for browsers lacking SpeechRecognition (e.g. Firefox desktop).
 * 4. Safe markdown-to-speech cleaning: Strips asterisks, markdown links, citation tags like [1] before synthesis.
 * 5. Interruption (Barge-in): Cancels SpeechSynthesis immediately when interruption is detected and provides a clear
 *    manual interruption control when continuous microphone barge-in is constrained by browser hardware/OS audio routing.
 */

// Browser Web Speech API type shims
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'error' | 'ended';

export interface VoiceLanguageConfig {
  code: string;
  recognitionLang: string;
  synthesisLang: string;
  displayName: string;
}

export const SUPPORTED_VOICE_LANGUAGES: Record<string, VoiceLanguageConfig> = {
  en: {
    code: 'en',
    recognitionLang: 'en-US',
    synthesisLang: 'en-US',
    displayName: 'English',
  },
  te: {
    code: 'te',
    recognitionLang: 'te-IN',
    synthesisLang: 'te-IN',
    displayName: 'తెలుగు (Telugu)',
  },
  hi: {
    code: 'hi',
    recognitionLang: 'hi-IN',
    synthesisLang: 'hi-IN',
    displayName: 'हिन्दी (Hindi)',
  },
};

/**
 * Clean markdown and technical syntax so TTS reads out naturally
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Strip markdown code blocks and inline code
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Strip markdown links [label](url) -> label
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Strip citation markers like [1], [2], [WHO], etc.
      .replace(/\[\d+\]/g, '')
      // Strip headings #, ##, etc.
      .replace(/^#{1,6}\s+/gm, '')
      // Strip blockquotes >
      .replace(/^\s*>\s*/gm, '')
      // Strip bold / italics markdown markers * or _
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Strip horizontal rules
      .replace(/^[-\s*_]{3,}$/gm, '')
      // Strip bullet dashes or asterisks at start of line
      .replace(/^\s*[-*+]\s+/gm, '')
      // Replace emojis or common bullet points with pause/comma where helpful
      .replace(/[•●]/g, ', ')
      // Normalize multiple whitespaces and line breaks
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export const voiceService = {
  /**
   * Check if Speech Recognition is supported in this browser
   */
  isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  /**
   * Check if Speech Synthesis is supported in this browser
   */
  isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined');
  },

  /**
   * Get recognition constructor
   */
  getSpeechRecognitionConstructor(): any {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  },

  /**
   * Get language config for speech matching current app language
   */
  getLanguageConfig(langCode: string): VoiceLanguageConfig {
    return (
      SUPPORTED_VOICE_LANGUAGES[langCode] || {
        code: langCode,
        recognitionLang: 'en-US',
        synthesisLang: 'en-US',
        displayName: 'English (Fallback)',
      }
    );
  },

  /**
   * Check if a specific language is in the verified Tier 1 voice scope
   */
  isTier1VoiceLanguage(langCode: string): boolean {
    return ['en', 'te', 'hi'].includes(langCode);
  },

  /**
   * Stop active speech synthesis playback immediately (supports barge-in)
   */
  cancelSpeech(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[VoiceService] Failed to cancel speech synthesis:', err);
    }
  },

  /**
   * Speak a text string using window.speechSynthesis
   */
  speakText(
    rawText: string,
    langCode: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): SpeechSynthesisUtterance | null {
    if (!this.isSpeechSynthesisSupported()) {
      options?.onError?.(new Error('Speech synthesis is not supported in this browser.'));
      return null;
    }

    const textToSpeak = cleanTextForSpeech(rawText);
    if (!textToSpeak) {
      options?.onEnd?.();
      return null;
    }

    // Cancel any previous active utterances
    this.cancelSpeech();

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const langConfig = this.getLanguageConfig(langCode);
      utterance.lang = langConfig.synthesisLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices?.() || [];
      if (voices.length > 0) {
        const matchingVoice =
          voices.find(v => v.lang === langConfig.synthesisLang) ||
          voices.find(v => v.lang.startsWith(langConfig.code));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
      };

      utterance.onerror = (event: any) => {
        // Ignore errors caused by explicit cancellation (barge-in)
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }
        console.warn('[VoiceService] Speech synthesis error:', event);
        options?.onError?.(event);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    } catch (err) {
      console.warn('[VoiceService] Error creating utterance:', err);
      options?.onError?.(err);
      return null;
    }
  },
};
