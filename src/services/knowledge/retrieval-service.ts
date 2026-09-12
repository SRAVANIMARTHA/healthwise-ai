/**
 * HealthWise AI — Knowledge Retrieval Service (RAG)
 *
 * Implements query preprocessing, health entity recognition, multi-turn
 * contextual expansion, semantic chunk scoring, and threshold filtering.
 */

import { knowledgeService } from './knowledge-service';
import { KnowledgeChunk, KnowledgeDocument } from '../../types/database';
import { RetrievedChunk, RetrievalResult } from '../../types/rag';
import { ChatMessageSource } from '../../types/chat';
import { globalQueryCache } from '../../utils/cache';

export interface RetrievalOptions {
  topK?: number;
  minRelevance?: number;
}

const DEFAULT_OPTIONS: Required<RetrievalOptions> = {
  topK: 4,
  minRelevance: 0.25,
};

// Common medical / health intent keyword maps
const INTENT_KEYWORDS: Record<string, string[]> = {
  symptoms: ['symptom', 'symptoms', 'sign', 'signs', 'warning', 'feeling', 'pain', 'ache', 'fever', 'cough', 'rash', 'headache', 'vomiting', 'nausea'],
  prevention: ['prevent', 'prevention', 'avoid', 'protection', 'protect', 'risk', 'reduce', 'lifestyle', 'diet', 'exercise', 'habit', 'habits', 'stop'],
  treatment: ['treat', 'treatment', 'cure', 'medicine', 'medication', 'care', 'manage', 'management', 'therapy', 'remedy', 'doctor', 'hospital'],
  causes: ['cause', 'causes', 'transmitted', 'transmission', 'spread', 'mosquito', 'viral', 'bacterial', 'parasite', 'infection'],
  vaccination: ['vaccine', 'vaccines', 'vaccination', 'immunization', 'shot', 'shots', 'dose', 'booster'],
};

// Known health topics for entity extraction
const KNOWN_TOPICS: Record<string, string[]> = {
  dengue: ['dengue', 'breakbone', 'aedes'],
  diabetes: ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin', 'glycemic'],
  hypertension: ['hypertension', 'blood pressure', 'high bp', 'systolic', 'diastolic', 'dash'],
  malaria: ['malaria', 'anopheles', 'plasmodium'],
  vaccination: ['vaccine', 'vaccines', 'vaccination', 'immunization', 'flu shot'],
  asthma: ['asthma', 'wheezing', 'inhaler'],
  tuberculosis: ['tuberculosis', 'tb'],
  depression: ['depression', 'depressed', 'mental health'],
  cholera: ['cholera', 'waterborne'],
  measles: ['measles', 'rubella', 'mmr'],
};

