/**
 * HealthWise AI — Report AI Service (Phase 18 Final Fix)
 *
 * Connects structured findings, reference range evaluations, and identified patterns
 * to Puter.js AI and RAG knowledge retrieval for educational synthesis.
 *
 * INVARIANTS:
 * 1. ZERO DIAGNOSIS: Never asserts "You have disease X". Always uses educational association phrasing:
 *    "This finding can be associated with...", "Your doctor can interpret this in the context of your symptoms."
 * 2. ZERO PRESCRIPTION: Never prescribes drugs or dosages.
 * 3. EXPLAIN WHAT IT MEANS: Explains what the test measures and what outside-range values mean.
 * 4. MULTILINGUAL: Dynamically synthesizes in user-selected language (English, Telugu, Hindi).
 * 5. NO TEXT TRUNCATION: Executive summary completes full thoughts without arbitrary character slices.
 * 6. SESSION-ONLY: In-memory processing; does not write to persistent storage.
 */

import { ReportTestFinding, ReportPattern, MedicalAttentionLevel } from '../../types/report';
import { puterAIService } from '../ai/puter-ai-service';

export interface ReportAISummaryResult {
  executiveSummary: string;
  doctorQuestions: string[];
  findingsExplanations: Record<string, string>;
}

export const reportAIService = {
  /**
   * Generate educational summary and explanations for report findings in target language
   */
  async generateReportExplanation(
    findings: ReportTestFinding[],
    patterns: ReportPattern[],
    attentionLevel: MedicalAttentionLevel,
    fileName: string,
    targetLanguage: string = 'en'
  ): Promise<ReportAISummaryResult> {
    const totalTests = findings.length;
    const abnormalFindings = findings.filter(
      (f) => f.flag === 'low' || f.flag === 'high' || f.flag === 'abnormal'
    );
    const withinRangeCount = totalTests - abnormalFindings.length;

    // Build structured finding digest for AI context
    const findingsDigest = findings
      .map(
        (f) =>
          `- ${f.testName}: ${f.value} ${f.unit} (Report Range: ${f.referenceRangeText}) -> Status: ${f.flag.toUpperCase()}`
      )
      .join('\n');

    const patternsDigest =
      patterns.length > 0
        ? patterns.map((p) => `- ${p.name}: ${p.description}`).join('\n')
        : 'None detected.';

    // Multilingual directive
    const languageDirectives: Record<string, string> = {
      en: 'Respond in clear, simple everyday English suitable for a general audience.',
      te: 'IMPORTANT: Respond ENTIRELY in Telugu (తెలుగు). Translate all explanations, summary, and doctor questions into natural, empathetic Telugu. Do NOT use English in the explanation.',
      hi: 'IMPORTANT: Respond ENTIRELY in Hindi (हिन्दी). Translate all explanations, summary, and doctor questions into clear, accessible Hindi. Do NOT use English in the explanation.',
    };
    const langDirective = languageDirectives[targetLanguage] || languageDirectives.en;

    // Generate educational prompt
    const prompt = `You are HealthWise AI, a compassionate and educational health assistant. Explain the following laboratory findings to the user in simple, human-understandable terms.

REPORT DETAILS:
File: "${fileName}"
Total Tests Extracted: ${totalTests}
Within Reported Range: ${withinRangeCount}
Outside Reported Range: ${abnormalFindings.length}
Determined Medical Attention Level: ${attentionLevel.toUpperCase()}
Target Language: ${targetLanguage.toUpperCase()}

STRUCTURED FINDINGS:
${findingsDigest}

DETECTED PATTERNS:
${patternsDigest}

CRITICAL RULES:
1. LANGUAGE DIRECTIVE: ${langDirective}
2. DO NOT DIAGNOSE. Never tell the user they "have" a disease (e.g. do NOT say "you have anemia"). Use educational association phrasing such as "This pattern can be associated with...", "Values outside the range may occur with...", or "These findings warrant a discussion with your doctor."
3. DO NOT PRESCRIBE medications, treatments, or dosages.
4. PREFER the printed reference range on the report.
5. Keep the executive summary concise (80–150 words). Provide complete, well-formed sentences without truncation.
6. Provide 3 thoughtful questions the user can ask their doctor.
7. Clearly distinguish between "outside the reference range" and "an emergency" — an abnormal result does NOT automatically equal danger.`;

    try {
      // Check if Puter AI is available or mock
      const isAvailable = puterAIService.isPuterAvailable();
      let rawAiResponse = '';

      if (isAvailable && window.puter?.ai?.chat) {
        const chatRes = await window.puter.ai.chat(prompt, {
          model: import.meta.env.VITE_PUTER_AI_MODEL || 'gpt-4o-mini',
          temperature: 0.3,
        });
        rawAiResponse = chatRes?.message?.content || '';
      }

      if (!rawAiResponse || rawAiResponse.trim().length === 0) {
        // Safe deterministic fallback synthesis if Puter AI offline
        return this.generateFallbackSummary(findings, patterns, attentionLevel, targetLanguage);
      }

      // Extract summary & questions
      const doctorQuestions = this.extractDoctorQuestions(
        rawAiResponse,
        patterns,
        abnormalFindings,
        targetLanguage
      );

      // Clean executive summary (NO character slicing, complete thoughts)
      let executiveSummary = rawAiResponse.trim();
      const questionsIndex = executiveSummary.search(/(?:Questions to ask|Questions for your doctor|ప్రశ్నలు|प्रश्न)/i);
      if (questionsIndex > 100) {
        executiveSummary = executiveSummary.substring(0, questionsIndex).trim();
      }

      return {
        executiveSummary,
        doctorQuestions,
        findingsExplanations: this.buildIndividualExplanations(findings, targetLanguage),
      };
    } catch (err) {
      console.warn('[ReportAIService] AI generation failed, using fallback synthesis:', err);
      return this.generateFallbackSummary(findings, patterns, attentionLevel, targetLanguage);
    }
  },

  /**
   * Deterministic educational summary fallback localized in en, te, and hi
   */
  generateFallbackSummary(
    findings: ReportTestFinding[],
    patterns: ReportPattern[],
    attentionLevel: MedicalAttentionLevel,
    targetLanguage: string = 'en'
  ): ReportAISummaryResult {
    const total = findings.length;
    const abnormal = findings.filter(
      (f) => f.flag === 'low' || f.flag === 'high' || f.flag === 'abnormal'
    );
    const normalCount = total - abnormal.length;

    let summary = '';
    let doctorQuestions: string[] = [];

    if (targetLanguage === 'te') {
      if (abnormal.length === 0) {
        summary = `మీ నివేదికలో ${total} ఫలితాలు సమీక్షించబడ్డాయి. అన్ని ఫలితాలు నివేదికలో ముద్రించిన రిఫరెన్స్ పరిధులలోనే ఉన్నాయి. ఇది ఆరోగ్యకరమైన సాధారణ స్థితిని సూచిస్తుంది. సాధారణ ఆరోగ్య సంరక్షణ పద్ధతులు మరియు సమతుల్య ఆహారాన్ని కొనసాగించండి.`;
      } else {
        const abnormalNames = abnormal.map((a) => `${a.testName} (${a.flag})`).join(', ');
        summary = `మీ నివేదికలో ${total} పరీక్షలు సమీక్షించబడ్డాయి: ${normalCount} సాధారణ పరిధిలో ఉన్నాయి, మరియు ${abnormal.length} పరిధి వెలుపల ఉన్నాయి (${abnormalNames}). ల్యాబ్ విలువ సాధారణ పరిధి వెలుపల ఉండటం వలన అది అత్యవసర పరిస్థితి లేదా నిర్దిష్ట వ్యాధి అని కాదు—ఆహారం, నీటి స్థాయి మరియు శారీరక శ్రమ వంటి తాత్కాలిక అంశాలు కూడా ఫలితాలను ప్రభావితం చేయవచ్చు. ఈ ఫలితాలపై మీ వైద్యుడితో చర్చించడం ద్వారా స్పష్టత పొందవచ్చు.`;
      }
      doctorQuestions = [
        'నా పరీక్ష ఫలితాలపై ఏ జీవనశైలి లేదా ఆహారపు అలవాట్లు ప్రభావం చూపుతాయి?',
        'కొన్ని వారాల తర్వాత ఈ పరీక్షలను మళ్లీ చేయించుకోవడం మంచిదా?',
        'నా ప్రస్తుత ఆరోగ్య లక్షణాలకు ఈ నివేదిక ఫలితాలు సరిపోలుతున్నాయా?',
      ];
    } else if (targetLanguage === 'hi') {
      if (abnormal.length === 0) {
        summary = `आपकी रिपोर्ट में ${total} परीक्षण परिणाम शामिल हैं। सभी परिणाम रिपोर्ट में दी गई सामान्य संदर्भ सीमाओं के भीतर हैं। यह एक स्वस्थ स्थिति का संकेत है। नियमित स्वास्थ्य आदतों को जारी रखें।`;
      } else {
        const abnormalNames = abnormal.map((a) => `${a.testName} (${a.flag})`).join(', ');
        summary = `आपकी रिपोर्ट में ${total} परीक्षण परिणाम हैं: ${normalCount} सामान्य सीमा में हैं, और ${abnormal.length} सीमा से बाहर हैं (${abnormalNames})। सामान्य सीमा से बाहर होना किसी आपातकाल या गंभीर बीमारी का निश्चित संकेत नहीं है—आहार, पानी की मात्रा और तनाव भी परिणामों को प्रभावित कर सकते हैं। अपने डॉक्टर से इन परिणामों पर चर्चा करना उचित होगा।`;
      }
      doctorQuestions = [
        'क्या मेरी जीवनशैली या आहार इन परीक्षण परिणामों को प्रभावित कर रहे हैं?',
        'क्या कुछ हफ्तों बाद इन परीक्षणों को दोबारा दोहराना आवश्यक है?',
        'क्या मेरे लक्षण इन रिपोर्ट परिणामों से मेल खाते हैं?',
      ];
    } else {
      // English
      if (abnormal.length === 0) {
        summary = `Your report contains ${total} reviewed result${total === 1 ? '' : 's'}. All findings fall within the reference ranges printed on your report. This generally suggests healthy baseline parameters for these specific markers. Continue standard wellness practices and routine health maintenance.`;
      } else {
        const abnormalNames = abnormal.map((a) => `${a.testName} (${a.flag})`).join(', ');
        summary = `Your report contains ${total} reviewed results: ${normalCount} within the reference ranges printed on the report, and ${abnormal.length} outside those ranges (${abnormalNames}). An abnormal lab value does not automatically indicate an emergency or specific illness—temporary factors like diet, hydration, and physical exertion can influence numbers. Discussing these findings with a qualified healthcare professional will help interpret them in the context of your overall health.`;
      }
      doctorQuestions = [
        'What lifestyle or dietary factors might be influencing my test results?',
        'Would it be beneficial to re-check these specific markers in a few weeks or months?',
        'Do my symptoms or personal health history align with these report findings?',
      ];
    }

    if (patterns.length > 0 && targetLanguage === 'en') {
      doctorQuestions.unshift(...patterns[0].suggestedQuestions);
    }

    return {
      executiveSummary: summary,
      doctorQuestions: Array.from(new Set(doctorQuestions)).slice(0, 4),
      findingsExplanations: this.buildIndividualExplanations(findings, targetLanguage),
    };
  },

  /**
   * Explanations for individual test items in user's selected language
   */
  buildIndividualExplanations(
    findings: ReportTestFinding[],
    targetLanguage: string = 'en'
  ): Record<string, string> {
    const explanations: Record<string, string> = {};

    for (const f of findings) {
      if (targetLanguage === 'te') {
        if (f.flag === 'normal') {
          explanations[f.id] = `ఈ ఫలితం మీ ప్రయోగశాల అందించిన రిఫరెన్స్ పరిధిలో (${f.referenceRangeText}) ఉంది.`;
        } else if (f.flag === 'low') {
          explanations[f.id] = `ఈ ఫలితం నివేదికలోని రిఫరెన్స్ పరిధి (${f.referenceRangeText}) కంటే తక్కువగా ఉంది. తక్కువ విలువలు ఆహారపు అలవాట్లు, హైడ్రేషన్ లేదా తాత్కాలిక శారీరక మార్పుల వల్ల సంభవించవచ్చు.`;
        } else if (f.flag === 'high') {
          explanations[f.id] = `ఈ ఫలితం నివేదికలోని రిఫరెన్స్ పరిధి (${f.referenceRangeText}) కంటే ఎక్కువగా ఉంది. పెరిగిన మార్కర్లు మంట, ఒత్తిడి లేదా సమీప భోజనం వల్ల సంభవించవచ్చు. వైద్యుడిని సంప్రదించండి.`;
        } else {
          explanations[f.id] = `ఈ ఫలితం రిఫరెన్స్ సమాచారానికి సంబంధించి ప్రత్యేక పరిశీలన అవసరం. వైద్య నిపుణుడిని సంప్రదించండి.`;
        }
      } else if (targetLanguage === 'hi') {
        if (f.flag === 'normal') {
          explanations[f.id] = `यह परिणाम आपकी प्रयोगशाला द्वारा दी गई संदर्भ सीमा (${f.referenceRangeText}) के भीतर है।`;
        } else if (f.flag === 'low') {
          explanations[f.id] = `यह परिणाम रिपोर्ट में दी गई संदर्भ सीमा (${f.referenceRangeText}) से कम है। पोषण, जलयोजन या दवाओं के प्रभाव से यह कम हो सकता है।`;
        } else if (f.flag === 'high') {
          explanations[f.id] = `यह परिणाम संदर्भ सीमा (${f.referenceRangeText}) से अधिक है। सूजन, हालिया भोजन या शारीरिक तनाव से स्तर बढ़ सकता है। डॉक्टर से परामर्श करें।`;
        } else {
          explanations[f.id] = `इस परिणाम को समझने के लिए स्वास्थ्य विशेषज्ञ से परामर्श लेना उचित रहेगा।`;
        }
      } else {
        // English
        if (f.flag === 'normal') {
          explanations[f.id] = `This result is within the reference range (${f.referenceRangeText}) reported by your laboratory.`;
        } else if (f.flag === 'low') {
          explanations[f.id] = `This result is below the reference range (${f.referenceRangeText}) printed on your report. Low values can be influenced by nutritional factors, hydration, medication, or temporary physiological states.`;
        } else if (f.flag === 'high') {
          explanations[f.id] = `This result is above the reference range (${f.referenceRangeText}) printed on your report. Elevated markers can occur in response to inflammation, recent meals, stress, or underlying conditions warranting medical review.`;
        } else {
          explanations[f.id] = `This result has an unusual or indeterminate flag relative to the report's reference information. Consult a healthcare provider for clarification.`;
        }
      }
    }

    return explanations;
  },

  /**
   * Helper to parse doctor questions from AI response
   */
  extractDoctorQuestions(
    aiText: string,
    patterns: ReportPattern[],
    abnormalFindings: ReportTestFinding[],
    targetLanguage: string = 'en'
  ): string[] {
    const questions: string[] = [];

    // Extract questions from AI text
    const lines = aiText.split('\n');
    for (const line of lines) {
      if ((line.includes('?') || line.includes('?')) && (line.startsWith('-') || line.match(/^\d+\./))) {
        const cleanQ = line.replace(/^[-*0-9.]+\s*/, '').trim();
        if (cleanQ.length > 10) {
          questions.push(cleanQ);
        }
      }
    }

    // Append pattern questions if needed and English
    if (questions.length < 3 && patterns.length > 0 && targetLanguage === 'en') {
      for (const p of patterns) {
        questions.push(...p.suggestedQuestions);
      }
    }

    // Default questions if still under 3
    if (questions.length < 3) {
      if (targetLanguage === 'te') {
        questions.push('నా పరీక్ష ఫలితాలపై ఏ జీవనశైలి లేదా ఆహారపు అలవాట్లు ప్రభావం చూపుతాయి?');
        questions.push('కొన్ని వారాల తర్వాత ఈ పరీక్షలను మళ్లీ చేయించుకోవడం మంచిదా?');
        questions.push('నా ప్రస్తుత ఆరోగ్య లక్షణాలకు ఈ నివేదిక ఫలితాలు సరిపోలుతున్నాయా?');
      } else if (targetLanguage === 'hi') {
        questions.push('क्या मेरी जीवनशैली या आहार इन परीक्षण परिणामों को प्रभावित कर रहे हैं?');
        questions.push('क्या कुछ हफ्तों बाद इन परीक्षणों को दोबारा दोहराना आवश्यक है?');
        questions.push('क्या मेरे लक्षण इन रिपोर्ट परिणामों से मेल खाते हैं?');
      } else {
        questions.push('What could be contributing to the results that are outside the normal range?');
        questions.push('Are there any lifestyle or nutritional changes you would recommend based on this report?');
        questions.push('Should any of these laboratory tests be repeated in the near future?');
      }
    }

    return Array.from(new Set(questions)).slice(0, 4);
  },
};
