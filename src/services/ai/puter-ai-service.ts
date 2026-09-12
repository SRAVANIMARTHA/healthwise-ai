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
9. Keep responses structured with headings (##) and bullet points for readability.
10. When discussing diseases, cover: what it is, common symptoms, prevention/risk reduction, and when to seek medical care.
11. Be empathetic, clear, and concise. Avoid unnecessary medical jargon.`;

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

      if (isTelugu) {
        rawContent = `## ${capitalizedTopic} — WHO ఆరోగ్య మార్గదర్శకాలు\n\nఅధికారిక **ప్రపంచ ఆరోగ్య సంస్థ (WHO)** నివేదికల ఆధారంగా:\n\n### ముఖ్యమైన సమాచారం:\n${extractKeyBulletPoints(ragContext.evidencePrompt)}\n\n### ఆరోగ్య సూచనలు:\n- లక్షణాలను నిరంతరం గమనించండి మరియు పరిస్థితి మారితే వైద్యుడిని సంప్రదించండి.\n- అధికారిక నివారణ చర్యలను పాటించండి: పరిశుభ్రత, తగినంత విశ్రాంతి మరియు సమతుల్య ఆహారం.\n- తీవ్రమైన హెచ్చరిక సంకేతాలు కనిపిస్తే వెంటనే ఆసుపత్రి అత్యవసర విభాగానికి వెళ్ళండి.`;
      } else if (isHindi) {
        rawContent = `## ${capitalizedTopic} — WHO स्वास्थ्य दिशानिर्देश\n\nआधिकारिक **विश्व स्वास्थ्य संगठन (WHO)** दस्तावेज़ों के आधार पर:\n\n### मुख्य जानकारी:\n${extractKeyBulletPoints(ragContext.evidencePrompt)}\n\n### स्वास्थ्य सिफारिशें:\n- लक्षणों की निरंतर निगरानी करें और स्थिति बिगड़ने पर डॉक्टर से सलाह लें।\n- आधिकारिक रोकथाम प्रोटोकॉल का पालन करें: पर्याप्त स्वच्छता, संतुलित पोषण और आराम।\n- गंभीर चेतावनी संकेत दिखने पर तुरंत आपातकालीन चिकित्सा सहायता लें।`;
      } else {
        rawContent = `## ${capitalizedTopic} — WHO Health Guidance\n\nBased on official **World Health Organization (WHO)** public health documentation:\n\n### Key Information:\n${extractKeyBulletPoints(ragContext.evidencePrompt)}\n\n### Health Recommendations:\n- Maintain vigilance regarding symptoms and consult a healthcare provider for any progressive changes.\n- Follow official prevention protocols: adequate hydration, hygiene, vector control, or balanced nutrition as appropriate.\n- Seek **immediate medical attention** if warning signs appear.`;
      }
    } else {
      if (isTelugu) {
        rawContent = `## ఆరోగ్య సమాచారం\n\n**"${userQuery}"** గురించి అడిగినందుకు ధన్యవాదాలు.\n\n*గమనిక: మీ ప్రశ్నకు సరిగ్గా సరిపోయే WHO అధికారిక పత్రం స్థానిక డేటాబేస్‌లో ప్రస్తుతం అందుబాటులో లేదు.*\n\n### సాధారణ ప్రజారోగ్య సూత్రాలు:\n1. **వైద్యుడిని సంప్రదించండి**: లక్షణాలు కొనసాగితే లైసెన్స్ పొందిన వైద్యుడిని సంప్రదించండి.\n2. **నివారణే ముఖ్యం**: సరైన చేతుల పరిశుభ్రత, సమతుల్య ఆహారం మరియు సకాలంలో టీకాలు వేయించుకోవడం ద్వారా చాలా వ్యాధులను నివారించవచ్చు.\n3. **విశ్వసనీయ సమాచారం**: సమగ్ర ఆరోగ్య వివరాల కోసం [ప్రపంచ ఆరోగ్య సంస్థ (WHO)](https://www.who.int) ను సందర్శించండి.`;
      } else if (isHindi) {
        rawContent = `## स्वास्थ्य जानकारी\n\n**"${userQuery}"** के बारे में पूछने के लिए धन्यवाद।\n\n*नोट: सत्यापित स्थानीय ज्ञानकोष में आपके प्रश्न से मेल खाने वाला आधिकारिक WHO तथ्य-पत्रक वर्तमान में उपलब्ध नहीं है।*\n\n### सामान्य सार्वजनिक स्वास्थ्य सिद्धांत:\n1. **डॉक्टर से परामर्श लें**: यदि आप लगातार लक्षणों का अनुभव कर रहे हैं, तो चिकित्सक से परामर्श लें।\n2. **रोकथाम प्राथमिकता**: उचित स्वच्छता, संतुलित पोषण और समय पर टीकाकरण से अधिकांश बीमारियों से बचा जा सकता है।\n3. **विश्वसनीय स्रोत**: आधिकारिक जानकारी के लिए [विश्व स्वास्थ्य संगठन (WHO)](https://www.who.int) पर जाएं।`;
      } else {
        rawContent = `## Health Information\n\nThank you for asking about **"${userQuery}"**.\n\n*Note: The verified local knowledge base does not currently contain a specific official WHO fact sheet directly matching your query.*\n\n### General Public Health Principles:\n1. **Consult a Doctor**: If you are experiencing concerning or persistent symptoms, please schedule an evaluation with a licensed physician.\n2. **Prevention First**: Most common illnesses can be substantially prevented through proper hand hygiene, regular exercise, balanced nutrition, and timely vaccination.\n3. **Trusted Sources**: For comprehensive documentation, visit the [World Health Organization](https://www.who.int) or your national health ministry.`;
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
    return '- Grounded information retrieved from verified World Health Organization documentation.';
  }

  const snippet = contentMatches
    .map(c => c.replace(/Content:\s*/i, '').trim())
    .slice(0, 2)
    .join('\n\n');

  return snippet.slice(0, 750) + (snippet.length > 750 ? '...' : '');
}
