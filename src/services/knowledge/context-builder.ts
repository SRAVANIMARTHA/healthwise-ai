/**
 * HealthWise AI — RAG Context Builder
 *
 * Constructs structured evidence blocks from retrieved knowledge chunks
 * to ground Puter AI responses in official WHO health information.
 */

import { RetrievalResult, RAGContext } from '../../types/rag';

export const contextBuilder = {
  /**
   * Build formatted evidence prompt for Puter AI
   */
  buildContext(retrieval: RetrievalResult): RAGContext {
    if (!retrieval.isGrounded || retrieval.chunks.length === 0) {
      const evidencePrompt = `
[EVIDENCE GROUNDING NOTE]
Status: NO_SPECIFIC_EVIDENCE_FOUND in indexed WHO knowledge base.
Instruction for AI:
- Inform the user politely that the local verified knowledge base does not currently index specific documentation for this topic.
- Provide only general, safe, and evidence-based public health principles where appropriate.
- Remind the user to consult a doctor or visit https://www.who.int for full guidance.
- NEVER fabricate specific study statistics, treatment claims, or fake WHO citations.
`;
      return {
        evidencePrompt,
        sources: [],
        isGrounded: false,
        matchedTopics: retrieval.matchedTopics,
      };
    }

    let evidenceText = `
[EVIDENCE GROUNDING — OFFICIAL WORLD HEALTH ORGANIZATION FACT SHEETS]
The following evidence was retrieved from verified WHO public health documents.
Base your response directly on these authentic medical facts.
`;

    retrieval.chunks.forEach((chunk, idx) => {
      evidenceText += `
--- EVIDENCE PASSAGE ${idx + 1} ---
Document: ${chunk.docTitle} (World Health Organization)
Source URL: ${chunk.docSourceUrl}
${chunk.docPublicationDate ? `Publication Date: ${chunk.docPublicationDate}\n` : ''}Section: ${chunk.heading || 'Overview'}
Topic: ${chunk.topic}
Content:
${chunk.content}
`;
    });

    evidenceText += `
[CRITICAL INSTRUCTIONS FOR AI]
1. Ground your answer in the authentic WHO evidence provided above.
2. At the end of your answer, naturally reference the official source document name: "${retrieval.chunks[0].docTitle}".
3. Do NOT invent symptoms, numbers, or treatments not supported by the evidence above.
4. Do NOT diagnose the user or recommend prescription medications.
5. Emphasize prevention, symptom awareness, and when to seek medical attention.
`;

    return {
      evidencePrompt: evidenceText,
      sources: retrieval.sources,
      isGrounded: true,
      matchedTopics: retrieval.matchedTopics,
    };
  },
};
