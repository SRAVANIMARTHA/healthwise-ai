/**
 * HealthWise AI — Puter.js AI Integration Service with RAG Grounding
 *
 * Implements the RAG (Retrieval-Augmented Generation) pipeline:
 * User Query -> Retrieval from WHO Knowledge Base -> Context Builder -> Puter AI -> Grounded Response + Citations
 *
 * Uses the global `puter` object loaded via CDN script in index.html.
 * Model is configurable via VITE_PUTER_AI_MODEL environment variable.
 */

import { ChatMessageSource } from '../../types/chat';
import { retrievalService } from '../knowledge/retrieval-service';
import { contextBuilder } from '../knowledge/context-builder';
import { RAGContext } from '../../types/rag';
import { safetyService } from '../safety/safety-service';
import { i18nService } from '../i18n/i18n-service';
import { getLanguageByCode } from '../i18n/language-registry';
import { securitySanitizer } from '../security/sanitizer';

// ---------- Puter global type declaration ----------
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          promptOrMessages: string | Array<{ role: string; content: string }>,
          optionsOrTestMode?: boolean | Record<string, unknown>,
          maybeOptions?: Record<string, unknown>,
        ) => Promise<{ message: { content: string } }>;
        listModels: () => Promise<Array<{ id: string; provider?: string }>>;
      };
    };
  }
}

// ---------- AI Configuration ----------

export interface AIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  enableMockAI: boolean;
}

function getAIConfig(): AIConfig {
  return {
    model: import.meta.env.VITE_PUTER_AI_MODEL || 'gpt-4o-mini',
    maxTokens: 1024,
    temperature: 0.3, // Lower temperature for faithful evidence adherence
    enableMockAI: import.meta.env.VITE_ENABLE_MOCK_AI === 'true',
  };
}

// ---------- Health System Prompt ----------

const HEALTH_SYSTEM_PROMPT = `You are HealthWise AI, a public health educational assistant. Your purpose is to provide evidence-grounded health education and disease awareness information.

STRICT RULES — NEVER violate these:
1. You are NOT a doctor. NEVER diagnose a disease, prescribe medication, or recommend specific treatments.
2. ALWAYS ground your answers primarily in the retrieved WHO knowledge base evidence provided in the prompt.
3. ALWAYS encourage users to consult qualified healthcare professionals for personal medical advice.
4. NEVER fabricate medical statistics, study results, or source citations. If evidence is not in the context, say so clearly.
5. NEVER claim to replace professional medical care.
6. Focus ONLY on general health education: disease awareness, prevention, vaccination facts, hygiene, and nutrition.
7. If a user describes symptoms that sound life-threatening (chest pain, stroke, breathing difficulty, heavy bleeding, seizures, loss of consciousness, suicidal thoughts), respond IMMEDIATELY with emergency service numbers (112/911/108) and a directive to call for help. Do NOT try to diagnose or calm them — escalate urgency.
8. At the end of EVERY substantive health response, include the disclaimer: "⚕️ This is general educational health information. For personal medical advice, consult a licensed healthcare professional."
9. When discussing diseases, cover: what it is, common symptoms, prevention/risk reduction, and when to seek medical care.
10. Be empathetic, clear, and concise. Avoid unnecessary medical jargon.

RESPONSE QUALITY, SUMMARIZATION & HUMAN LANGUAGE:
- SYNTHESIZE RAG EVIDENCE: Treat retrieved passages as underlying medical evidence, NOT as pre-written responses. Never paste large blocks or full paragraphs verbatim from fact sheets. Rephrase and explain in conversational, human-friendly terms.
- DIRECT ANSWER FIRST: Answer the user's specific question in the opening sentence. Never start with greetings or filler ("Great question!", "Thank you for asking about...").
- HUMAN LANGUAGE: Use everyday terms (e.g. "high blood pressure" with "hypertension" explained simply). Briefly clarify medical terms if they must be used.
- ADAPT TO USER INTENT:
  * "What is X?" -> Concise definition + primary transmission/nature.
  * "What are the symptoms?" -> Focus directly on symptoms and key warning signs.
  * "How to prevent?" -> Concrete prevention measures and vector/hygiene controls.
  * "Is it dangerous?" -> Risk factors and warning signs needing urgent medical evaluation.
  * Yes/No questions (e.g. "Can dengue spread person-to-person?") -> Give a direct "No" or "Yes" immediately, followed by a 1-2 sentence explanation.
  * Comparison questions (e.g. "Dengue vs Malaria") -> Compare the key medical differences concisely (causes, vectors, distinct symptoms).
- TARGET LENGTH:
  * Standard questions: Aim for 80–180 words total (including disclaimer).
  * Yes/No or simple questions: Even shorter (40–100 words).
  * Multi-part questions or explicit requests ("explain in detail", "tell me everything"): 200–300 words.
  * Emergency escalation responses are exempt from length limits — always escalate fully and clearly.
  * Never truncate or omit life-saving warnings or emergency advice for the sake of brevity.
- STRUCTURE: Use short paragraphs and 3–5 bullet points where listing aids clarity. Use headings (##) only when dividing distinct topics.
- CITATIONS: Always cite the actual official WHO document referenced in the evidence prompt (e.g. "WHO Dengue and Severe Dengue Fact Sheet"). Never fabricate URLs.`;

