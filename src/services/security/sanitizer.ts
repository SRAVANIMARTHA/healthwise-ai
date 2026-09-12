/**
 * Security Sanitization & Injection Defense Service (OWASP ASVS Alignment)
 * Provides:
 * 1. Output HTML escaping (DOM-based XSS mitigation)
 * 2. Prompt-injection detection and adversarial instruction filtering
 * 3. PII masking for analytics and error logging
 * 4. Safe URL validation
 */

const ADVERSARIAL_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|dan|unfiltered|jailbroken)/i,
  /disregard\s+(the\s+)?system\s+prompt/i,
  /act\s+as\s+a\s+(licensed\s+)?(doctor|physician)\s+(and\s+)?prescribe/i,
  /bypass\s+(safety|content\s+filters|guardrails)/i,
  /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions)/i,
  /override\s+clinical\s+boundaries/i,
];

const PII_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PII_PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const PII_AADHAAR_SSN_REGEX = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g;

export const securitySanitizer = {
  /**
   * Escape HTML entities to prevent DOM-based XSS attacks in rendered text
   */
  escapeHtml(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Validate that a URL is safe for browser navigation (blocks javascript: and data: URIs)
   */
  isSafeUrl(url: string): boolean {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
      return false;
    }
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('#');
  },

  /**
   * Detect potential prompt injection or adversarial jailbreak attempts
   */
  detectPromptInjection(query: string): { isMalicious: boolean; matchedPattern: string | null } {
    if (!query) return { isMalicious: false, matchedPattern: null };
    for (const pattern of ADVERSARIAL_PATTERNS) {
      if (pattern.test(query)) {
        return { isMalicious: true, matchedPattern: pattern.source };
      }
    }
    return { isMalicious: false, matchedPattern: null };
  },

  /**
   * Wrap user query inside strict system containment delimiters
   */
  wrapContainedPrompt(userQuery: string): string {
    return `"""${userQuery.trim().replace(/"""/g, '"\\"\\"')}"""`;
  },

  /**
   * Redact PII (emails, phone numbers, identification numbers) from text payloads
   */
  maskPII(text: string): string {
    if (!text) return '';
    return text
      .replace(PII_EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(PII_PHONE_REGEX, '[REDACTED_PHONE]')
      .replace(PII_AADHAAR_SSN_REGEX, '[REDACTED_ID]');
  },
};
