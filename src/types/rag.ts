/**
 * HealthWise AI — Retrieval-Augmented Generation (RAG) Types
 */

import { ChatMessageSource } from './chat';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  heading: string | null;
  topic: string;
  docTitle: string;
  docSourceUrl: string;
  docPublicationDate?: string | null;
  relevanceScore: number; // 0.0 to 1.0
}

export interface RetrievalResult {
  query: string;
  expandedQuery: string;
  chunks: RetrievedChunk[];
  isGrounded: boolean;
  confidence: number; // 0.0 to 1.0
  sources: ChatMessageSource[];
  matchedTopics: string[];
}

export interface RAGContext {
  evidencePrompt: string;
  sources: ChatMessageSource[];
  isGrounded: boolean;
  matchedTopics: string[];
}
