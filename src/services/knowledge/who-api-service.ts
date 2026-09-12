/**
 * HealthWise AI — Official WHO API Integration Service
 *
 * Interacts with the World Health Organization (WHO) Fact Sheets API:
 * Endpoint: https://www.who.int/api/hubs/factsheets
 * OData REST format with $filter, $top, $skip parameters.
 *
 * Grounding: All ingested health items retain original WHO URL, Id, publication dates, and text integrity.
 */

import { WHORawFactsheet, WHOApiResponse, NormalizedHealthDocument } from '../../types/database';
import { cleanHtml, computeChecksum } from './chunking-service';

// Centralized WHO API Configuration
export const WHO_API_CONFIG = {
  BASE_URL: 'https://www.who.int/api/hubs/factsheets',
  CANONICAL_DETAIL_BASE: 'https://www.who.int/news-room/fact-sheets/detail',
  SOURCE_NAME: 'World Health Organization',
  SOURCE_SHORT_NAME: 'WHO',
  DEFAULT_LANGUAGE: 'en',
  TIMEOUT_MS: 15000,
  // Priority public health topics for controlled, evidence-based initial ingestion
  PRIORITY_TOPICS: [
    'dengue-and-severe-dengue',
    'diabetes',
    'hypertension',
    'malaria',
    'tuberculosis',
    'asthma',
    'depression',
    'measles',
    'diarrhoeal-disease',
    'antimicrobial-resistance',
  ],
};

export const whoApiService = {
  /**
   * Fetch fact sheets from WHO with optional OData pagination and filter parameters
   */
  async fetchFactsheets(options: {
    top?: number;
    skip?: number;
    filter?: string;
    orderby?: string;
  } = {}): Promise<WHORawFactsheet[]> {
    const params = new URLSearchParams();
    if (options.top) params.set('$top', options.top.toString());
    if (options.skip) params.set('$skip', options.skip.toString());
    if (options.filter) params.set('$filter', options.filter);
    if (options.orderby) params.set('$orderby', options.orderby);

    const url = `${WHO_API_CONFIG.BASE_URL}?${params.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WHO_API_CONFIG.TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`WHO API HTTP Error: ${response.status} ${response.statusText}`);
      }

      const json: WHOApiResponse = await response.json();
      if (!json || !Array.isArray(json.value)) {
        throw new Error('WHO API returned unexpected response format');
      }

      return json.value;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`WHO API request timed out after ${WHO_API_CONFIG.TIMEOUT_MS / 1000}s`);
      }
      console.error('[WHO-API] Network failure or error fetching factsheets:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch a single factsheet by its URL slug (UrlName)
   */
  async fetchFactsheetBySlug(slug: string): Promise<WHORawFactsheet | null> {
    const filter = `contains(UrlName, '${slug}')`;
    const results = await this.fetchFactsheets({ filter, top: 1 });
    return results.length > 0 ? results[0] : null;
  },

  /**
   * Controlled synchronization: fetches curated priority public health conditions
   */
  async fetchPriorityFactsheets(): Promise<NormalizedHealthDocument[]> {
    const normalizedList: NormalizedHealthDocument[] = [];

    for (const slug of WHO_API_CONFIG.PRIORITY_TOPICS) {
      try {
        const raw = await this.fetchFactsheetBySlug(slug);
        if (raw) {
          normalizedList.push(this.normalizeFactsheet(raw));
        } else {
          console.warn(`[WHO-API] Priority factsheet slug "${slug}" returned no results`);
        }
      } catch (err: any) {
        console.warn(`[WHO-API] Failed fetching priority topic "${slug}":`, err.message);
        // Continue with remaining topics rather than aborting entirely
      }
    }

    return normalizedList;
  },

  /**
   * Normalize raw WHO API response into structured NormalizedHealthDocument
   * Preserves exact original text, provenance URL, dates, and condition name.
   */
  normalizeFactsheet(raw: WHORawFactsheet): NormalizedHealthDocument {
    const sourceUrl = raw.UrlName
      ? `${WHO_API_CONFIG.CANONICAL_DETAIL_BASE}/${raw.UrlName}`
      : `https://www.who.int${raw.ItemDefaultUrl || ''}`;

    const title = raw.Title?.trim() || raw.ConditionName?.trim() || 'Untitled WHO Fact Sheet';
    const conditionName = raw.ConditionName?.trim() || title;
    
    // Extract summary
    const summary = raw.Summary?.trim() || cleanHtml(raw.ConditionBriefOverview) || cleanHtml(raw.SymptomsBriefSummary) || '';

    // Extract structured sections
    const sections = {
      keyFacts: raw.Content?.includes('Key facts') ? extractSectionContent(raw.Content, 'Key facts') : undefined,
      overview: raw.ConditionLongerOverview || extractSectionContent(raw.Content, 'Overview'),
      symptoms: raw.SymptomsLongerSummary || raw.SymptomsBriefSummary || extractSectionContent(raw.Content, 'Symptoms'),
      prevention: raw.PreventionLongerSummary || raw.SelfCareLongerSummary || raw.PreventionBriefSummary || extractSectionContent(raw.Content, 'Prevention'),
      treatment: raw.MedicalTreatmentLongerSummary || raw.MedicalTreatmentBriefSummary || extractSectionContent(raw.Content, 'Treatment') || extractSectionContent(raw.Content, 'Diagnostics and treatment'),
    };

    // Calculate content checksum for deduplication and update detection
    const fullTextContent = cleanHtml(raw.Content || '') || summary;
    const checksum = computeChecksum(`${raw.Id}_${raw.LastModified || ''}_${fullTextContent.slice(0, 500)}`);

    // Tags derived from title, condition, and category
    const tags = [
      'who-verified',
      'public-health',
      slugify(conditionName),
    ].filter(Boolean);

    return {
      externalId: raw.Id,
      title,
      conditionName,
      topic: conditionName,
      summary,
      fullContent: fullTextContent,
      sections,
      sourceUrl,
      publicationDate: raw.PublicationDate || raw.PublicationDateAndTime || null,
      lastModifiedDate: raw.LastModified || null,
      checksum,
      language: WHO_API_CONFIG.DEFAULT_LANGUAGE,
      version: '1.0',
      tags,
    };
  },
};

// Helper: Extract text from HTML between specific headings if present
function extractSectionContent(html: string | undefined, headingText: string): string | undefined {
  if (!html) return undefined;
  const regex = new RegExp(`<h[1-6][^>]*>[\\s\\S]*?${headingText}[\\s\\S]*?<\\/h[1-6]>([\\s\\S]*?)(?=<h[1-6]|<hr|$)`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
}
