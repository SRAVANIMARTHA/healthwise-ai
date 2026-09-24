/**
 * HealthWise AI — Health Report Explainer Types (Phase 18)
 */

export type MedicalAttentionLevel =
  | 'informational'
  | 'discuss_with_doctor'
  | 'prompt_attention';

export type TestFindingFlag =
  | 'normal'
  | 'low'
  | 'high'
  | 'abnormal'
  | 'indeterminate';

export interface ReportTestFinding {
  id: string;
  testName: string;
  category?: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRangeText: string;
  lowerLimit?: number;
  upperLimit?: number;
  flag: TestFindingFlag;
  sourcePage?: number;
  explanation?: string;
  whatItMeasures?: string;
}

export interface ReportPattern {
  id: string;
  name: string;
  description: string;
  matchedTests: string[];
  clinicalSignificance: string;
  suggestedQuestions: string[];
}

export interface ReportAnalysisResult {
  reportId: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileSizeBytes: number;
  analyzedAt: string;
  executiveSummary: string;
  medicalAttentionLevel: MedicalAttentionLevel;
  medicalAttentionRationale: string;
  totalTestsReviewed: number;
  withinRangeCount: number;
  outsideRangeCount: number;
  indeterminateCount: number;
  findings: ReportTestFinding[];
  patterns: ReportPattern[];
  questionsForDoctor: string[];
  disclaimer: string;
}

export type HealthcareFacilityType =
  | 'hospital'
  | 'clinic'
  | 'doctor'
  | 'centre'
  | 'diagnostic_center'
  | 'pharmacy'
  | 'other';

export interface HealthcareFacility {
  id: string;
  osmId?: string;
  name: string;
  type: HealthcareFacilityType;
  address: string;
  distanceKm?: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  speciality?: string;
  latitude: number;
  longitude: number;
}
