import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { ChatSession, ChatMessage, ChatMessageSource } from '../../types/chat';

const LOCAL_SESSIONS_KEY = 'healthwise_chat_sessions';
const LOCAL_MESSAGES_KEY = 'healthwise_chat_messages';

// ---------- Local Storage Helpers for Demo Mode ----------

function getLocalSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalSessions(sessions: ChatSession[]) {
  localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
}

function getLocalMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_MESSAGES_KEY}_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalMessages(sessionId: string, messages: ChatMessage[]) {
  localStorage.setItem(`${LOCAL_MESSAGES_KEY}_${sessionId}`, JSON.stringify(messages));
}

function deleteLocalSession(sessionId: string) {
  localStorage.removeItem(`${LOCAL_MESSAGES_KEY}_${sessionId}`);
}

// ---------- Chat Service ----------

export const chatService = {
  // ============ SESSIONS ============

  async getSessions(userId: string | null): Promise<ChatSession[]> {
    if (!isSupabaseConfigured || !userId) {
      return getLocalSessions().sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Chat] Supabase error fetching sessions, using local storage:', error.message);
      return getLocalSessions().sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    return (data || []) as ChatSession[];
  },

  async createSession(userId: string | null, title?: string, language?: string): Promise<ChatSession | null> {
    const now = new Date().toISOString();
    const sessionTitle = title || 'New Conversation';
    const lang = language || 'en';

    const localFallback = (): ChatSession => {
      const session: ChatSession = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user_id: userId,
        title: sessionTitle,
        language: lang,
        created_at: now,
        updated_at: now,
      };
      const sessions = getLocalSessions();
      sessions.unshift(session);
      saveLocalSessions(sessions);
      saveLocalMessages(session.id, []);
      return session;
    };

    if (!isSupabaseConfigured) {
      return localFallback();
    }

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: sessionTitle,
          language: lang,
        })
        .select()
        .single();

      if (error) {
        console.warn('[Chat] Supabase error creating session, falling back to local:', error.message);
        return localFallback();
      }
      return data as ChatSession;
    } catch {
      return localFallback();
    }
  },

  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const sessions = getLocalSessions();
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx >= 0) {
        sessions[idx].title = title;
        sessions[idx].updated_at = new Date().toISOString();
        saveLocalSessions(sessions);
      }
      return true;
    }

    const { error } = await supabase
      .from('chat_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('[Chat] Error updating session title:', error.message);
      return false;
    }
    return true;
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const sessions = getLocalSessions().filter(s => s.id !== sessionId);
      saveLocalSessions(sessions);
      deleteLocalSession(sessionId);
      return true;
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('[Chat] Error deleting session:', error.message);
      return false;
    }
    return true;
  },

  async deleteAllSessions(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const sessions = getLocalSessions();
      sessions.forEach(s => deleteLocalSession(s.id));
      saveLocalSessions([]);
      return true;
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Chat] Error deleting all sessions:', error.message);
      return false;
    }
    return true;
  },

  // ============ MESSAGES ============

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured) {
      return getLocalMessages(sessionId);
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Chat] Supabase error fetching messages, using local storage:', error.message);
      return getLocalMessages(sessionId);
    }
    return (data || []) as ChatMessage[];
  },

  async addMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> {
    const now = new Date().toISOString();

    const localFallback = (): ChatMessage => {
      const localMsg: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        created_at: now,
      };
      const messages = getLocalMessages(message.session_id);
      messages.push(localMsg);
      saveLocalMessages(message.session_id, messages);

      // Update session timestamp
      const sessions = getLocalSessions();
      const idx = sessions.findIndex(s => s.id === message.session_id);
      if (idx >= 0) {
        sessions[idx].updated_at = now;
        saveLocalSessions(sessions);
      }

      return localMsg;
    };

    if (!isSupabaseConfigured) {
      return localFallback();
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: message.session_id,
          sender: message.sender,
          content: message.content,
          intent: message.intent,
          urgency_level: message.urgency_level,
          sources: message.sources,
        })
        .select()
        .single();

      if (error) {
        console.warn('[Chat] Supabase error adding message, falling back to local:', error.message);
        return localFallback();
      }

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: now })
        .eq('id', message.session_id);

      return data as ChatMessage;
    } catch {
      return localFallback();
    }
  },

  // ============ MOCK AI RESPONSE ============
  // Phase 3 placeholder — replaced by Puter.js in Phase 4

  generateMockResponse(userQuery: string): {
    content: string;
    sources: ChatMessageSource[];
    urgency: 'normal' | 'moderate' | 'urgent' | 'critical';
    isEmergency: boolean;
  } {
    const lowerQuery = userQuery.toLowerCase();

    // Red-flag emergency detection
    const emergencyPatterns = [
      /chest pain/i, /can'?t breathe/i, /difficulty breathing/i,
      /stroke/i, /unconscious/i, /heavy bleeding/i, /heart attack/i,
      /seizure/i, /anaphylaxis/i, /suicid/i, /overdose/i,
      /severe allergic/i, /choking/i,
    ];
    const isEmergency = emergencyPatterns.some(p => p.test(userQuery));

    if (isEmergency) {
      return {
        content: '🚨 **URGENT MEDICAL ALERT**\n\nThe symptoms you described may indicate a **life-threatening medical emergency**.\n\n**Take immediate action:**\n1. **Call your local emergency number** (112 / 911 / 108) right now\n2. Do not wait for online responses\n3. If someone is unconscious, check airway and begin CPR if trained\n4. Stay calm and follow emergency dispatcher instructions\n\n> ⚠️ This chatbot is an educational tool and cannot provide emergency medical treatment. Professional emergency medical services are critical in this situation.',
        sources: [
          { name: 'Emergency Medical Guidelines', url: 'https://www.who.int/news-room/fact-sheets/detail/emergency-care' },
        ],
        urgency: 'critical',
        isEmergency: true,
      };
    }

    // Topic-specific educational responses
    const topicResponses: Record<string, { content: string; sources: ChatMessageSource[] }> = {
      dengue: {
        content: '## Dengue Fever — Educational Overview\n\nDengue is a mosquito-borne viral infection transmitted primarily by **Aedes aegypti** mosquitoes.\n\n### Common Symptoms (onset 4–10 days after bite):\n- Sudden high fever (40°C / 104°F)\n- Severe headache and retro-orbital (behind the eyes) pain\n- Muscle and joint pain ("breakbone fever")\n- Nausea, vomiting, and fatigue\n- Skin rash appearing 2–5 days after fever\n\n### Prevention:\n- **Eliminate standing water** in flower pots, tires, and water containers weekly\n- Use DEET-based mosquito repellent on exposed skin\n- Install window and door screens\n- Wear light-colored, long-sleeved clothing\n\n### When to Seek Medical Care:\nSeek **immediate hospital care** if you experience severe abdominal pain, persistent vomiting, bleeding gums, or extreme fatigue during days 3–7 of illness.\n\n> ⚕️ *This is educational health information. For clinical diagnosis and treatment, consult a qualified healthcare professional.*',
        sources: [
          { name: 'WHO — Dengue Fact Sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' },
          { name: 'CDC — Dengue Prevention', url: 'https://www.cdc.gov/dengue/' },
        ],
      },
      diabetes: {
        content: '## Type 2 Diabetes — Educational Overview\n\nType 2 diabetes is a chronic metabolic disorder where the body becomes resistant to insulin or doesn\'t produce enough insulin to maintain normal glucose levels.\n\n### Early Warning Signs:\n- Increased thirst (polydipsia) and frequent urination (polyuria)\n- Unexplained fatigue and weakness\n- Blurred vision\n- Slow wound healing\n- Tingling or numbness in hands/feet\n\n### Risk Reduction Strategies:\n- Maintain a balanced diet rich in whole grains, vegetables, and lean proteins\n- Engage in at least 150 minutes of moderate physical activity per week\n- Maintain a healthy body weight (BMI 18.5–24.9)\n- Limit refined sugar and ultra-processed food intake\n- Get regular blood glucose screening (especially after age 35)\n\n> ⚕️ *This is educational health information. Blood sugar testing and diabetes management require professional medical supervision.*',
        sources: [
          { name: 'WHO — Diabetes Overview', url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes' },
          { name: 'International Diabetes Federation', url: 'https://idf.org' },
        ],
      },
      hypertension: {
        content: '## Hypertension (High Blood Pressure) — Educational Overview\n\nHypertension is defined as persistently elevated blood pressure ≥ 140/90 mmHg. It is often called the "silent killer" because it typically has no symptoms until organ damage occurs.\n\n### Key Facts:\n- Affects approximately 1.28 billion adults globally\n- Major risk factor for heart disease, stroke, and kidney failure\n- Can be effectively managed through lifestyle changes and medication\n\n### Prevention & Management:\n- **Reduce sodium intake** to less than 2,000 mg/day\n- Follow the **DASH diet** (fruits, vegetables, low-fat dairy, whole grains)\n- Exercise regularly (brisk walking, cycling, swimming)\n- Limit alcohol consumption and quit tobacco\n- Manage stress through relaxation techniques\n- Take prescribed medications consistently\n\n> ⚕️ *Blood pressure monitoring and medication adjustments require professional clinical guidance.*',
        sources: [
          { name: 'WHO — Hypertension Key Facts', url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension' },
          { name: 'American Heart Association', url: 'https://www.heart.org/en/health-topics/high-blood-pressure' },
        ],
      },
      vaccine: {
        content: '## Vaccination & Immunization — Educational Overview\n\nVaccines are one of the most effective tools in preventive medicine, saving an estimated 3.5–5 million lives annually according to WHO.\n\n### How Vaccines Work:\nVaccines train the immune system to recognize and fight specific pathogens by introducing a weakened, inactivated, or fragment of the pathogen, triggering protective antibody production without causing the disease.\n\n### Essential Adult Vaccines:\n- **Influenza (Flu)** — Annually before flu season\n- **Tdap/Td** — Tetanus, Diphtheria, Pertussis booster every 10 years\n- **HPV** — For eligible adults up to age 26–45\n- **Pneumococcal** — Recommended for adults 65+\n- **Hepatitis B** — 3-dose series for unimmunized adults\n\n### Vaccine Safety:\nAll approved vaccines undergo rigorous multi-phase clinical trials and continuous post-market safety monitoring.\n\n> ⚕️ *Consult your healthcare provider for personalized immunization recommendations based on your age, health conditions, and travel plans.*',
        sources: [
          { name: 'WHO — Vaccines and Immunization', url: 'https://www.who.int/health-topics/vaccines-and-immunization' },
          { name: 'CDC — Adult Immunization Schedule', url: 'https://www.cdc.gov/vaccines/schedules/hcp/imz/adult.html' },
        ],
      },
    };

    // Match topic
    let matched: { content: string; sources: ChatMessageSource[] } | null = null;
    for (const [key, value] of Object.entries(topicResponses)) {
      if (lowerQuery.includes(key)) {
        matched = value;
        break;
      }
    }

    if (lowerQuery.includes('flu') || lowerQuery.includes('influenza') || lowerQuery.includes('cold')) {
      matched = topicResponses['vaccine'];
    }

    if (matched) {
      return { content: matched.content, sources: matched.sources, urgency: 'normal', isEmergency: false };
    }

    // Generic educational response
    return {
      content: `## Health Information\n\nThank you for your question about **"${userQuery}"**.\n\nHere are some general educational points:\n\n1. **Understanding Symptoms**: Medical symptoms can have multiple causes. Early recognition and professional evaluation are key to effective management.\n\n2. **Prevention First**: Most common diseases can be significantly reduced through proper hygiene, balanced nutrition, regular physical activity, adequate sleep, and timely vaccination.\n\n3. **When to Consult a Doctor**: If symptoms persist for more than a few days, worsen progressively, or significantly affect your daily activities, schedule an appointment with a qualified healthcare provider.\n\n4. **Trusted Information Sources**: Always verify health information through official channels like WHO, CDC, or your national health ministry.\n\n> ⚕️ *This is general educational health information. For personal medical advice, diagnosis, or treatment, consult a licensed healthcare professional.*\n\n*In Phase 4, this response will be replaced by AI-generated, evidence-grounded answers via the Puter.js + RAG pipeline.*`,
      sources: [
        { name: 'World Health Organization (WHO)', url: 'https://www.who.int' },
        { name: 'CDC Health Topics A-Z', url: 'https://www.cdc.gov/health-topics.html' },
      ],
      urgency: 'normal',
      isEmergency: false,
    };
  },
};
