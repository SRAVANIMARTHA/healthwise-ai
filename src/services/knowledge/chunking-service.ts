/**
 * HealthWise AI — Knowledge Chunking Service
 *
 * Prepares knowledge documents for granular semantic / keyword retrieval.
 * Part of Phase 5 source normalization pipeline; sets up Phase 6 RAG retrieval.
 */

import { KnowledgeChunk, NormalizedHealthDocument } from '../../types/database';

export interface ChunkDraft {
  chunk_index: number;
  content: string;
  heading: string | null;
  topic: string;
  tags: string[];
  token_count: number;
  metadata?: Record<string, unknown>;
}

/**
 * Simple hash function for content checksums
 */
export function computeChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

/**
 * Strip HTML tags while retaining readable paragraph and list structure
 */
export function cleanHtml(html: string | undefined | null): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]+>/g, '') // remove any remaining tags
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into semantic chunks by section headers
 */
export function chunkDocument(
  doc: NormalizedHealthDocument,
  maxChunkChars: number = 800
): ChunkDraft[] {
  const chunks: ChunkDraft[] = [];
  let chunkIndex = 0;

  // 1. Summary Chunk (Executive high-level overview)
  if (doc.summary && doc.summary.trim().length > 30) {
    chunks.push({
      chunk_index: chunkIndex++,
      content: `${doc.title} — Executive Summary:\n${doc.summary.trim()}`,
      heading: 'Executive Summary',
      topic: doc.topic,
      tags: doc.tags,
      token_count: Math.ceil(doc.summary.length / 4),
      metadata: {
        source_url: doc.sourceUrl,
        section: 'summary',
      },
    });
  }

  // 2. Structured Sections (Key facts, Overview, Symptoms, Prevention, Treatment)
  const sectionEntries: Array<[string, string | undefined]> = [
    ['Key Facts', doc.sections.keyFacts],
    ['Overview', doc.sections.overview],
    ['Symptoms & Warning Signs', doc.sections.symptoms],
    ['Prevention & Control', doc.sections.prevention],
    ['Diagnostics & Treatment', doc.sections.treatment],
  ];

  for (const [sectionTitle, rawContent] of sectionEntries) {
    if (!rawContent || rawContent.trim().length < 20) continue;

    const cleaned = cleanHtml(rawContent);
    if (!cleaned) continue;

    // If section fits in single chunk
    if (cleaned.length <= maxChunkChars) {
      chunks.push({
        chunk_index: chunkIndex++,
        content: `### ${doc.title}: ${sectionTitle}\n${cleaned}`,
        heading: sectionTitle,
        topic: doc.topic,
        tags: doc.tags,
        token_count: Math.ceil(cleaned.length / 4),
        metadata: {
          source_url: doc.sourceUrl,
          section: sectionTitle.toLowerCase(),
        },
      });
    } else {
      // Split large sections by paragraphs
      const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);
      let currentChunkText = `### ${doc.title}: ${sectionTitle}\n`;

      for (const para of paragraphs) {
        if ((currentChunkText + '\n\n' + para).length > maxChunkChars && currentChunkText.length > 50) {
          chunks.push({
            chunk_index: chunkIndex++,
            content: currentChunkText.trim(),
            heading: sectionTitle,
            topic: doc.topic,
            tags: doc.tags,
            token_count: Math.ceil(currentChunkText.length / 4),
            metadata: {
              source_url: doc.sourceUrl,
              section: sectionTitle.toLowerCase(),
            },
          });
          currentChunkText = `### ${doc.title}: ${sectionTitle} (cont.)\n` + para;
        } else {
          currentChunkText += (currentChunkText.endsWith('\n') ? '' : '\n\n') + para;
        }
      }

      if (currentChunkText.trim().length > 50) {
        chunks.push({
          chunk_index: chunkIndex++,
          content: currentChunkText.trim(),
          heading: sectionTitle,
          topic: doc.topic,
          tags: doc.tags,
          token_count: Math.ceil(currentChunkText.length / 4),
          metadata: {
            source_url: doc.sourceUrl,
            section: sectionTitle.toLowerCase(),
          },
        });
      }
    }
  }

  // Fallback: If no structured sections were created, chunk the fullContent directly
  if (chunks.length === 0 && doc.fullContent) {
    const cleanedFull = cleanHtml(doc.fullContent);
    const paragraphs = cleanedFull.split(/\n\n+/).filter(p => p.trim().length > 0);
    let currentChunkText = `### ${doc.title}\n`;

    for (const para of paragraphs) {
      if ((currentChunkText + '\n\n' + para).length > maxChunkChars && currentChunkText.length > 50) {
        chunks.push({
          chunk_index: chunkIndex++,
          content: currentChunkText.trim(),
          heading: 'General',
          topic: doc.topic,
          tags: doc.tags,
          token_count: Math.ceil(currentChunkText.length / 4),
          metadata: { source_url: doc.sourceUrl },
        });
        currentChunkText = `### ${doc.title} (cont.)\n` + para;
      } else {
        currentChunkText += (currentChunkText.endsWith('\n') ? '' : '\n\n') + para;
      }
    }

    if (currentChunkText.trim().length > 50) {
      chunks.push({
        chunk_index: chunkIndex++,
        content: currentChunkText.trim(),
        heading: 'General',
        topic: doc.topic,
        tags: doc.tags,
        token_count: Math.ceil(currentChunkText.length / 4),
        metadata: { source_url: doc.sourceUrl },
      });
    }
  }

  return chunks;
}