export const retrievalService = {
  /**
   * Main entry point: retrieves relevant knowledge chunks for a query
   */
  async retrieveRelevantChunks(
    query: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Performance optimization: check global query cache
    const cacheKey = `rag:${query.trim().toLowerCase()}:${opts.topK}:${opts.minRelevance}:${conversationHistory.length}`;
    const cached = globalQueryCache.get(cacheKey) as RetrievalResult | null;
    if (cached) {
      return cached;
    }

    // 1. Query preprocessing & expansion
    const { expandedQuery, extractedTopics, extractedIntents } = this.preprocessQuery(
      query,
      conversationHistory
    );

    // 2. Fetch all indexed chunks and parent documents
    const [allChunks, allDocs] = await Promise.all([
      knowledgeService.getAllChunks(),
      knowledgeService.getDocuments(),
    ]);

    const docMap = new Map<string, KnowledgeDocument>();
    for (const d of allDocs) {
      docMap.set(d.id, d);
    }

    if (allChunks.length === 0) {
      return {
        query,
        expandedQuery,
        chunks: [],
        isGrounded: false,
        confidence: 0,
        sources: [],
        matchedTopics: [],
      };
    }

    // 3. Score every chunk against the expanded query
    const scoredChunks: RetrievedChunk[] = [];

    for (const chunk of allChunks) {
      const parentDoc = docMap.get(chunk.document_id);
      const score = this.scoreChunk(chunk, parentDoc, expandedQuery, extractedTopics, extractedIntents);

      if (score > 0) {
        scoredChunks.push({
          chunkId: chunk.id,
          documentId: chunk.document_id,
          chunkIndex: chunk.chunk_index,
          content: chunk.content,
          heading: chunk.heading,
          topic: chunk.topic,
          docTitle: parentDoc?.title || chunk.topic,
          docSourceUrl: parentDoc?.source_url || 'https://www.who.int',
          docPublicationDate: parentDoc?.publication_date,
          relevanceScore: score,
        });
      }
    }

    // 4. Sort by relevance score descending
    scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 5. Evaluate threshold confidence
    const topScore = scoredChunks.length > 0 ? scoredChunks[0].relevanceScore : 0;
    const isGrounded = topScore >= opts.minRelevance;

    if (!isGrounded) {
      return {
        query,
        expandedQuery,
        chunks: [],
        isGrounded: false,
        confidence: topScore,
        sources: [],
        matchedTopics: extractedTopics,
      };
    }

    // 6. Select top K qualifying chunks
    const qualifiedChunks = scoredChunks
      .filter(c => c.relevanceScore >= opts.minRelevance)
      .slice(0, opts.topK);

    // 7. Extract distinct sources for citation chips
    const sourcesMap = new Map<string, ChatMessageSource>();
    for (const c of qualifiedChunks) {
      if (c.docSourceUrl && !sourcesMap.has(c.docSourceUrl)) {
        sourcesMap.set(c.docSourceUrl, {
          name: `${c.docTitle} (WHO)`,
          url: c.docSourceUrl,
        });
      }
    }

    const finalResult: RetrievalResult = {
      query,
      expandedQuery,
      chunks: qualifiedChunks,
      isGrounded: true,
      confidence: topScore,
      sources: Array.from(sourcesMap.values()),
      matchedTopics: extractedTopics,
    };

    globalQueryCache.set(cacheKey, finalResult);
    return finalResult;
  },

  /**
   * Preprocess user query, extracting topics and resolving multi-turn context
   */
  preprocessQuery(
    query: string,
    history: Array<{ role: string; content: string }>
  ): {
    expandedQuery: string;
    extractedTopics: string[];
    extractedIntents: string[];
  } {
    const cleanQ = query.toLowerCase().trim();
    const extractedTopics: string[] = [];
    const extractedIntents: string[] = [];

    // Identify topics in current query
    for (const [topic, aliases] of Object.entries(KNOWN_TOPICS)) {
      if (aliases.some(a => cleanQ.includes(a))) {
        extractedTopics.push(topic);
      }
    }

    // Identify intents (symptoms, prevention, etc.)
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some(k => cleanQ.includes(k))) {
        extractedIntents.push(intent);
      }
    }

    // Multi-turn context resolution:
    // If the current query lacks a topic but recent messages had one (e.g. "What are the warning signs?"),
    // borrow the topic from the last user message.
    let expandedQuery = cleanQ;
    if (extractedTopics.length === 0 && history.length > 0) {
      const recentUserMsgs = history.filter(m => m.role === 'user').slice(-2);
      for (const msg of recentUserMsgs.reverse()) {
        const lowerPrev = msg.content.toLowerCase();
        for (const [topic, aliases] of Object.entries(KNOWN_TOPICS)) {
          if (aliases.some(a => lowerPrev.includes(a)) && !extractedTopics.includes(topic)) {
            extractedTopics.push(topic);
            expandedQuery = `${cleanQ} ${topic}`;
            break;
          }
        }
        if (extractedTopics.length > 0) break;
      }
    }

    return { expandedQuery, extractedTopics, extractedIntents };
  },

  /**
   * Calculate relevance score between a chunk and the query (0.0 to 1.0)
   */
  scoreChunk(
    chunk: KnowledgeChunk,
    parentDoc: KnowledgeDocument | undefined,
    query: string,
    extractedTopics: string[],
    extractedIntents: string[]
  ): number {
    const lowerContent = chunk.content.toLowerCase();
    const lowerHeading = (chunk.heading || '').toLowerCase();
    const lowerTopic = chunk.topic.toLowerCase();
    const lowerDocTitle = (parentDoc?.title || '').toLowerCase();
    const chunkTags = chunk.tags.map(t => t.toLowerCase());

    let rawScore = 0;

    // 1. Topic Match (High Weight)
    for (const topic of extractedTopics) {
      if (lowerTopic.includes(topic) || lowerDocTitle.includes(topic)) {
        rawScore += 4.0;
      } else if (chunkTags.includes(topic)) {
        rawScore += 3.0;
      } else if (lowerContent.includes(topic)) {
        rawScore += 2.0;
      }
    }

    // 2. Heading / Section Intent Match
    for (const intent of extractedIntents) {
      const keywords = INTENT_KEYWORDS[intent] || [];
      if (keywords.some(k => lowerHeading.includes(k))) {
        rawScore += 3.5;
      } else if (keywords.some(k => lowerContent.includes(k))) {
        rawScore += 1.5;
      }
    }

    // 3. Query Token Overlap (Lexical TF)
    const queryTokens = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    if (queryTokens.length > 0) {
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (lowerHeading.includes(token)) matchedTokens += 2.0;
        else if (lowerContent.includes(token)) matchedTokens += 1.0;
      }
      rawScore += (matchedTokens / queryTokens.length) * 3.0;
    }

    // 4. Exact Query Substring Bonus
    if (query.length > 10 && lowerContent.includes(query)) {
      rawScore += 3.0;
    }

    // Normalize rawScore: max realistic score is ~13.0 -> normalize to 0.0 - 1.0
    const normalized = Math.min(1.0, rawScore / 10.0);
    return Math.round(normalized * 100) / 100;
  },
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'with', 'what', 'how', 'can', 'should', 'about',
  'that', 'this', 'from', 'have', 'has', 'does', 'tell', 'explain', 'give',
  'know', 'some', 'any', 'who', 'why', 'when', 'where', 'which', 'will',
]);
