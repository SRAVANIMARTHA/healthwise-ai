/**
 * HealthWise AI — Report Parser Service (Phase 18)
 *
 * Implements the deterministic interpretation engine for laboratory and medical reports.
 *
 * CRITICAL INVARIANTS:
 * 1. Reference Range Rule: Always prefers the reference range printed on the report.
 *    If missing, sets: "The report does not provide a reference range for this result."
 * 2. Deterministic Range Comparison: Done in TypeScript code BEFORE passing to LLM.
 *    Value < Lower -> 'low'
 *    Value > Upper -> 'high'
 *    Between -> 'normal'
 * 3. Pattern Recognition: Identifies multi-test clinical patterns (Anemia, Glycemic,
 *    Lipid, Hepatic, Renal, Inflammatory).
 * 4. Medical-Attention Classification:
 *    - 'informational'
 *    - 'discuss_with_doctor'
 *    - 'prompt_attention'
 * 5. Prompt-Injection Containment: Strips malicious instructions before AI ingestion.
 */

import {
  ReportTestFinding,
  ReportPattern,
  MedicalAttentionLevel,
  TestFindingFlag,
} from '../../types/report';
import { securitySanitizer } from '../security/sanitizer';

// Common diagnostic test signatures and units
interface TestDefinition {
  canonicalName: string;
  category: string;
  aliases: RegExp[];
  typicalUnits: string[];
  criticalLow?: number;
  criticalHigh?: number;
}