// ---------- Follow-up Directive Builder ----------

/**
 * Returns an additional system instruction when the conversation has prior context,
 * directing the AI to not repeat information already covered.
 */
function buildFollowUpDirective(
  conversationHistory: Array<{ role: string; content: string }>
): string | null {
  const userTurns = conversationHistory.filter(m => m.role === 'user');
  if (userTurns.length < 2) return null;

  // Extract the topic of the previous user turn to give the AI a hint
  const prevQuestion = userTurns[userTurns.length - 2]?.content?.slice(0, 120) || '';
  return `FOLLOW-UP CONTEXT: The user previously asked: "${prevQuestion}". The user is now asking a follow-up question. Do NOT repeat the general overview or facts already provided. Answer ONLY the specific new question directly and concisely.`;
}




// ---------- Emergency Detection (runs BEFORE AI call & retrieval) ----------

const EMERGENCY_PATTERNS = [
  /chest pain/i, /can'?t breathe/i, /difficulty breathing/i,
  /shortness of breath/i, /heart attack/i, /stroke/i,
  /unconscious/i, /unresponsive/i, /heavy bleeding/i,
  /severe bleeding/i, /seizure/i, /convulsion/i,
  /anaphylaxis/i, /severe allerg/i, /choking/i,
  /suicid/i, /self[- ]?harm/i, /want to die/i,
  /overdose/i, /poison/i, /can'?t move/i,
];

function detectEmergency(query: string): boolean {
  return EMERGENCY_PATTERNS.some(p => p.test(query));
}

function getEmergencyResponse(): AIResponseResult {
  return {
    content: '🚨 **URGENT MEDICAL ALERT**\n\nThe symptoms you described may indicate a **life-threatening medical emergency**.\n\n**Take immediate action:**\n1. **Call your local emergency number** (112 / 911 / 108) right now\n2. Do not wait for online responses\n3. If someone is unconscious, check airway and begin CPR if trained\n4. Stay calm and follow emergency dispatcher instructions\n\n> ⚠️ This chatbot is an educational tool and cannot provide emergency medical treatment. Professional emergency medical services are critical in this situation.',
    sources: [
      { name: 'WHO Emergency Care', url: 'https://www.who.int/news-room/fact-sheets/detail/emergency-care' },
    ],
    urgency: 'critical' as const,
    isEmergency: true,
  };
}

// ---------- AI Response Types ----------

export interface AIResponseResult {
  content: string;
  sources: ChatMessageSource[];
  urgency: 'normal' | 'moderate' | 'urgent' | 'critical';
  isEmergency: boolean;
  isGrounded?: boolean;
}

// ---------- Puter AI Service ----------

