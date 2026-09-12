/**
 * HealthWise AI — Curated Trusted Health Resources Directory
 */

export interface HealthResource {
  id: string;
  title: string;
  org: string;
  category: 'Global Health' | 'Prevention' | 'Vector Control' | 'Vaccination' | 'Clinical Education' | 'Research' | 'Mental Health';
  link: string;
  description: string;
  verified: boolean;
  sourceType: 'official_agency' | 'guidelines' | 'research' | 'portal';
}

export const CURATED_RESOURCES: HealthResource[] = [
  {
    id: 'res-who-factsheets',
    title: 'WHO Fact Sheets on Communicable & Non-communicable Diseases',
    org: 'World Health Organization (WHO)',
    category: 'Global Health',
    link: 'https://www.who.int/news-room/fact-sheets',
    description: 'Authoritative data sheets covering epidemiology, clinical manifestations, prevention, and treatment protocols for over 200 health conditions.',
    verified: true,
    sourceType: 'official_agency',
  },
  {
    id: 'res-cdc-travel',
    title: 'CDC Traveler’s Health & Yellow Book Guidelines',
    org: 'Centers for Disease Control and Prevention (US CDC)',
    category: 'Prevention',
    link: 'https://wwwnc.cdc.gov/travel',
    description: 'Clinical recommendations for international travel, destination-specific endemic disease risks, travel vaccines, and disease prophylaxis.',
    verified: true,
    sourceType: 'guidelines',
  },
  {
    id: 'res-nvbdcp-india',
    title: 'National Center for Vector Borne Diseases Control (NCVBDC)',
    org: 'Ministry of Health & Family Welfare, Govt of India',
    category: 'Vector Control',
    link: 'https://ncvbdc.mohfw.gov.in/',
    description: 'Technical guidelines and national case management protocols for Dengue, Malaria, Chikungunya, Kala-azar, and Lymphatic Filariasis.',
    verified: true,
    sourceType: 'official_agency',
  },
  {
    id: 'res-uip-india',
    title: 'Universal Immunization Programme (UIP) National Guidelines',
    org: 'Ministry of Health & Family Welfare, Govt of India',
    category: 'Vaccination',
    link: 'https://main.mohfw.gov.in/',
    description: 'National immunization schedules for infants, children, and pregnant women, cold-chain logistics, and AEFI surveillance standards.',
    verified: true,
    sourceType: 'guidelines',
  },
  {
    id: 'res-nhs-conditions',
    title: 'NHS Health A-Z Conditions & Symptoms Directory',
    org: 'National Health Service (NHS UK)',
    category: 'Clinical Education',
    link: 'https://www.nhs.uk/conditions/',
    description: 'Patient-friendly, medically audited guides on common symptoms, conservative management, medication overviews, and when to seek medical evaluation.',
    verified: true,
    sourceType: 'portal',
  },
  {
    id: 'res-pubmed-central',
    title: 'PubMed Central (PMC) — Open Access Biomedical Archive',
    org: 'National Library of Medicine / NIH',
    category: 'Research',
    link: 'https://www.ncbi.nlm.nih.gov/pmc/',
    description: 'Free full-text archive of biomedical and life sciences journal literature at the U.S. National Institutes of Health (NIH).',
    verified: true,
    sourceType: 'research',
  },
  {
    id: 'res-tele-manas',
    title: 'Tele-MANAS National Mental Health Programme',
    org: 'Ministry of Health & Family Welfare / NIMHANS',
    category: 'Mental Health',
    link: 'https://telemanas.mohfw.gov.in/',
    description: '24/7 comprehensive, integrated, and quality tele-mental health counseling service available across all Indian states and union territories.',
    verified: true,
    sourceType: 'official_agency',
  },
  {
    id: 'res-who-vaccines',
    title: 'WHO Essential Medicines and Health Products Information',
    org: 'World Health Organization (WHO)',
    category: 'Vaccination',
    link: 'https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines',
    description: 'Model lists of essential medicines and vaccines required for basic health systems, safety standards, and global immunization strategies.',
    verified: true,
    sourceType: 'guidelines',
  },
];

export const resourceService = {
  async getResources(filter?: { category?: string; search?: string }): Promise<HealthResource[]> {
    let list = CURATED_RESOURCES;

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((r) => r.category === filter.category);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.org.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getCategories(): Promise<string[]> {
    const set = new Set<string>();
    CURATED_RESOURCES.forEach((r) => set.add(r.category));
    return ['All', ...Array.from(set).sort()];
  },
};