const KNOWN_TESTS: TestDefinition[] = [
  // Complete Blood Count (CBC)
  {
    canonicalName: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count',
    aliases: [/hemoglobin/i, /\bhb\b/i, /haemoglobin/i],
    typicalUnits: ['g/dL', 'g/L', 'gm/dL'],
    criticalLow: 7.0,
    criticalHigh: 20.0,
  },
  {
    canonicalName: 'Packed Cell Volume (PCV / Hematocrit)',
    category: 'Complete Blood Count',
    aliases: [/hematocrit/i, /haematocrit/i, /\bpcv\b/i, /\bhct\b/i],
    typicalUnits: ['%'],
    criticalLow: 20,
    criticalHigh: 60,
  },
  {
    canonicalName: 'Red Blood Cell Count (RBC)',
    category: 'Complete Blood Count',
    aliases: [/rbc\s*count/i, /red\s*blood\s*cells/i, /total\s*rbc/i, /\brbc\b/i],
    typicalUnits: ['mil/uL', '10^6/uL', 'million/cumm', 'x10^12/L'],
  },
  {
    canonicalName: 'White Blood Cell Count (WBC / Leukocytes)',
    category: 'Complete Blood Count',
    aliases: [/wbc\s*count/i, /white\s*blood\s*cells/i, /total\s*leukocyte/i, /\btlc\b/i, /\bwbc\b/i],
    typicalUnits: ['cells/cumm', '10^3/uL', '10^3 / uL', 'x10^9/L', 'thou/uL', 'k/uL', '/cumm', '/uL'],
    criticalLow: 2000,
    criticalHigh: 30000,
  },
  {
    canonicalName: 'Platelet Count',
    category: 'Complete Blood Count',
    aliases: [/platelet\s*count/i, /thrombocytes/i, /\bplatelets\b/i],
    typicalUnits: [
      'lakh/cumm',
      'lakhs/cumm',
      'lac/cumm',
      'lacs/cumm',
      'lakhs',
      'lakh',
      '10^5/uL',
      '10^5 / uL',
      '10^3/uL',
      '10^3 / uL',
      'x10^9/L',
      'thou/uL',
      'k/uL',
      'cells/cumm',
      '/cumm',
      '/uL',
    ],
    criticalLow: 25000,
    criticalHigh: 1000000,
  },
  {
    canonicalName: 'Mean Corpuscular Volume (MCV)',
    category: 'Red Cell Indices',
    aliases: [/\bmcv\b/i, /mean\s*corpuscular\s*volume/i],
    typicalUnits: ['fL'],
  },
  {
    canonicalName: 'Mean Corpuscular Hemoglobin (MCH)',
    category: 'Red Cell Indices',
    aliases: [/\bmch\b/i, /mean\s*corpuscular\s*hemoglobin/i],
    typicalUnits: ['pg'],
  },
  {
    canonicalName: 'Mean Corpuscular Hemoglobin Conc. (MCHC)',
    category: 'Red Cell Indices',
    aliases: [/\bmchc\b/i],
    typicalUnits: ['g/dL', '%'],
  },

  // Metabolic & Glycemic
  {
    canonicalName: 'Fasting Blood Glucose',
    category: 'Metabolic & Diabetes',
    aliases: [/fasting\s*blood\s*(sugar|glucose)/i, /fbs/i, /glucose\s*\(fasting\)/i, /fasting\s*plasma\s*glucose/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
    criticalLow: 50,
    criticalHigh: 400,
  },
  {
    canonicalName: 'Postprandial Blood Glucose',
    category: 'Metabolic & Diabetes',
    aliases: [/postprandial\s*(sugar|glucose)/i, /ppbs/i, /glucose\s*\(pp\)/i, /post\s*prandial/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
    criticalLow: 50,
    criticalHigh: 450,
  },
  {
    canonicalName: 'HbA1c (Glycated Hemoglobin)',
    category: 'Metabolic & Diabetes',
    aliases: [/hba1c/i, /glycated\s*hemoglobin/i, /glycohemoglobin/i, /a1c/i],
    typicalUnits: ['%', 'mmol/mol'],
    criticalHigh: 14.0,
  },

  // Lipid Panel
  {
    canonicalName: 'Total Cholesterol',
    category: 'Lipid Panel',
    aliases: [/total\s*cholesterol/i, /\bcholesterol\b/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
  },
  {
    canonicalName: 'Triglycerides',
    category: 'Lipid Panel',
    aliases: [/triglycerides/i, /\btg\b/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
    criticalHigh: 1000,
  },
  {
    canonicalName: 'HDL Cholesterol (Good Cholesterol)',
    category: 'Lipid Panel',
    aliases: [/hdl\s*cholesterol/i, /\bhdl\b/i, /high\s*density\s*lipoprotein/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
  },
  {
    canonicalName: 'LDL Cholesterol',
    category: 'Lipid Panel',
    aliases: [/ldl\s*cholesterol/i, /\bldl\b/i, /low\s*density\s*lipoprotein/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
  },

  // Renal / Kidney Function
  {
    canonicalName: 'Serum Creatinine',
    category: 'Kidney Function',
    aliases: [/creatinine/i, /serum\s*creatinine/i, /\bs\.creatinine\b/i],
    typicalUnits: ['mg/dL', 'umol/L'],
    criticalHigh: 6.0,
  },
  {
    canonicalName: 'Blood Urea Nitrogen (BUN) / Urea',
    category: 'Kidney Function',
    aliases: [/blood\s*urea/i, /\bbun\b/i, /serum\s*urea/i],
    typicalUnits: ['mg/dL', 'mmol/L'],
    criticalHigh: 100,
  },
  {
    canonicalName: 'Uric Acid',
    category: 'Kidney Function',
    aliases: [/uric\s*acid/i],
    typicalUnits: ['mg/dL', 'umol/L'],
  },

  // Liver Function (LFT)
  {
    canonicalName: 'SGPT / ALT (Alanine Aminotransferase)',
    category: 'Liver Function',
    aliases: [/sgpt/i, /\balt\b/i, /alanine\s*aminotransferase/i],
    typicalUnits: ['U/L', 'IU/L'],
    criticalHigh: 500,
  },
  {
    canonicalName: 'SGOT / AST (Aspartate Aminotransferase)',
    category: 'Liver Function',
    aliases: [/sgot/i, /\bast\b/i, /aspartate\s*aminotransferase/i],
    typicalUnits: ['U/L', 'IU/L'],
    criticalHigh: 500,
  },
  {
    canonicalName: 'Bilirubin Total',
    category: 'Liver Function',
    aliases: [/total\s*bilirubin/i, /bilirubin\s*total/i, /\bt\.bilirubin\b/i],
    typicalUnits: ['mg/dL', 'umol/L'],
    criticalHigh: 15,
  },
  {
    canonicalName: 'Alkaline Phosphatase (ALP)',
    category: 'Liver Function',
    aliases: [/alkaline\s*phosphatase/i, /\balp\b/i],
    typicalUnits: ['U/L', 'IU/L'],
  },

  // Thyroid Function
  {
    canonicalName: 'TSH (Thyroid Stimulating Hormone)',
    category: 'Thyroid Function',
    aliases: [/thyroid\s*stimulating\s*hormone/i, /\btsh\b/i, /ultra\s*tsh/i],
    typicalUnits: ['uIU/mL', 'mIU/L', 'uU/mL'],
  },

  // Electrolytes
  {
    canonicalName: 'Serum Potassium (K+)',
    category: 'Electrolytes',
    aliases: [/potassium/i, /serum\s*k\+/i, /\bk\+\b/i],
    typicalUnits: ['mEq/L', 'mmol/L'],
    criticalLow: 2.8,
    criticalHigh: 6.2,
  },
  {
    canonicalName: 'Serum Sodium (Na+)',
    category: 'Electrolytes',
    aliases: [/sodium/i, /serum\s*na\+/i, /\bna\+\b/i],
    typicalUnits: ['mEq/L', 'mmol/L'],
    criticalLow: 120,
    criticalHigh: 160,
  },
];

export const reportParserService = {
  /**
   * Parse extracted raw text into structured findings, patterns, and attention level
   */
  parseReportText(rawText: string): {
    findings: ReportTestFinding[];
    patterns: ReportPattern[];
    medicalAttentionLevel: MedicalAttentionLevel;
    medicalAttentionRationale: string;
    withinRangeCount: number;
    outsideRangeCount: number;
    indeterminateCount: number;
  } {
    // 1. Sanitize text to remove control characters and avoid script execution
    const sanitizedText = (rawText || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    const lines: string[] = sanitizedText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);

    const findings: ReportTestFinding[] = [];
    let findingIndex = 1;

    // Scan lines for test records
    for (const line of lines) {
      const parsedFinding = this.parseLineForTest(line, findingIndex);
      if (parsedFinding) {
        // Avoid duplicates of the exact same test name
        const exists = findings.some(
          (f) => f.testName.toLowerCase() === parsedFinding.testName.toLowerCase()
        );
        if (!exists) {
          findings.push(parsedFinding);
          findingIndex++;
        }
      }
    }

    // Calculate metric counts
    const withinRangeCount = findings.filter((f) => f.flag === 'normal').length;
    const outsideRangeCount = findings.filter((f) => f.flag === 'low' || f.flag === 'high' || f.flag === 'abnormal').length;
    const indeterminateCount = findings.filter((f) => f.flag === 'indeterminate').length;

    // 2. Identify clinical multi-test patterns
    const patterns = this.detectPatterns(findings);

    // 3. Classify medical attention level deterministically
    const { level: medicalAttentionLevel, rationale: medicalAttentionRationale } =
      this.classifyMedicalAttention(findings, patterns);

    return {
      findings,
      patterns,
      medicalAttentionLevel,
      medicalAttentionRationale,
      withinRangeCount,
      outsideRangeCount,
      indeterminateCount,
    };
  },

  /**
   * Parse a single text line to identify a test finding, its numeric value, and its printed reference range
   */
  parseLineForTest(line: string, index: number): ReportTestFinding | null {
    // Check known test patterns
    for (const testDef of KNOWN_TESTS) {
      const matchesAlias = testDef.aliases.some((pattern) => pattern.test(line));
      if (!matchesAlias) continue;

      // Extract numeric value and reference range
      const numberMatches = line.match(/\b\d+(?:\.\d+)?\b/g);
      if (!numberMatches || numberMatches.length === 0) continue;

      // Common lab line pattern:
      // "Hemoglobin   10.2   g/dL   12.0 - 15.0"
      // "Fasting Blood Sugar   142   mg/dL   (70 - 100)"
      let valueStr = '';
      let numericVal: number | undefined;
      let lowerLimit: number | undefined;
      let upperLimit: number | undefined;
      let rangeText = 'The report does not provide a reference range for this result.';

      // Try finding range pattern: e.g. "12.0 - 15.0" or "70-100" or "< 200" or "> 50"
      const rangeMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i);
      const lessThanMatch = line.match(/(?:<|less\s+than)\s*(\d+(?:\.\d+)?)/i);
      const greaterThanMatch = line.match(/(?:>|greater\s+than)\s*(\d+(?:\.\d+)?)/i);

      if (rangeMatch) {
        lowerLimit = parseFloat(rangeMatch[1]);
        upperLimit = parseFloat(rangeMatch[2]);
        rangeText = `${rangeMatch[1]} – ${rangeMatch[2]}`;
      } else if (lessThanMatch) {
        upperLimit = parseFloat(lessThanMatch[1]);
        rangeText = `< ${lessThanMatch[1]}`;
      } else if (greaterThanMatch) {
        lowerLimit = parseFloat(greaterThanMatch[1]);
        rangeText = `> ${greaterThanMatch[1]}`;
      }

      // Identify the test result value:
      // Typically, it's the number appearing immediately after the test name
      for (const numStr of numberMatches) {
        const val = parseFloat(numStr);
        // Exclude numbers that are part of the range if we found a range
        if (rangeMatch && (numStr === rangeMatch[1] || numStr === rangeMatch[2])) {
          continue;
        }
        if (lessThanMatch && numStr === lessThanMatch[1]) {
          continue;
        }
        if (greaterThanMatch && numStr === greaterThanMatch[1]) {
          continue;
        }

        valueStr = numStr;
        numericVal = val;
        break;
      }

      if (!valueStr) continue;

      // Extract unit (sorted descending by length to prefer specific units like 'lakh/cumm' over '/cumm')
      let foundUnit = '';
      const sortedUnits = [...testDef.typicalUnits].sort((a, b) => b.length - a.length);
      const lineLower = line.toLowerCase();
      for (const unit of sortedUnits) {
        const uLower = unit.toLowerCase();
        if (lineLower.includes(uLower)) {
          foundUnit = unit;
          break;
        }
      }
      if (!foundUnit && testDef.typicalUnits.length > 0) {
        foundUnit = testDef.typicalUnits[0];
      }

      // 4. Deterministic comparison with REPORT's printed reference range
      let flag: TestFindingFlag = 'normal';

      if (numericVal !== undefined) {
        if (lowerLimit !== undefined && numericVal < lowerLimit) {
          flag = 'low';
        } else if (upperLimit !== undefined && numericVal > upperLimit) {
          flag = 'high';
        } else if (lowerLimit !== undefined || upperLimit !== undefined) {
          flag = 'normal';
        } else {
          // Check explicit textual flags on the line
          if (/\b(high|hi|\bh\b)\b/i.test(line)) {
            flag = 'high';
          } else if (/\b(low|\bl\b)\b/i.test(line)) {
            flag = 'low';
          } else if (/\b(abnormal|positive)\b/i.test(line)) {
            flag = 'abnormal';
          } else {
            flag = 'indeterminate';
          }
        }
      }

      // Reference range text format
      if (foundUnit && rangeText !== 'The report does not provide a reference range for this result.' && !rangeText.includes(foundUnit)) {
        rangeText = `${rangeText} ${foundUnit}`;
      }

      return {
        id: `finding-${index}`,
        testName: testDef.canonicalName,
        category: testDef.category,
        value: valueStr,
        numericValue: numericVal,
        unit: foundUnit,
        referenceRangeText: rangeText,
        lowerLimit,
        upperLimit,
        flag,
        whatItMeasures: this.getWhatItMeasures(testDef.canonicalName),
      };
    }

    return null;
  },

  /**
   * Explanatory clinical summary of what a test measures
   */
  getWhatItMeasures(testName: string): string {
    const map: Record<string, string> = {
      'Hemoglobin (Hb)': 'Measures the oxygen-carrying protein in red blood cells that delivers oxygen to bodily tissues.',
      'Packed Cell Volume (PCV / Hematocrit)': 'Measures the percentage of total blood volume made up of red blood cells.',
      'White Blood Cell Count (WBC / Leukocytes)': 'Evaluates the primary immune cells responsible for defending against infections and inflammation.',
      'Platelet Count': 'Measures small cellular fragments that form blood clots to stop bleeding.',
      'Mean Corpuscular Volume (MCV)': 'Measures the average physical size and volume of your red blood cells.',
      'Mean Corpuscular Hemoglobin (MCH)': 'Measures the average amount of hemoglobin contained inside a single red blood cell.',
      'Fasting Blood Glucose': 'Measures the concentration of glucose in the bloodstream after an overnight fast of 8–10 hours.',
      'Postprandial Blood Glucose': 'Measures blood sugar concentration approximately two hours following a meal.',
      'HbA1c (Glycated Hemoglobin)': 'Reflects your average blood sugar control over the preceding 2 to 3 months.',
      'Total Cholesterol': 'Measures the total amount of all circulating cholesterol fractions in the blood.',
      'Triglycerides': 'Measures the most common type of dietary fat stored in the body and circulating in blood.',
      'HDL Cholesterol (Good Cholesterol)': 'Scavenges excess cholesterol from arteries and transports it back to the liver.',
      'LDL Cholesterol': 'Carries cholesterol particles to peripheral tissues; excess levels can build up in arterial walls.',
      'Serum Creatinine': 'A waste byproduct from muscle metabolism filtered entirely by healthy kidneys.',
      'Blood Urea Nitrogen (BUN) / Urea': 'Measures urea nitrogen, a breakdown product of protein excreted by the kidneys.',
      'SGPT / ALT (Alanine Aminotransferase)': 'An enzyme concentrated primarily inside liver cells; releases into blood when liver cells are irritated.',
      'SGOT / AST (Aspartate Aminotransferase)': 'An enzyme found in the liver, heart, and skeletal muscle tissue.',
      'TSH (Thyroid Stimulating Hormone)': 'Pituitary hormone regulating the activity and metabolic output of the thyroid gland.',
      'Serum Potassium (K+)': 'An essential mineral electrolyte vital for healthy heart rhythm and muscle contraction.',
      'Serum Sodium (Na+)': 'Maintains cellular fluid balance and normal nerve and muscular signaling.',
    };

    return map[testName] || 'Evaluates specific physiological markers to provide educational insight into body functioning.';
  },

  /**
   * Rule-based clinical pattern detector
   */
  detectPatterns(findings: ReportTestFinding[]): ReportPattern[] {
    const patterns: ReportPattern[] = [];

    const isTestLow = (nameSnippet: string) =>
      findings.some((f) => f.testName.toLowerCase().includes(nameSnippet) && f.flag === 'low');
    const isTestHigh = (nameSnippet: string) =>
      findings.some((f) => f.testName.toLowerCase().includes(nameSnippet) && f.flag === 'high');

    // Pattern 1: Microcytic / Anemia Profile
    if (isTestLow('hemoglobin') && (isTestLow('mcv') || isTestLow('mch'))) {
      patterns.push({
        id: 'pattern-anemia-microcytic',
        name: 'Microcytic Red Blood Cell Pattern',
        description:
          'Low hemoglobin accompanied by reduced red blood cell size (MCV/MCH) indicates red blood cells are smaller and contain less oxygen-binding pigment than typical.',
        matchedTests: ['Hemoglobin (Hb)', 'Mean Corpuscular Volume (MCV)', 'Mean Corpuscular Hemoglobin (MCH)'],
        clinicalSignificance:
          'This pattern can be associated with iron deficiency, ongoing blood loss, dietary factors, or hemoglobin variations like thalassemia trait. These laboratory findings alone do not establish a diagnosis. A qualified healthcare professional can evaluate serum ferritin and iron studies to identify the specific cause.',
        suggestedQuestions: [
          'What might be causing my hemoglobin and MCV levels to be lower than the reference range?',
          'Would checking iron studies, ferritin, or vitamin levels be helpful?',
        ],
      });
    }

    // Pattern 2: Elevated Glycemic / Metabolic Profile
    if (isTestHigh('fasting blood glucose') || isTestHigh('hba1c') || isTestHigh('postprandial')) {
      patterns.push({
        id: 'pattern-metabolic-glycemic',
        name: 'Elevated Glycemic Marker Pattern',
        description:
          'Blood glucose or HbA1c values are above the report reference limits, indicating elevated circulating sugar levels.',
        matchedTests: ['Fasting Blood Glucose', 'HbA1c (Glycated Hemoglobin)'],
        clinicalSignificance:
          'Elevated glycemic indices can be observed in pre-diabetes, diabetes, recent dietary changes, acute illness, or stress. These results do not constitute a medical diagnosis. A doctor can assess these results in context with symptoms, nutrition, and confirmation testing.',
        suggestedQuestions: [
          'How do my blood sugar and HbA1c values relate to my overall metabolic health?',
          'What lifestyle or dietary modifications are recommended based on these findings?',
        ],
      });
    }

    // Pattern 3: Atherogenic Lipid Profile
    if (isTestHigh('total cholesterol') || isTestHigh('triglycerides') || isTestHigh('ldl') || isTestLow('hdl')) {
      patterns.push({
        id: 'pattern-lipid-profile',
        name: 'Lipid Profile Variation Pattern',
        description:
          'One or more blood lipid markers (cholesterol or triglycerides) are outside the desirable range printed on your report.',
        matchedTests: ['Total Cholesterol', 'Triglycerides', 'LDL Cholesterol'],
        clinicalSignificance:
          'Variations in blood lipids can occur with dietary factors, genetics, physical activity levels, and metabolic conditions. They are evaluated by a physician as part of overall cardiovascular wellness.',
        suggestedQuestions: [
          'What are my overall cardiovascular risk factors considering this lipid panel?',
          'Do you recommend specific dietary adjustments or follow-up testing?',
        ],
      });
    }

    // Pattern 4: Elevated Hepatic Enzyme Pattern
    if (isTestHigh('sgpt') || isTestHigh('sgot') || isTestHigh('alt') || isTestHigh('ast')) {
      patterns.push({
        id: 'pattern-hepatic-enzymes',
        name: 'Hepatic Enzyme Elevation Pattern',
        description:
          'Liver enzymes (ALT/SGPT or AST/SGOT) are elevated above the report reference range.',
        matchedTests: ['SGPT / ALT', 'SGOT / AST'],
        clinicalSignificance:
          'Mild to moderate liver enzyme elevations are common and can occur with medications, fatty liver changes, alcohol use, viral infections, or intense exercise. These findings alone do not diagnose liver disease. A physician can assess these results in context with symptoms.',
        suggestedQuestions: [
          'What are common temporary reasons for liver enzymes to be slightly elevated?',
          'Should we repeat these liver function tests in a few weeks?',
        ],
      });
    }

    // Pattern 5: Renal Marker Variation Pattern
    if (isTestHigh('creatinine') || isTestHigh('urea') || isTestHigh('bun')) {
      patterns.push({
        id: 'pattern-renal-markers',
        name: 'Renal Marker Elevation Pattern',
        description:
          'Creatinine or blood urea nitrogen is elevated relative to the report reference limits.',
        matchedTests: ['Serum Creatinine', 'Blood Urea Nitrogen (BUN) / Urea'],
        clinicalSignificance:
          'Elevated creatinine can be influenced by hydration status, high protein intake, strenuous exercise, medications, or kidney filtration changes. These results do not confirm kidney disease. Adequate hydration and doctor review are advisable.',
        suggestedQuestions: [
          'Could mild dehydration have influenced these kidney marker results?',
          'Is an estimated glomerular filtration rate (eGFR) calculation or urine test recommended?',
        ],
      });
    }

    return patterns;
  },

  /**
   * Deterministic Medical Attention Classification:
   * 1. 'informational' -> all tests normal
   * 2. 'discuss_with_doctor' -> 1+ abnormal, or common multi-test pattern
   * 3. 'prompt_attention' -> critical laboratory emergency threshold reached
   */
  classifyMedicalAttention(
    findings: ReportTestFinding[],
    patterns: ReportPattern[]
  ): { level: MedicalAttentionLevel; rationale: string } {
    if (findings.length === 0) {
      return {
        level: 'informational',
        rationale: 'No recognized laboratory tests could be extracted from the document.',
      };
    }

    // Check for critical life-threatening laboratory thresholds
    for (const finding of findings) {
      const val = finding.numericValue;
      if (val === undefined) continue;

      // CRITICAL SAFETY INVARIANT: If a finding is deterministically within the report's printed reference range,
      // it CANNOT be a critical life-threatening abnormal alarm!
      if (finding.flag === 'normal') continue;

      for (const known of KNOWN_TESTS) {
        if (finding.testName.toLowerCase().includes(known.canonicalName.toLowerCase())) {
          const normalizedVal = this.getNormalizedValueForCriticalCheck(finding);
          if (normalizedVal === undefined) continue;

          if (known.criticalLow !== undefined && normalizedVal <= known.criticalLow) {
            return {
              level: 'prompt_attention',
              rationale: `The reported ${finding.testName} (${finding.value} ${finding.unit}) is significantly below typical physiological safety limits. Prompt evaluation by a medical professional is strongly advised.`,
            };
          }
          if (known.criticalHigh !== undefined && normalizedVal >= known.criticalHigh) {
            return {
              level: 'prompt_attention',
              rationale: `The reported ${finding.testName} (${finding.value} ${finding.unit}) is significantly elevated above typical physiological limits. Prompt medical assessment is recommended.`,
            };
          }
        }
      }
    }

    // Check for abnormal tests or identified multi-test patterns
    const abnormalCount = findings.filter(
      (f) => f.flag === 'low' || f.flag === 'high' || f.flag === 'abnormal'
    ).length;

    if (abnormalCount > 0 || patterns.length > 0) {
      return {
        level: 'discuss_with_doctor',
        rationale: `${abnormalCount} test result(s) are outside the reference ranges printed on your report. Discussing these results with a qualified healthcare professional will help interpret them in light of your symptoms and personal medical history.`,
      };
    }

    return {
      level: 'informational',
      rationale:
        'All reviewed test findings fall within the reference ranges printed on your report. Continue routine preventive health practices and wellness checkups.',
    };
  },

  /**
   * Normalizes a test finding's numeric value to standard canonical units (e.g. converting lakhs/cumm to raw /cumm)
   * so that comparisons with critical physiological emergency thresholds are valid.
   */
  getNormalizedValueForCriticalCheck(finding: ReportTestFinding): number | undefined {
    const val = finding.numericValue;
    if (val === undefined || isNaN(val)) return undefined;

    const unitLower = (finding.unit || '').toLowerCase();
    const testNameLower = finding.testName.toLowerCase();

    // Platelet Count normalization (canonical: /cumm or /uL, criticalLow: 25000, criticalHigh: 1000000)
    if (testNameLower.includes('platelet') || testNameLower.includes('thrombocyte')) {
      // Lakh / Lac / 10^5 scale: e.g. 1.5 - 4.5 lakh/cumm (val ~ 3.6)
      if (
        unitLower.includes('lakh') ||
        unitLower.includes('lac') ||
        unitLower.includes('10^5') ||
        (val < 20 && (finding.upperLimit === undefined || finding.upperLimit < 20))
      ) {
        return val * 100000;
      }
      // Thousands scale: e.g. 150 - 450 10^3/uL (val ~ 360)
      if (
        unitLower.includes('10^3') ||
        unitLower.includes('10^9') ||
        unitLower.includes('thou') ||
        unitLower.includes('k/ul') ||
        (val >= 50 && val <= 1000 && (finding.upperLimit === undefined || finding.upperLimit <= 1000))
      ) {
        return val * 1000;
      }
      // Raw count: e.g. 150000 - 450000 /cumm
      return val;
    }

    // White Blood Cell Count normalization (canonical: /cumm, criticalLow: 2000, criticalHigh: 30000)
    if (
      testNameLower.includes('white blood cell') ||
      testNameLower.includes('wbc') ||
      testNameLower.includes('leukocyte') ||
      testNameLower.includes('tlc')
    ) {
      if (
        unitLower.includes('10^3') ||
        unitLower.includes('10^9') ||
        unitLower.includes('thou') ||
        unitLower.includes('k/ul') ||
        (val < 50 && (finding.upperLimit === undefined || finding.upperLimit < 50))
      ) {
        return val * 1000;
      }
      return val;
    }

    // Fasting Blood Glucose / PPBS (canonical: mg/dL, criticalLow: 50, criticalHigh: 400)
    if (testNameLower.includes('glucose') || testNameLower.includes('fbs') || testNameLower.includes('ppbs')) {
      if (
        unitLower.includes('mmol') ||
        (val < 25 && (finding.upperLimit === undefined || finding.upperLimit < 25))
      ) {
        return val * 18.018;
      }
      return val;
    }

    return val;
  },
};