export const puterAIService = {
  /**
   * Check if Puter.js is loaded and available in the browser
   */
  isPuterAvailable(): boolean {
    return !!(window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function');
  },

  /**
   * List available models from Puter
   */
  async listModels(): Promise<Array<{ id: string; provider?: string }>> {
    if (!this.isPuterAvailable()) return [];
    try {
      return await window.puter!.ai.listModels();
    } catch (err) {
      console.warn('[PuterAI] Failed to list models:', err);
      return [];
    }
  },

  /**
   * Generate a grounded health-focused AI response via Puter.js and RAG
   */
  async generateResponse(
    userQuery: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ): Promise<AIResponseResult> {
    // 1. Safety Guardrail Pre-Processing: Red-Flags, Adversarial Jailbreak Defense & Clinical Boundaries
    const inputSafety = safetyService.validateInput(userQuery);
    if (!inputSafety.isSafe) {
      // Audit log the safety event asynchronously
      safetyService.logEvent({
        session_id: null,
        trigger_pattern: userQuery.slice(0, 200),
        severity: inputSafety.severity || 'urgent',
        safety_classification: inputSafety.ruleTriggered?.category || 'Clinical Safety Guardrail',
        action_taken: inputSafety.action,
      }).catch(err => console.warn('[Safety] Failed to record event:', err));

      if (inputSafety.action === 'emergency_escalate') {
        return {
          content: inputSafety.responseContent || getEmergencyResponse().content,
          sources: inputSafety.sources || [
            { name: 'WHO Emergency Care', url: 'https://www.who.int/news-room/fact-sheets/detail/emergency-care' },
          ],
          urgency: 'critical',
          isEmergency: true,
          isGrounded: false,
        };
      }

      if (inputSafety.action === 'refuse_adversarial') {
        return {
          content: inputSafety.responseContent || '🛡️ Request refused due to clinical safety policies.',
          sources: [],
          urgency: 'urgent',
          isEmergency: false,
          isGrounded: false,
        };
      }
    }

    // Handle non-critical defensive boundaries (Prescription & Diagnostic demands)
    if (inputSafety.action === 'prescribe_defense' || inputSafety.action === 'diagnose_defense') {
      safetyService.logEvent({
        session_id: null,
        trigger_pattern: userQuery.slice(0, 200),
        severity: inputSafety.severity || 'moderate',
        safety_classification: inputSafety.ruleTriggered?.category || inputSafety.action,
        action_taken: inputSafety.action,
      }).catch(err => console.warn('[Safety] Failed to record event:', err));

      return {
        content: inputSafety.responseContent || '',
        sources: inputSafety.sources || [{ name: 'World Health Organization (WHO)', url: 'https://www.who.int' }],
        urgency: 'moderate',
        isEmergency: false,
        isGrounded: true,
      };
    }

    // 2. RAG Retrieval from verified WHO Knowledge Base
    let ragContext: RAGContext;
    try {
      const retrieval = await retrievalService.retrieveRelevantChunks(userQuery, conversationHistory);
      ragContext = contextBuilder.buildContext(retrieval);
      console.info(
        `[RAG] Query: "${userQuery}" | Grounded: ${ragContext.isGrounded} | Sources: ${ragContext.sources.length}`
      );
    } catch (ragErr) {
      console.warn('[RAG] Retrieval failed, proceeding with general context:', ragErr);
      ragContext = {
        evidencePrompt: '[NOTE: Knowledge retrieval temporarily unavailable. Provide safe general guidance only.]',
        sources: [{ name: 'World Health Organization (WHO)', url: 'https://www.who.int' }],
        isGrounded: false,
        matchedTopics: [],
      };
    }

    const config = getAIConfig();

    // 3. If mock mode is forced, use fallback with RAG context
    if (config.enableMockAI) {
      console.info('[PuterAI] Mock mode enabled via VITE_ENABLE_MOCK_AI=true');
      return this.generateMockResponse(userQuery, ragContext);
    }

    // 4. If Puter.js is not loaded, fall back gracefully with RAG context
    if (!this.isPuterAvailable()) {
      console.warn('[PuterAI] Puter.js not available — falling back to mock response');
      return this.generateMockResponse(userQuery, ragContext);
    }

    // 5. Detect communication language across the 22 registered languages
    const currentLang = i18nService.getCurrentLanguage();
    const isTelugu = currentLang === 'te' || /[\u0C00-\u0C7F]/.test(userQuery);
    const isHindi = currentLang === 'hi' || /[\u0900-\u097F]/.test(userQuery);

    let languageDirective = '';
    if (isTelugu) {
      languageDirective = `\n\nLANGUAGE DIRECTIVE: The user prefers communication in Telugu (తెలుగు). You MUST respond in fluent, respectful Telugu script. Base your information on the provided WHO evidence. Include the Telugu medical disclaimer at the end: "⚕️ ఇది సాధారణ ఆరోగ్య అవగాహన సమాచారం మాత్రమే. వ్యక్తిగత వైద్య నిర్ధారణ లేదా చికిత్స కోసం లైసెన్స్ పొందిన వైద్యుడిని సంప్రదించండి."`;
    } else if (isHindi) {
      languageDirective = `\n\nLANGUAGE DIRECTIVE: The user prefers communication in Hindi (हिन्दी). You MUST respond in fluent, respectful Hindi using Devanagari script. Base your information on the provided WHO evidence. Include the Hindi medical disclaimer at the end: "⚕️ यह केवल सामान्य शैक्षिक स्वास्थ्य जानकारी है। व्यक्तिगत चिकित्सकीय सलाह, निदान या उपचार के लिए लाइसेंस प्राप्त चिकित्सक से परामर्श लें।"`;
    } else if (currentLang !== 'en') {
      const langConfig = getLanguageByCode(currentLang);
      if (langConfig) {
        languageDirective = `\n\nLANGUAGE DIRECTIVE: The user prefers communication in ${langConfig.name} (${langConfig.nativeName}). You MUST respond in fluent, accurate ${langConfig.name}. Base your information strictly on the provided WHO evidence. Include the standard educational medical disclaimer translated into ${langConfig.name} at the end emphasizing that this is educational health information only and not medical advice or diagnosis.`;
      }
    }

    // Build message array with system prompt + language directive + RAG evidence prompt + conversation history + current query
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: HEALTH_SYSTEM_PROMPT + languageDirective },
      { role: 'system', content: ragContext.evidencePrompt },
    ];

    // Inject follow-up directive when the conversation has prior context (avoids repetition)
    const followUpDirective = buildFollowUpDirective(conversationHistory);
    if (followUpDirective) {
      messages.push({ role: 'system', content: followUpDirective });
    }

    // Include last 8 messages of conversation context
    const recentHistory = conversationHistory.slice(-8);
    messages.push(...recentHistory);

    // Defense-in-depth: Inspect prompt injection risk and wrap query with delimiter boundaries
    const injectionCheck = securitySanitizer.detectPromptInjection(userQuery);
    if (injectionCheck.isMalicious) {
      console.warn(`[Security] Potential prompt injection detected (${injectionCheck.matchedPattern}): "${userQuery}"`);
    }
    const containedQuery = securitySanitizer.wrapContainedPrompt(userQuery);
    messages.push({ role: 'user', content: containedQuery });

    // 6. Call Puter.js AI
    try {
      console.info(`[PuterAI] Sending grounded query to model "${config.model}"...`);

      const response = await window.puter!.ai.chat(messages, {
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      });

      const aiContent = response?.message?.content;

      if (!aiContent || typeof aiContent !== 'string' || aiContent.trim().length === 0) {
        console.warn('[PuterAI] Empty response from AI, falling back to mock');
        return this.generateMockResponse(userQuery, ragContext);
      }

      // Determine urgency from content
      let urgency: AIResponseResult['urgency'] = 'normal';
      if (/urgent|emergency|immediately|call.*911|call.*112|seek.*immediate/i.test(aiContent)) {
        urgency = 'urgent';
      }

      // 7. Post-processing Output Guardrail (Clean diagnostic/prescription claims & enforce disclaimer)
      const outputSafety = safetyService.validateOutput(aiContent);
      if (outputSafety.violationsDetected.length > 0) {
        safetyService.logEvent({
          session_id: null,
          trigger_pattern: aiContent.slice(0, 200),
          severity: 'urgent',
          safety_classification: 'Output Guardrail Violation',
          action_taken: `sanitized_${outputSafety.violationsDetected.join('_')}`,
        }).catch(err => console.warn('[Safety] Failed to record output violation:', err));
      }

      return {
        content: outputSafety.sanitizedContent,
        sources: ragContext.sources.length > 0 ? ragContext.sources : [
          { name: 'World Health Organization (WHO)', url: 'https://www.who.int' },
        ],
        urgency,
        isEmergency: false,
        isGrounded: ragContext.isGrounded,
      };
    } catch (err: any) {
      console.error('[PuterAI] API call failed:', err?.message || err);

      // Graceful degradation — don't crash the chat
      return this.generateMockResponse(userQuery, ragContext);
    }
  },

  // ---------- Evidence-Grounded Mock/Fallback Generator ----------
  // Used when Puter is offline, mock mode is enabled, or AI call fails

  generateMockResponse(userQuery: string, ragContext?: RAGContext): AIResponseResult {
    const currentLang = i18nService.getCurrentLanguage();
    const isTelugu = currentLang === 'te' || /[\u0C00-\u0C7F]/.test(userQuery);
    const isHindi = currentLang === 'hi' || /[\u0900-\u097F]/.test(userQuery);
    let rawContent = '';

    // If RAG evidence was successfully retrieved, build an answer from authentic chunks
    if (ragContext?.isGrounded && ragContext.sources.length > 0) {
      const topicName = ragContext.matchedTopics[0] || 'Health Information';
      const capitalizedTopic = topicName.charAt(0).toUpperCase() + topicName.slice(1);
      const cleanSummary = extractKeyBulletPoints(ragContext.evidencePrompt);

      if (isTelugu) {
        rawContent = `${capitalizedTopic} గురించి ప్రాథమిక ఆరోగ్య సమాచారం:\n\n${cleanSummary}\n\n**ముఖ్య సలహాలు:**\n- లక్షణాలను నిశితంగా గమనించండి మరియు పరిస్థితి తీవ్రమైతే వైద్యుడిని సంప్రదించండి.\n- సరైన పరిశుభ్రత, తగినంత నీరు త్రాగడం మరియు విశ్రాంతి తీసుకోవడం ముఖ్యం.`;
      } else if (isHindi) {
        rawContent = `${capitalizedTopic} के बारे में मुख्य स्वास्थ्य जानकारी:\n\n${cleanSummary}\n\n**मुख्य सिफारिशें:**\n- लक्षणों पर नजर रखें और स्थिति बिगड़ने पर डॉक्टर से सलाह लें।\n- पर्याप्त स्वच्छता, तरल पदार्थों का सेवन और आराम सुनिश्चित करें।`;
      } else {
        rawContent = `Here is essential health information regarding **${capitalizedTopic}** based on WHO documentation:\n\n${cleanSummary}\n\n**Key Actions:**\n- Monitor symptoms closely and seek medical care if warning signs appear.\n- Maintain supportive care including proper hydration, hygiene, and rest.`;
      }
    } else {
      if (isTelugu) {
        rawContent = `ప్రస్తుతానికి మా జ్ఞానకోశంలో **"${userQuery}"** పై ప్రత్యేక అధికారిక WHO సమాచారం అందుబాటులో లేదు.\n\nలక్షణాలు కొనసాగితే లేదా ఆందోళన కలిగిస్తే, దయచేసి లైసెన్స్ పొందిన వైద్యుడిని సంప్రదించండి లేదా ధృవీకరించబడిన సమాచారం కోసం [WHO](https://www.who.int) ను సందర్శించండి.`;
      } else if (isHindi) {
        rawContent = `वर्तमान सत्यापित ज्ञानकोष में **"${userQuery}"** के लिए विशिष्ट आधिकारिक WHO दस्तावेज़ उपलब्ध नहीं है।\n\nयदि आप लगातार लक्षणों का अनुभव कर रहे हैं, तो कृपया लाइसेंस प्राप्त चिकित्सक से परामर्श लें या आधिकारिक जानकारी के लिए [WHO](https://www.who.int) पर जाएं।`;
      } else {
        rawContent = `I don't have enough trusted information in my current knowledge base to answer **"${userQuery}"** confidently.\n\nFor personal medical concerns, please consult a qualified healthcare professional or refer to official resources at the [World Health Organization](https://www.who.int).`;
      }
    }

    // Apply post-processing sanitizer & medical disclaimer
    const outputSafety = safetyService.validateOutput(rawContent);

    return {
      content: outputSafety.sanitizedContent,
      sources: ragContext?.sources && ragContext.sources.length > 0 ? ragContext.sources : [
        { name: 'World Health Organization (WHO)', url: 'https://www.who.int' },
      ],
      urgency: 'normal',
      isEmergency: false,
      isGrounded: ragContext?.isGrounded ?? false,
    };
  },
};

function extractKeyBulletPoints(evidencePrompt: string): string {
  const contentMatches = evidencePrompt.match(/Content:\s*([\s\S]*?)(?=--- EVIDENCE PASSAGE|\[CRITICAL INSTRUCTIONS|$)/g);
  if (!contentMatches || contentMatches.length === 0) {
    return '- Evidence retrieved from verified World Health Organization documentation.';
  }

  // Extract clean text lines and filter out empty lines or raw header artifacts
  const cleanSentences: string[] = [];
  for (const match of contentMatches) {
    const raw = match.replace(/Content:\s*/i, '').trim();
    const sentences = raw.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15 && !s.includes('http'));
    for (const s of sentences) {
      if (cleanSentences.length < 3) {
        cleanSentences.push(s.trim());
      }
    }
  }

  if (cleanSentences.length === 0) {
    return '- Grounded in official World Health Organization health guidance.';
  }

  return cleanSentences.map(s => `- ${s}`).join('\n');
}
