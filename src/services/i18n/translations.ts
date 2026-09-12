/**
 * HealthWise AI — Multilingual Translations Dictionary
 * Supported Languages:
 * - English ('en')
 * - Telugu ('te') — తెలుగు
 * - Hindi ('hi') — हिन्दी
 */

export type SupportedLanguageCode = 'en' | 'te' | 'hi';

export interface TranslationDictionary {
  nav: {
    home: string;
    chat: string;
    diseases: string;
    prevention: string;
    vaccination: string;
    healthyHabits: string;
    resources: string;
    bookmarks: string;
    about: string;
    dashboard: string;
    profile: string;
    admin: string;
    signIn: string;
    signOut: string;
    selectLanguage: string;
    appTitle: string;
    appSubtitle: string;
  };
  chat: {
    title: string;
    evidenceGrounded: string;
    newChat: string;
    startTitle: string;
    startDesc: string;
    placeholder: string;
    send: string;
    disclaimer: string;
    analyzing: string;
    emergencyAlertTitle: string;
    sources: string;
    askAI: string;
    emergencyHotlines: string;
  };
  diseases: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterBy: string;
    all: string;
    keySigns: string;
    readGuide: string;
    askAI: string;
    whoGrounded: string;
    noResults: string;
    noResultsDesc: string;
  };
  diseaseDetail: {
    back: string;
    bookmark: string;
    bookmarked: string;
    share: string;
    linkCopied: string;
    askAI: string;
    reviewed: string;
    symptomsTitle: string;
    symptomsSubtitle: string;
    warningSignsTitle: string;
    warningSignsSubtitle: string;
    riskFactorsTitle: string;
    riskFactorsSubtitle: string;
    preventionTitle: string;
    preventionSubtitle: string;
    whenToSeekCareTitle: string;
    ctaTitle: string;
    ctaDesc: string;
    startConversation: string;
    relatedTitle: string;
  };
  resources: {
    badge: string;
    title: string;
    subtitle: string;
    emergencySectionTitle: string;
    emergencySectionDesc: string;
    callNow: string;
    portalsTitle: string;
    portalsSubtitle: string;
    searchPlaceholder: string;
    visit: string;
    verified: string;
  };
  bookmarks: {
    title: string;
    subtitle: string;
    all: string;
    diseases: string;
    external: string;
    emptyTitle: string;
    emptyDesc: string;
    browseBtn: string;
    readGuide: string;
    visitResource: string;
    savedOn: string;
    guestNotice: string;
    signInLink: string;
  };
  safety: {
    mandatoryDisclaimer: string;
    emergencyEscalationTitle: string;
    emergencyEscalationMessage: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroDesc: string;
    startChat: string;
    exploreDiseases: string;
    whoCdcGrounded: string;
    zeroHallucination: string;
    strictSafety: string;
    assistantTitle: string;
    evidenceGrounded: string;
    demoUserQuery: string;
    demoAiResponse: string;
    demoRedFlag: string;
    demoSource: string;
    educationalOnly: string;
    tryAsking: string;
    ctaBadge: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaChatBtn: string;
    ctaDiseasesBtn: string;
    ctaDisclaimer: string;

    // Platform Capabilities
    capBadge: string;
    capTitle: string;
    capDesc: string;
    capDiseaseEduTitle: string;
    capDiseaseEduDesc: string;
    capSymptomsTitle: string;
    capSymptomsDesc: string;
    capPreventionTitle: string;
    capPreventionDesc: string;
    capVaccineTitle: string;
    capVaccineDesc: string;
    capNutritionTitle: string;
    capNutritionDesc: string;
    capEmergencyTitle: string;
    capEmergencyDesc: string;
    capStandard: string;

    // Supported Topics
    topicsBadge: string;
    topicsTitle: string;
    topicsDesc: string;
    topicsViewAll: string;
    topicDengueName: string;
    topicDengueCategory: string;
    topicDengueDesc: string;
    topicDengueBadge: string;
    topicDiabetesName: string;
    topicDiabetesCategory: string;
    topicDiabetesDesc: string;
    topicDiabetesBadge: string;
    topicHypertensionName: string;
    topicHypertensionCategory: string;
    topicHypertensionDesc: string;
    topicHypertensionBadge: string;
    topicInfluenzaName: string;
    topicInfluenzaCategory: string;
    topicInfluenzaDesc: string;
    topicInfluenzaBadge: string;
    topicHygieneName: string;
    topicHygieneCategory: string;
    topicHygieneDesc: string;
    topicHygieneBadge: string;
    topicVaccineName: string;
    topicVaccineCategory: string;
    topicVaccineDesc: string;
    topicVaccineBadge: string;
    topicReadGuide: string;

    // How It Works
    howBadge: string;
    howTitle: string;
    howDesc: string;
    howStep1Title: string;
    howStep1Desc: string;
    howStep2Title: string;
    howStep2Desc: string;
    howStep3Title: string;
    howStep3Desc: string;
    howStep4Title: string;
    howStep4Desc: string;
    howStep5Title: string;
    howStep5Desc: string;
    howVerifiedStep: string;

    // Trusted Sources
    sourcesBadge: string;
    sourcesTitle: string;
    sourcesDesc: string;
    sourceWhoType: string;
    sourceWhoDesc: string;
    sourceWhoCoverage: string;
    sourceCdcType: string;
    sourceCdcDesc: string;
    sourceCdcCoverage: string;
    sourceMohfwType: string;
    sourceMohfwDesc: string;
    sourceMohfwCoverage: string;
    sourceNhsType: string;
    sourceNhsDesc: string;
    sourceNhsCoverage: string;
    sourceCuratedAreas: string;
    sourceAudited: string;
    sourceVisitPortal: string;

    // Multilingual Showcase
    multiBadge: string;
    multiTitle: string;
    multiDesc: string;
    multiPointEn: string;
    multiPointTe: string;
    multiPointHi: string;
    multiTryChat: string;

    // FAQ Section
    faqBadge: string;
    faqTitle: string;
    faqDesc: string;
    faqQ1: string;
    faqA1: string;
    faqQ2: string;
    faqA2: string;
    faqQ3: string;
    faqA3: string;
    faqQ4: string;
    faqA4: string;
    faqQ5: string;
    faqA5: string;
    faqQ6: string;
    faqA6: string;
  };
  footer: {
    emergencyWarningTitle: string;
    emergencyWarningText: string;
    emergencyContactsBtn: string;
    brandDesc: string;
    evidenceBasedEducation: string;
    exploreHealth: string;
    trustedSources: string;
    platformSafety: string;
    aiChatbot: string;
    diseaseExplorer: string;
    preventionGuides: string;
    vaccinationSchedules: string;
    healthyHabits: string;
    verifiedDirectory: string;
    aboutProject: string;
    privacyPolicy: string;
    termsOfService: string;
    safetyAuditLogs: string;
    allRightsReserved: string;
    disclaimer: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    signUpTitle: string;
    signUpSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    signInBtn: string;
    signUpBtn: string;
    oneClickTest: string;
    signInAsUser: string;
    signInAsAdmin: string;
    noAccount: string;
    hasAccount: string;
    createOne: string;
    signInInstead: string;
  };
  admin: {
    dashboard: string;
    knowledgeBase: string;
    sources: string;
    contentReview: string;
    analytics: string;
    feedback: string;
    safetyLogs: string;
    settings: string;
    adminPortal: string;
    backToApp: string;
    superAdminRole: string;
    rlsEnforced: string;
    overviewTitle: string;
    overviewSubtitle: string;
    indexedDocs: string;
    verifiedSources: string;
    pendingReviews: string;
    safetyTriggers: string;
    systemHealth: string;
    allServicesOp: string;
    aiEngine: string;
    databaseRls: string;
    safetyGuardrails: string;
    readyForInference: string;
    schemaMigrationsReady: string;
    engineActive: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    search: string;
    noData: string;
    comingSoon: string;
    educationalNotice: string;
    educationalNoticeText: string;
    importantDisclaimer: string;
    importantDisclaimerText: string;
    zeroLatencyEscalation: string;
    callHotline: string;
    allHotlines: string;
    hotlinesDirectoryTitle: string;
    hotlinesDirectoryDesc: string;
    searchHotlines: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguageCode, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      chat: 'Chat',
      diseases: 'Diseases',
      prevention: 'Prevention',
      vaccination: 'Vaccination',
      healthyHabits: 'Healthy Habits',
      resources: 'Resources',
      bookmarks: 'Bookmarks',
      about: 'About',
      dashboard: 'Dashboard',
      profile: 'Profile',
      admin: 'Admin Console',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      selectLanguage: 'Select Language',
      appTitle: 'HealthWise',
      appSubtitle: 'Public Health Awareness',
    },
    chat: {
      title: 'HealthWise AI',
      evidenceGrounded: 'Evidence Grounded',
      newChat: 'New Chat',
      startTitle: 'Start a Health Conversation',
      startDesc: 'Ask about disease symptoms, prevention tips, vaccine schedules, or healthy lifestyle guidance. All responses are grounded in trusted public health sources.',
      placeholder: 'Ask about a disease, symptom, prevention, vaccine, or nutrition...',
      send: 'Send',
      disclaimer: 'Educational health information only. Consult a doctor for medical advice.',
      analyzing: 'Analyzing health literature...',
      emergencyAlertTitle: 'EMERGENCY RED-FLAG ADVISORY',
      sources: 'Sources:',
      askAI: 'Ask AI',
      emergencyHotlines: 'Emergency Hotlines',
    },
    diseases: {
      badge: 'Medical Directory',
      title: 'Disease Explorer & Clinical Guides',
      subtitle: 'Explore evidence-based summaries of communicable and chronic health conditions grounded in official World Health Organization (WHO) documentation.',
      searchPlaceholder: 'Search diseases, symptoms, or keywords (e.g. fever, dengue, blood pressure)...',
      filterBy: 'Filter:',
      all: 'All',
      keySigns: 'Key Clinical Signs:',
      readGuide: 'Read Clinical Guide',
      askAI: 'Ask AI',
      whoGrounded: 'WHO Grounded',
      noResults: 'No matching health conditions found',
      noResultsDesc: 'Try adjusting your keyword search or category filter.',
    },
    diseaseDetail: {
      back: 'Back to Disease Explorer',
      bookmark: 'Bookmark Guide',
      bookmarked: 'Bookmarked',
      share: 'Share',
      linkCopied: 'Link Copied',
      askAI: 'Ask AI',
      reviewed: 'Reviewed:',
      symptomsTitle: 'Recognized Clinical Symptoms',
      symptomsSubtitle: 'Typical indicators documented in health criteria',
      warningSignsTitle: 'Emergency Warning Signs (Red-Flags)',
      warningSignsSubtitle: 'Critical indicators demanding urgent hospital care',
      riskFactorsTitle: 'Risk Factors & Vulnerability',
      riskFactorsSubtitle: 'Conditions elevating transmission or severity',
      preventionTitle: 'Evidence-Based Prevention',
      preventionSubtitle: 'WHO-recommended preventive protocols',
      whenToSeekCareTitle: 'When to Seek Immediate Medical Evaluation',
      ctaTitle: 'Have questions about this condition?',
      ctaDesc: 'Ask our WHO-grounded AI assistant about symptoms, risk reduction, or when to schedule a clinical visit.',
      startConversation: 'Start Conversation',
      relatedTitle: 'Related Conditions',
    },
    resources: {
      badge: 'Curated Directory',
      title: 'Trusted Healthcare Resources & Helplines',
      subtitle: 'Direct links to peer-reviewed public health repositories, official government health guidelines, and emergency medical hotlines.',
      emergencySectionTitle: 'Emergency Medical Hotlines & Helplines',
      emergencySectionDesc: 'In any life-threatening emergency, call local emergency services immediately. Do not rely on chatbots.',
      callNow: 'Call',
      portalsTitle: 'Official Health Portals & Documents',
      portalsSubtitle: 'Verified clinical databases, surveillance guidelines, and institutional fact sheets',
      searchPlaceholder: 'Search resources...',
      visit: 'Visit Official Resource',
      verified: 'Verified',
    },
    bookmarks: {
      title: 'Saved Health Resources',
      subtitle: 'Quick personal access to bookmarked disease fact sheets, clinical prevention guides, and official health links.',
      all: 'All',
      diseases: 'Diseases',
      external: 'External Resources',
      emptyTitle: 'No Bookmarks Found',
      emptyDesc: 'You have not bookmarked any disease guides or health resources yet. Browse the directory and click the bookmark icon to save topics.',
      browseBtn: 'Browse Disease Explorer',
      readGuide: 'Read Clinical Guide',
      visitResource: 'Visit Resource',
      savedOn: 'Saved on',
      guestNotice: 'You are currently in guest mode. Your bookmarks are preserved in your local browser session.',
      signInLink: 'Sign in to sync across devices',
    },
    safety: {
      mandatoryDisclaimer: '⚕️ This is general educational health information. For personal medical advice, diagnosis, or treatment, consult a licensed healthcare professional.',
      emergencyEscalationTitle: '🚨 URGENT MEDICAL ALERT',
      emergencyEscalationMessage: 'The symptoms you described may indicate a life-threatening medical emergency. Call emergency services (112 / 911 / 108) immediately.',
    },
    home: {
      heroBadge: 'AI-Assisted Public Health Education Platform',
      heroTitle: 'Understand Your Health.',
      heroTitleHighlight: 'Make Informed Decisions.',
      heroDesc: 'An evidence-grounded AI conversational platform that explains common diseases, risk factors, prevention protocols, vaccination guidance, and lifestyle wellness using verified information from trusted global health authorities.',
      startChat: 'Start Health Chat',
      exploreDiseases: 'Explore Diseases',
      whoCdcGrounded: 'WHO & CDC Grounded',
      zeroHallucination: 'Zero Hallucination Guardrails',
      strictSafety: 'Strict Non-Diagnostic Safety',
      assistantTitle: 'HealthWise AI Assistant',
      evidenceGrounded: 'Evidence Grounded',
      demoUserQuery: 'What are the early symptoms of dengue fever?',
      demoAiResponse: 'Common symptoms typically begin 4–10 days after infection and include:',
      demoRedFlag: 'Red-Flag Alert: Severe abdominal pain or persistent vomiting requires immediate hospital evaluation.',
      demoSource: 'Source: World Health Organization (WHO)',
      educationalOnly: 'Educational Only',
      tryAsking: 'Try asking:',
      ctaBadge: 'Accessible Public Health Education',
      ctaTitle: 'Have Questions About a Disease or Prevention?',
      ctaDesc: 'Start a confidential, evidence-backed conversational session with our AI health assistant to understand symptoms, risk factors, and prevention protocols.',
      ctaChatBtn: 'Start Health Chat Now',
      ctaDiseasesBtn: 'Browse Disease Index',
      ctaDisclaimer: '* HealthWise AI provides educational health information and does not provide medical diagnosis or treatment.',

      // Platform Capabilities
      capBadge: 'Platform Capabilities',
      capTitle: 'Designed for Trustworthy Public Health Education',
      capDesc: 'Every feature is engineered to provide accurate, easy-to-understand health information while upholding the highest ethical and clinical communication standards.',
      capDiseaseEduTitle: 'Disease Education',
      capDiseaseEduDesc: 'Understand pathophysiology, progression, and risk factors of communicable and chronic diseases in straightforward, jargon-free terminology.',
      capSymptomsTitle: 'Symptoms vs. Diagnosis',
      capSymptomsDesc: 'Clear boundaries: explains what symptoms may signify without diagnosing, emphasizing that only qualified doctors can formulate a diagnosis.',
      capPreventionTitle: 'Evidence-Based Prevention',
      capPreventionDesc: 'Actionable prevention guidelines covering mosquito-borne vector control, hand hygiene standards, air filtration, and infection control.',
      capVaccineTitle: 'Vaccine Literacy',
      capVaccineDesc: 'Verified immunization schedules, vaccine safety principles, target age demographics, and booster recommendations from WHO guidelines.',
      capNutritionTitle: 'Nutrition & Wellness',
      capNutritionDesc: 'Public health dietary recommendations for metabolic health, hypertension control (DASH), hydration, and immune support.',
      capEmergencyTitle: 'Red-Flag Emergency Detection',
      capEmergencyDesc: 'Instant detection of dangerous symptom constellations (e.g. stroke FAST symptoms, severe anaphylaxis) directing users to immediate emergency care.',
      capStandard: 'Public Health Standard',

      // Supported Topics
      topicsBadge: 'Curated Knowledge',
      topicsTitle: 'Supported Health Topics',
      topicsDesc: 'Explore evidence-based guides curated from world-leading public health authorities.',
      topicsViewAll: 'View all topics',
      topicDengueName: 'Dengue & Vector Diseases',
      topicDengueCategory: 'Vector-Borne Disease',
      topicDengueDesc: 'Mosquito-borne viral infection caused by Aedes mosquitoes. Learn symptom recognition, critical hydration protocols, and vector control.',
      topicDengueBadge: 'Verified WHO Guidance',
      topicDiabetesName: 'Type 2 Diabetes Mellitus',
      topicDiabetesCategory: 'Chronic Metabolic Disorder',
      topicDiabetesDesc: 'Comprehensive awareness regarding insulin sensitivity, early markers (polyuria, polydipsia), balanced nutrition, and physical activity.',
      topicDiabetesBadge: 'Evidence Grounded',
      topicHypertensionName: 'Hypertension (High BP)',
      topicHypertensionCategory: 'Cardiovascular Health',
      topicHypertensionDesc: 'Known as the "silent killer". Understand blood pressure thresholds, dietary sodium reduction, stress management, and regular screening.',
      topicHypertensionBadge: 'Clinical Protocol',
      topicInfluenzaName: 'Influenza & Respiratory Care',
      topicInfluenzaCategory: 'Respiratory Infection',
      topicInfluenzaDesc: 'Seasonal flu vs. common cold differences, droplet transmission precautions, fever management, and annual vaccine importance.',
      topicInfluenzaBadge: 'CDC Guidelines',
      topicHygieneName: 'Hygiene, Sanitation & Water',
      topicHygieneCategory: 'Infection Prevention',
      topicHygieneDesc: 'Hand hygiene protocols (WHO 6-step technique), food handling safety, safe drinking water practices, and environmental sanitation.',
      topicHygieneBadge: 'Preventive Standard',
      topicVaccineName: 'Essential Immunization',
      topicVaccineCategory: 'Preventive Medicine',
      topicVaccineDesc: 'Universal immunization schedule, infant vaccines, adult boosters (Tetanus, Pneumococcal, HPV), and vaccine safety demystified.',
      topicVaccineBadge: 'Official Schedule',
      topicReadGuide: 'Read Clinical Guide',

      // How It Works
      howBadge: 'System Methodology',
      howTitle: 'How HealthWise AI Works',
      howDesc: 'A transparent 5-stage pipeline combining Natural Language Processing, Retrieval-Augmented Generation (RAG), and strict healthcare safety guardrails.',
      howStep1Title: 'User Query & NLP Parsing',
      howStep1Desc: 'Natural Language Processing parses user input, identifying intent, medical entities, symptom mentions, and urgency indicators.',
      howStep2Title: 'Urgency & Red-Flag Triage',
      howStep2Desc: 'Rule-based safety triage inspects queries for critical emergency symptoms (e.g., chest pain, stroke signs) before general querying.',
      howStep3Title: 'Evidence Retrieval (RAG)',
      howStep3Desc: 'Retrieval-Augmented Generation extracts verified passages from official knowledge stores (WHO, CDC, MoHFW guidelines).',
      howStep4Title: 'Grounded AI Inference',
      howStep4Desc: 'Puter.js AI synthesizes a clear, plain-language explanation strictly bounded to the retrieved evidence, preventing hallucinations.',
      howStep5Title: 'Safety Check & Citations',
      howStep5Desc: 'Post-generation validator enforces non-diagnostic rules, attaches official source citations, and includes mandatory medical disclaimers.',
      howVerifiedStep: 'Verified Step',

      // Trusted Sources
      sourcesBadge: 'Source Grounding',
      sourcesTitle: 'Curated from Verified Global Health Authorities',
      sourcesDesc: 'HealthWise AI eliminates generic AI hallucination by indexing official publications, verified technical reports, and peer-reviewed clinical guidelines.',
      sourceWhoType: 'Global Public Health Agency',
      sourceWhoDesc: 'International public health authority publishing disease outbreak news, diagnostic technical briefs, and vaccination guidelines.',
      sourceWhoCoverage: 'Global disease classifications, immunization schedules, pandemic alerts',
      sourceCdcType: 'Federal Public Health Agency (USA)',
      sourceCdcDesc: 'Science-based guidance on infectious diseases, community prevention programs, environmental health, and travel notices.',
      sourceCdcCoverage: 'Infectious pathogen management, respiratory infections, vector control',
      sourceMohfwType: 'National Health Ministry (Govt. of India)',
      sourceMohfwDesc: 'National health policies, National Vector Borne Disease Control Programme (NVBDCP), and Universal Immunization Programme (UIP).',
      sourceMohfwCoverage: 'Dengue & Malaria national guidelines, UIP vaccine schedule, local advisories',
      sourceNhsType: 'Public Healthcare System',
      sourceNhsDesc: 'Evidence-based patient health condition directories, symptom descriptions, and clinical triage recommendations.',
      sourceNhsCoverage: 'Chronic disease lifestyle management, symptom check protocols',
      sourceCuratedAreas: 'Curated Knowledge Areas:',
      sourceAudited: 'Audited Metadata & Versioned',
      sourceVisitPortal: 'Visit Portal',

      // Multilingual Showcase
      multiBadge: 'Inclusivity & Access',
      multiTitle: 'Multilingual Health Literacy',
      multiDesc: 'Public health awareness is only effective when people understand it in their native tongue. HealthWise AI delivers culturally relevant, linguistically accurate health education without losing medical nuance or compromising safety guardrails.',
      multiPointEn: 'Standard global medical terminology and international consensus.',
      multiPointTe: 'Vernacular explanations tailored for regional public awareness.',
      multiPointHi: 'Broad national accessibility across rural and urban demographics.',
      multiTryChat: 'Try Health Chat in this language',

      // FAQ Section
      faqBadge: 'Common Questions',
      faqTitle: 'Frequently Asked Questions',
      faqDesc: 'Understand how our AI public health assistant works and the safety boundaries we enforce.',
      faqQ1: 'Does HealthWise AI replace a medical doctor or clinical consultation?',
      faqA1: 'Absolutely not. HealthWise AI is an educational platform designed to improve health literacy, disease awareness, and preventive hygiene. It never diagnoses conditions, prescribes medication, or replaces clinical evaluation by a licensed healthcare professional.',
      faqQ2: 'Can the chatbot diagnose symptoms or provide prescription drug dosages?',
      faqA2: 'No. The system strictly refuses to diagnose illnesses or calculate medicine dosages. It explains what symptoms are commonly associated with various conditions in medical literature and guides you on when to seek evaluation from a doctor.',
      faqQ3: 'How does the platform avoid AI hallucinations?',
      faqA3: 'HealthWise AI utilizes Retrieval-Augmented Generation (RAG). Before generating a response, the engine retrieves verified paragraphs from curated databases backed by the World Health Organization (WHO), CDC, and national health ministries. If verified information is insufficient, the AI acknowledges the limitation rather than fabricating an answer.',
      faqQ4: 'What happens if I ask about a life-threatening symptom?',
      faqA4: 'The safety layer continuously scans for urgent red-flag patterns such as severe chest pain, stroke signs (FAST), acute shortness of breath, or heavy bleeding. When detected, the AI immediately surfaces emergency medical warnings and urges you to contact local emergency services immediately.',
      faqQ5: 'Is my personal health information stored or sold?',
      faqA5: 'We respect strict user privacy. We do not construct medical diagnostic profiles from casual chats, and conversations can be cleared or deleted. Only aggregated, anonymized metrics (such as topic popularity) are tracked to assess public health educational impact.',
      faqQ6: 'Do I need to pay or provide OpenAI/Anthropic API keys?',
      faqA6: 'No. The platform is integrated with Puter.js, which enables direct serverless AI access without requiring individual developer or user OpenAI/Anthropic API keys.',
    },
    footer: {
      emergencyWarningTitle: 'Medical Emergency Warning',
      emergencyWarningText: 'If you are experiencing severe chest pain, difficulty breathing, sudden weakness, or any life-threatening condition, call your local emergency service (e.g., 112 / 911 / 108) immediately.',
      emergencyContactsBtn: 'Emergency Contacts',
      brandDesc: 'AI-driven public health conversational platform promoting disease education, preventive care, and trustworthy medical literacy using trusted health institutions.',
      evidenceBasedEducation: 'Evidence-based education',
      exploreHealth: 'Explore Health',
      trustedSources: 'Trusted Sources',
      platformSafety: 'Platform & Safety',
      aiChatbot: 'AI Health Chatbot',
      diseaseExplorer: 'Disease Explorer',
      preventionGuides: 'Prevention Guides',
      vaccinationSchedules: 'Vaccination Schedules',
      healthyHabits: 'Healthy Habits & Nutrition',
      verifiedDirectory: 'Verified Resource Directory',
      aboutProject: 'About the Project',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      safetyAuditLogs: 'Safety Audit Logs',
      allRightsReserved: 'All rights reserved. Grounded in World Health Organization (WHO) and public health guidance.',
      disclaimer: 'Disclaimer: Not medical advice. For emergencies, call 112 / 108 / 911.',
    },
    auth: {
      signInTitle: 'Sign In to HealthWise',
      signInSubtitle: 'Access your saved conversations, bookmarks, and preferences.',
      signUpTitle: 'Create Your Account',
      signUpSubtitle: 'Save conversations, bookmark disease guides, and customize your preferences.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Dr. Jane Doe',
      signInBtn: 'Sign In',
      signUpBtn: 'Create Account',
      oneClickTest: 'Quick One-Click Test Login',
      signInAsUser: 'Sign in as User',
      signInAsAdmin: 'Sign in as Admin',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createOne: 'Create one now',
      signInInstead: 'Sign in instead',
    },
    admin: {
      dashboard: 'Dashboard',
      knowledgeBase: 'Knowledge Base',
      sources: 'Sources',
      contentReview: 'Content Review',
      analytics: 'Analytics',
      feedback: 'Feedback',
      safetyLogs: 'Safety Logs',
      settings: 'Settings',
      adminPortal: 'Admin Portal',
      backToApp: 'Back to main app',
      superAdminRole: 'Role: Super Administrator',
      rlsEnforced: 'Enforced via Supabase RLS',
      overviewTitle: 'Administrative Overview',
      overviewSubtitle: 'Monitor public health knowledge corpus integrity, RAG retrieval analytics, and safety compliance.',
      indexedDocs: 'Indexed Documents',
      verifiedSources: 'Verified Sources',
      pendingReviews: 'Pending Content Reviews',
      safetyTriggers: 'Red-Flag Safety Triggers',
      systemHealth: 'System Health & RAG Index Status',
      allServicesOp: 'All Services Operational',
      aiEngine: 'AI Completion Engine',
      databaseRls: 'Database & RLS',
      safetyGuardrails: 'Safety Guardrails',
      readyForInference: 'Ready for inference',
      schemaMigrationsReady: 'Schema migrations prepared',
      engineActive: '100% active',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      search: 'Search',
      noData: 'No data available',
      comingSoon: 'Coming Soon',
      educationalNotice: 'Educational Notice:',
      educationalNoticeText: 'This chatbot provides general health information for educational purposes only. It does not provide medical diagnosis or treatment. For personal medical advice, consult a qualified healthcare professional.',
      importantDisclaimer: 'Important Medical Disclaimer',
      importantDisclaimerText: 'This chatbot provides general health information for educational purposes only. It does not provide medical diagnosis or treatment. For personal medical advice, consult a qualified healthcare professional. In case of an emergency, contact your local emergency services immediately.',
      zeroLatencyEscalation: 'Zero-Latency Escalation',
      callHotline: 'Call',
      allHotlines: 'All International Hotlines',
      hotlinesDirectoryTitle: 'Emergency & Crisis Hotlines Directory',
      hotlinesDirectoryDesc: 'Official national emergency services and crisis support lines',
      searchHotlines: 'Search hotlines by country or service...',
    },
  },

  te: {
    nav: {
      home: 'హోమ్',
      chat: 'చాట్ సంభాషణ',
      diseases: 'వ్యాధుల సమాచారం',
      prevention: 'నివారణ చర్యలు',
      vaccination: 'టీకాలు',
      healthyHabits: 'ఆరోగ్యకర అలవాట్లు',
      resources: 'వనరులు',
      bookmarks: 'సేవ్ చేసినవి',
      about: 'మా గురించి',
      dashboard: 'డ్యాష్‌బోర్డ్',
      profile: 'ప్రొఫైల్',
      admin: 'అడ్మిన్ కన్సోల్',
      signIn: 'లాగిన్',
      signOut: 'లాగౌట్',
      selectLanguage: 'భాషను ఎంచుకోండి',
      appTitle: 'హెల్త్‌వైజ్',
      appSubtitle: 'ప్రజా ఆరోగ్య అవగాహన',
    },
    chat: {
      title: 'హెల్త్‌వైజ్ AI',
      evidenceGrounded: 'శాస్త్రీయ సమాచారం',
      newChat: 'కొత్త చాట్',
      startTitle: 'ఆరోగ్య సంభాషణ ప్రారంభించండి',
      startDesc: 'లక్షణాలు, నివారణ సూచనలు, టీకా షెడ్యూల్‌లు లేదా ఆహార మార్గదర్శకాల గురించి అడగండి. అన్ని సమాధానాలు WHO అధికారిక పత్రాల ఆధారంగా ఇవ్వబడతాయి.',
      placeholder: 'వ్యాధి, లక్షణం, నివారణ, టీకా లేదా ఆహారం గురించి అడగండి...',
      send: 'పంపండి',
      disclaimer: 'ఇది సాధారణ ఆరోగ్య అవగాహన సమాచారం మాత్రమే. వ్యక్తిగత సలహాకు వైద్యుడిని సంప్రదించండి.',
      analyzing: 'ఆరోగ్య నివేదికలను విశ్లేషిస్తోంది...',
      emergencyAlertTitle: 'అత్యవసర హెచ్చరిక ప్రకటన',
      sources: 'ఆధారాలు:',
      askAI: 'AI ని అడగండి',
      emergencyHotlines: 'అత్యవసర హెల్ప్‌లైన్లు',
    },
    diseases: {
      badge: 'వైద్య సమాచార డైరెక్టరీ',
      title: 'వ్యాధుల సమగ్ర సమాచారం & మార్గదర్శకాలు',
      subtitle: 'ప్రపంచ ఆరోగ్య సంస్థ (WHO) అధికారిక పత్రాల ఆధారంగా రూపొందించిన అంటువ్యాధులు మరియు దీర్ఘకాలిక వ్యాధుల సమగ్ర వివరాలు.',
      searchPlaceholder: 'వ్యాధి పేరు, లక్షణాలు లేదా పదాలను శోధించండి (ఉదా: జ్వరం, డెంగ్యూ, రక్తపోటు)...',
      filterBy: 'వర్గం:',
      all: 'అన్నీ',
      keySigns: 'ముఖ్యమైన లక్షణాలు:',
      readGuide: 'పూర్తి వివరాలు చదవండి',
      askAI: 'AI ని అడగండి',
      whoGrounded: 'WHO ధృవీకరించినది',
      noResults: 'ఎలాంటి వ్యాధులు కనుగొనబడలేదు',
      noResultsDesc: 'దయచేసి శోధన పదం లేదా వర్గాన్ని మార్చి ప్రయత్నించండి.',
    },
    diseaseDetail: {
      back: 'వ్యాధుల జాబితాకు తిరిగి వెళ్లండి',
      bookmark: 'బుక్‌మార్క్ చేయండి',
      bookmarked: 'సేవ్ చేయబడింది',
      share: 'షేర్ చేయండి',
      linkCopied: 'లింక్ కాపీ చేయబడింది',
      askAI: 'AI ని అడగండి',
      reviewed: 'సమీక్షించిన తేదీ:',
      symptomsTitle: 'గుర్తించదగిన ముఖ్య లక్షణాలు',
      symptomsSubtitle: 'అధికారిక ఆరోగ్య మార్గదర్శకాల ప్రకారం కనిపించే లక్షణాలు',
      warningSignsTitle: 'అత్యవసర ప్రమాద హెచ్చరికలు (రెడ్-ఫ్లాగ్స్)',
      warningSignsSubtitle: 'వెంటనే ఆసుపత్రి అత్యవసర చికిత్స అవసరమైన ప్రమాద సంకేతాలు',
      riskFactorsTitle: 'ప్రమాద కారకాలు & సంభావ్యత',
      riskFactorsSubtitle: 'వ్యాధి తీవ్రతను పెంచే పరిస్థితులు',
      preventionTitle: 'శాస్త్రీయ నివారణ మార్గాలు',
      preventionSubtitle: 'WHO సిఫార్సు చేసిన నివారణ చర్యలు',
      whenToSeekCareTitle: 'వైద్యుడిని ఎప్పుడు వెంటనే సంప్రదించాలి',
      ctaTitle: 'ఈ వ్యాధి గురించి ప్రశ్నలు ఉన్నాయా?',
      ctaDesc: 'మా AI సహాయకుడిని లక్షణాలు, నివారణ మరియు వైద్య సంప్రదింపుల గురించి అడగండి.',
      startConversation: 'సంభాషణ ప్రారంభించండి',
      relatedTitle: 'సంబంధిత ఇతర వ్యాధులు',
    },
    resources: {
      badge: 'అధికారిక వనరులు',
      title: 'విశ్వసనీయ ఆరోగ్య వనరులు & హెల్ప్‌లైన్లు',
      subtitle: 'అధికారిక ప్రభుత్వ నివేదికలు, అంతర్జాతీయ పరిశోధన గ్రంథాలయాలు మరియు అత్యవసర హెల్ప్‌లైన్ నంబర్లు.',
      emergencySectionTitle: 'అత్యవసర వైద్య హెల్ప్‌లైన్లు',
      emergencySectionDesc: 'ప్రాణాంతక అత్యవసర పరిస్థితుల్లో వెంటనే స్థానిక ఎమర్జెన్సీ నంబర్లకు కాల్ చేయండి. చాట్‌బాట్‌లపై ఆధారపడకండి.',
      callNow: 'కాల్ చేయండి',
      portalsTitle: 'అధికారిక ఆరోగ్య పోర్టల్స్ & పత్రాలు',
      portalsSubtitle: 'ధృవీకరించబడిన క్లినికల్ డేటాబేస్‌లు మరియు నిఘా మార్గదర్శకాలు',
      searchPlaceholder: 'వనరులను శోధించండి...',
      visit: 'పోర్టల్ సందర్శించండి',
      verified: 'ధృవీకరించబడినది',
    },
    bookmarks: {
      title: 'సేవ్ చేసిన ఆరోగ్య వనరులు',
      subtitle: 'మీరు బుక్‌మార్క్ చేసిన వ్యాధుల వివరాలు మరియు ఆరోగ్య పత్రాలను సులభంగా వీక్షించండి.',
      all: 'అన్నీ',
      diseases: 'వ్యాధులు',
      external: 'ఇతర వనరులు',
      emptyTitle: 'బుక్‌మార్క్‌లు లేవు',
      emptyDesc: 'మీరు ఇంకా ఏ సమాచారాన్ని సేవ్ చేయలేదు. డైరెక్టరీని పరిశీలించి ముఖ్యమైన వాటిని బుక్‌మార్క్ చేయండి.',
      browseBtn: 'వ్యాధుల డైరెక్టరీని చూడండి',
      readGuide: 'వివరాలు చదవండి',
      visitResource: 'వనరును సందర్శించండి',
      savedOn: 'సేవ్ చేసిన తేదీ',
      guestNotice: 'మీరు గెస్ట్ మోడ్‌లో ఉన్నారు. మీ బుక్‌మార్క్‌లు ఈ బ్రౌజర్‌లో భద్రపరచబడతాయి.',
      signInLink: 'అన్ని పరికరాల్లో సింక్ కావడానికి లాగిన్ అవ్వండి',
    },
    safety: {
      mandatoryDisclaimer: '⚕️ ఇది సాధారణ ఆరోగ్య అవగాహన సమాచారం మాత్రమే. వ్యక్తిగత వైద్య నిర్ధారణ లేదా చికిత్స కోసం లైసెన్స్ పొందిన వైద్యుడిని సంప్రదించండి.',
      emergencyEscalationTitle: '🚨 అత్యవసర వైద్య హెచ్చరిక',
      emergencyEscalationMessage: 'మీరు పేర్కొన్న లక్షణాలు ప్రాణాంతక అత్యవసర పరిస్థితిని సూచించవచ్చు. వెంటనే ఎమర్జెన్సీ నంబర్ (112 / 108) కు కాల్ చేయండి.',
    },
    home: {
      heroBadge: 'AI-ఆధారిత ప్రజా ఆరోగ్య విద్యా వేదిక',
      heroTitle: 'మీ ఆరోగ్యాన్ని అర్థం చేసుకోండి.',
      heroTitleHighlight: 'సరైన నిర్ణయాలు తీసుకోండి.',
      heroDesc: 'ప్రపంచ ఆరోగ్య సంస్థ (WHO) మరియు అధికారిక వైద్య సంస్థల ఆధారంగా వ్యాధులు, ప్రమాద కారకాలు, నివారణ పద్ధతులు మరియు ఆరోగ్య సూత్రాలను వివరించే AI వేదిక.',
      startChat: 'ఆరోగ్య చాట్ ప్రారంభించండి',
      exploreDiseases: 'వ్యాధులను అన్వేషించండి',
      whoCdcGrounded: 'WHO ఆధారిత సమాచారం',
      zeroHallucination: 'సురక్షితమైన మార్గదర్శకాలు',
      strictSafety: 'వైద్య నిర్ధారణ రహిత రక్షణ',
      assistantTitle: 'హెల్త్‌వైజ్ AI సహాయకుడు',
      evidenceGrounded: 'శాస్త్రీయ సమాచారం',
      demoUserQuery: 'డెంగ్యూ జ్వరం ప్రారంభ లక్షణాలు ఏమిటి?',
      demoAiResponse: 'సాధారణంగా సంక్రమణ తర్వాత 4-10 రోజులలో లక్షణాలు కనిపిస్తాయి:',
      demoRedFlag: 'తీవ్రమైన హెచ్చరిక: తీవ్రమైన కడుపు నొప్పి లేదా నిరంతర వాంతులు ఉంటే వెంటనే ఆసుపత్రికి వెళ్ళండి.',
      demoSource: 'ఆధారం: ప్రపంచ ఆరోగ్య సంస్థ (WHO)',
      educationalOnly: 'అవగాహన కొరకు మాత్రమే',
      tryAsking: 'ఇలా అడగండి:',
      ctaBadge: 'సులభమైన ప్రజా ఆరోగ్య విద్య',
      ctaTitle: 'వ్యాధి లేదా నివారణ గురించి ప్రశ్నలు ఉన్నాయా?',
      ctaDesc: 'లక్షణాలు, ప్రమాద కారకాలు మరియు నివారణ మార్గదర్శకాలను తెలుసుకోవడానికి మా AI ఆరోగ్య సహాయకుడితో మాట్లాడండి.',
      ctaChatBtn: 'ఇప్పుడే చాట్ ప్రారంభించండి',
      ctaDiseasesBtn: 'వ్యాధుల సూచిక చూడండి',
      ctaDisclaimer: '* హెల్త్‌వైజ్ AI సాధారణ ఆరోగ్య అవగాహన సమాచారాన్ని మాత్రమే అందిస్తుంది, వైద్య నిర్ధారణ లేదా చికిత్సను అందించదు.',

      // Platform Capabilities
      capBadge: 'వేదిక సామర్థ్యాలు',
      capTitle: 'విశ్వసనీయ ప్రజారోగ్య విద్య కోసం రూపొందించబడింది',
      capDesc: 'అత్యున్నత నైతిక మరియు వైద్య ప్రమాణాలను పాటిస్తూ, కచ్చితమైన, సులభంగా అర్థమయ్యే ఆరోగ్య సమాచారాన్ని అందించడానికి ప్రతి అంశం రూపొందించబడింది.',
      capDiseaseEduTitle: 'వ్యాధుల విద్య & అవగాహన',
      capDiseaseEduDesc: 'అంటువ్యాధులు మరియు దీర్ఘకాలిక వ్యాధుల కారణాలు, పెరుగుదల మరియు ప్రమాద కారకాలను సరళమైన భాషలో అర్థం చేసుకోండి.',
      capSymptomsTitle: 'లక్షణాలు vs రోగ నిర్ధారణ',
      capSymptomsDesc: 'స్పష్టమైన సరిహద్దులు: రోగ నిర్ధారణ చేయకుండా లక్షణాలు దేనికి సంకేతమో వివరిస్తుంది, వైద్యులు మాత్రమే నిర్ధారించగలరని స్పష్టం చేస్తుంది.',
      capPreventionTitle: 'శాస్త్రీయ ఆధారిత నివారణ',
      capPreventionDesc: 'దోమల నివారణ, చేతుల పరిశుభ్రత ప్రమాణాలు, గాలి శుద్ధీకరణ మరియు ఇన్ఫెక్షన్ నియంత్రణపై ఆచరణాత్మక మార్గదర్శకాలు.',
      capVaccineTitle: 'టీకా అక్షరాస్యత',
      capVaccineDesc: 'WHO మార్గదర్శకాల ప్రకారం ధృవీకరించబడిన రోగనిరోధక షెడ్యూల్స్, టీకా భద్రతా సూత్రాలు మరియు బూస్టర్ సిఫార్సులు.',
      capNutritionTitle: 'పోషణ & సంపూర్ణ ఆరోగ్యం',
      capNutritionDesc: 'జీవక్రియ ఆరోగ్యం, రక్తపోటు నియంత్రణ, సరైన హైడ్రేషన్ మరియు రోగనిరోధక శక్తి కోసం ప్రజారోగ్య ఆహార సిఫార్సులు.',
      capEmergencyTitle: 'రెడ్-ఫ్లాగ్ అత్యవసర గుర్తింపు',
      capEmergencyDesc: 'తీవ్రమైన ప్రమాదకర లక్షణాలను (ఉదా: పక్షవాతం, తీవ్రమైన అలెర్జీ) తక్షణమే గుర్తించి, అత్యవసర చికిత్సకు నిర్దేశిస్తుంది.',
      capStandard: 'ప్రజారోగ్య ప్రమాణం',

      // Supported Topics
      topicsBadge: 'ఎంపిక చేసిన విజ్ఞానం',
      topicsTitle: 'అందుబాటులో ఉన్న ఆరోగ్య అంశాలు',
      topicsDesc: 'ప్రపంచ ప్రఖ్యాత ప్రజా ఆరోగ్య సంస్థల నుండి సేకరించిన శాస్త్రీయ మార్గదర్శకాలను అన్వేషించండి.',
      topicsViewAll: 'అన్ని అంశాలను చూడండి',
      topicDengueName: 'డెంగ్యూ & వెక్టర్ వ్యాధులు',
      topicDengueCategory: 'దోమల ద్వారా వ్యాపించే వ్యాధి',
      topicDengueDesc: 'ఏడిస్ దోమల వల్ల కలిగే వైరల్ ఇన్ఫెక్షన్. లక్షణాల గుర్తింపు, హైడ్రేషన్ ప్రోటోకాల్స్ మరియు దోమల నియంత్రణ తెలుసుకోండి.',
      topicDengueBadge: 'WHO ధృవీకరించిన మార్గదర్శకం',
      topicDiabetesName: 'టైప్ 2 డయాబెటిస్ మెల్లిటస్',
      topicDiabetesCategory: 'దీర్ఘకాలిక జీవక్రియ రుగ్మత',
      topicDiabetesDesc: 'ఇన్సులిన్ సున్నితత్వం, ప్రారంభ సంకేతాలు, సమతుల్య పోషణ మరియు వ్యాయామంపై సమగ్ర అవగాహన.',
      topicDiabetesBadge: 'శాస్త్రీయ ఆధారితం',
      topicHypertensionName: 'రక్తపోటు (హై బిపి)',
      topicHypertensionCategory: 'గుండె & రక్తనాళాల ఆరోగ్యం',
      topicHypertensionDesc: '"సైలెంట్ కిల్లర్" అని పిలుస్తారు. రక్తపోటు పరిమితులు, ఉప్పు నియంత్రణ మరియు ఒత్తిడి నిర్వహణను అర్థం చేసుకోండి.',
      topicHypertensionBadge: 'క్లినికల్ ప్రోటోకాల్',
      topicInfluenzaName: 'ఇన్‌ఫ్లుయెంజా & శ్వాసకోశ సంరక్షణ',
      topicInfluenzaCategory: 'శ్వాసకోశ ఇన్ఫెక్షన్',
      topicInfluenzaDesc: 'సీజనల్ ఫ్లూ మరియు సాధారణ జలుబు మధ్య తేడాలు, తుంపర్ల ద్వారా వ్యాప్తి నివారణ మరియు వార్షిక టీకా ప్రాముఖ్యత.',
      topicInfluenzaBadge: 'CDC మార్గదర్శకాలు',
      topicHygieneName: 'పరిశుభ్రత, పారిశుధ్యం & సురక్షిత నీరు',
      topicHygieneCategory: 'ఇన్ఫెక్షన్ నివారణ',
      topicHygieneDesc: 'చేతుల శుభ్రత పద్ధతులు (WHO 6-దశల విధానం), ఆహార భద్రత, సురక్షిత త్రాగునీటి పద్ధతులు మరియు పారిశుధ్యం.',
      topicHygieneBadge: 'నివారణ ప్రమాణం',
      topicVaccineName: 'తప్పనిసరి రోగనిరోధక టీకాలు',
      topicVaccineCategory: 'నివారణ వైద్యం',
      topicVaccineDesc: 'సార్వత్రిక టీకా షెడ్యూల్, శిశు టీకాలు, పెద్దల బూస్టర్లు మరియు టీకా భద్రత గురించిన వివరణ.',
      topicVaccineBadge: 'అధికారిక షెడ్యూల్',
      topicReadGuide: 'వైద్య మార్గదర్శిని చదవండి',

      // How It Works
      howBadge: 'వ్యవస్థ పనితీరు',
      howTitle: 'హెల్త్‌వైజ్ AI ఎలా పనిచేస్తుంది',
      howDesc: 'నేచురల్ లాంగ్వేజ్ ప్రాసెసింగ్, రిట్రీవల్-ఆగ్మెంటెడ్ జనరేషన్ (RAG) మరియు కఠినమైన ఆరోగ్య భద్రతా నియమాలతో కూడిన 5-దశల వ్యవస్థ.',
      howStep1Title: 'వినియోగదారు ప్రశ్న & NLP విశ్లేషణ',
      howStep1Desc: 'ప్రకృతి భాషా విశ్లేషణ ద్వారా ప్రశ్న ఉద్దేశం, వైద్య సంబంధిత అంశాలు, లక్షణాలు మరియు అత్యవసరతను గుర్తిస్తుంది.',
      howStep2Title: 'అత్యవసరత & రెడ్-ఫ్లాగ్ స్క్రీనింగ్',
      howStep2Desc: 'ఛాతీ నొప్పి, పక్షవాత సంకేతాలు వంటి క్లిష్టమైన లక్షణాల కోసం సమాధానం ఇచ్చే ముందే భద్రతా స్క్రీనింగ్ చేస్తుంది.',
      howStep3Title: 'ఆధారాల శోధన (RAG)',
      howStep3Desc: 'అధికారిక సంస్థల (WHO, CDC, MoHFW) ధృవీకరించిన సమాచార భాండాగారాల నుండి సంబంధిత భాగాలను సేకరిస్తుంది.',
      howStep4Title: 'ఆధారిత AI వివరణ',
      howStep4Desc: 'సేకరించిన అధికారిక సమాచారానికి మాత్రమే కట్టుబడి ఉంటూ తప్పుడు సమాచారం లేకుండా సరళమైన భాషలో వివరిస్తుంది.',
      howStep5Title: 'భద్రతా తనిఖీ & మూలాల ఆధారాలు',
      howStep5Desc: 'రోగ నిర్ధారణ నిరోధక నిబంధనలను అమలు చేసి, అధికారిక మూలాల లింకులు మరియు వైద్య నిరాకరణను జతచేస్తుంది.',
      howVerifiedStep: 'ధృవీకరించబడిన దశ',

      // Trusted Sources
      sourcesBadge: 'సమాచార మూలాలు',
      sourcesTitle: 'ధృవీకరించబడిన అంతర్జాతీయ ఆరోగ్య సంస్థల నుండి సేకరించబడింది',
      sourcesDesc: 'హెల్త్‌వైజ్ AI అధికారిక నివేదికలు మరియు పీర్-రివ్యూడ్ క్లినికల్ మార్గదర్శకాలను మాత్రమే ఉపయోగిస్తుంది.',
      sourceWhoType: 'ప్రపంచ ప్రజా ఆరోగ్య సంస్థ',
      sourceWhoDesc: 'అంతర్జాతీయ ప్రజా ఆరోగ్య అథారిటీ; వ్యాధుల వ్యాప్తి నివేదికలు, సాంకేతిక మార్గదర్శకాలు మరియు టీకా సిఫార్సులు ప్రచురిస్తుంది.',
      sourceWhoCoverage: 'గ్లోబల్ వ్యాధి వర్గీకరణలు, టీకా షెడ్యూల్‌లు, మహమ్మారి హెచ్చరికలు',
      sourceCdcType: 'ఫెడరల్ ప్రజారోగ్య సంస్థ (USA)',
      sourceCdcDesc: 'అంటువ్యాధులు, సమాజ నివారణ కార్యక్రమాలు మరియు పర్యావరణ ఆరోగ్యంపై శాస్త్రీయ మార్గదర్శకాలు.',
      sourceCdcCoverage: 'రోగకారక కారకాల నిర్వహణ, శ్వాసకోశ ఇన్ఫెక్షన్లు, వెక్టర్ నియంత్రణ',
      sourceMohfwType: 'జాతీయ ఆరోగ్య మంత్రిత్వ శాఖ (భారత ప్రభుత్వం)',
      sourceMohfwDesc: 'జాతీయ ఆరోగ్య విధానాలు, వెక్టర్ బోర్న్ డిసీజ్ కంట్రోల్ ప్రోగ్రామ్ (NVBDCP), మరియు సార్వత్రిక టీకా కార్యక్రమం (UIP).',
      sourceMohfwCoverage: 'డెంగ్యూ, మలేరియా జాతీయ మార్గదర్శకాలు, UIP టీకా షెడ్యూల్, స్థానిక సూచనలు',
      sourceNhsType: 'ప్రజా ఆరోగ్య సంరక్షణ వ్యవస్థ',
      sourceNhsDesc: 'రోగుల ఆరోగ్య పరిస్థితుల డైరెక్టరీలు, లక్షణాల వివరణలు మరియు క్లినికల్ ట్రియాజ్ సిఫార్సులు.',
      sourceNhsCoverage: 'దీర్ఘకాలిక వ్యాధుల జీవనశైలి నిర్వహణ, లక్షణాల తనిఖీ ప్రోటోకాల్స్',
      sourceCuratedAreas: 'సేకరించిన జ్ఞాన విభాగాలు:',
      sourceAudited: 'ఆడిట్ చేయబడిన మెటాడేటా & వెర్షన్లు',
      sourceVisitPortal: 'పోర్టల్ సందర్శించండి',

      // Multilingual Showcase
      multiBadge: 'సమగ్రత & ప్రాప్యత',
      multiTitle: 'బహుభాషా ఆరోగ్య అక్షరాస్యత',
      multiDesc: 'ప్రజా ఆరోగ్య అవగాహన ప్రజలకు వారి మాతృభాషలో చేరినప్పుడే పూర్తి ప్రయోజనం చేకూరుతుంది. వైద్య ఖచ్చితత్వం మరియు భద్రతను కాపాడుతూ హెల్త్‌వైజ్ AI ఆరోగ్య విద్యను అందిస్తుంది.',
      multiPointEn: 'ప్రామాణిక గ్లోబల్ వైద్య పరిభాష మరియు అంతర్జాతీయ ఏకాభిప్రాయం.',
      multiPointTe: 'ప్రాంతీయ ప్రజల అవగాహన కోసం రూపొందించిన సహజమైన వివరణలు.',
      multiPointHi: 'గ్రామీణ మరియు పట్టణ వర్గాల కోసం విస్తృత జాతీయ అందుబాటు.',
      multiTryChat: 'ఈ భాషలో ఆరోగ్య సంభాషణను ప్రారంభించండి',

      // FAQ Section
      faqBadge: 'సాధారణ ప్రశ్నలు',
      faqTitle: 'తరచుగా అడిగే ప్రశ్నలు (FAQ)',
      faqDesc: 'మా AI ప్రజారోగ్య సహాయకుడు ఎలా పనిచేస్తుందో మరియు భద్రతా నియమాలను అర్థం చేసుకోండి.',
      faqQ1: 'హెల్త్‌వైజ్ AI వైద్యుడిని లేదా క్లినికల్ సంప్రదింపులను భర్తీ చేస్తుందా?',
      faqA1: 'ఖచ్చితంగా లేదు. హెల్త్‌వైజ్ AI అనేది ఆరోగ్య పరిజ్ఞానం మరియు నివారణ పరిశుభ్రతను పెంపొందించడానికి రూపొందించబడిన విద్యా వేదిక. ఇది ఎప్పుడూ వ్యాధులను నిర్ధారించదు, మందులు సూచించదు, లేదా లైసెన్స్ పొందిన వైద్యుడి స్థానాన్ని భర్తీ చేయదు.',
      faqQ2: 'చాట్‌బాట్ లక్షణాల ఆధారంగా రోగాన్ని నిర్ధారించగలదా లేదా మందుల మోతాదును ఇవ్వగలదా?',
      faqA2: 'లేదు. ఈ వ్యవస్థ రోగనిర్ధారణ చేయడం లేదా ఔషధ మోతాదులను నిర్ణయించడాన్ని ఖచ్చితంగా తిరస్కరిస్తుంది. వైద్య సమాచారంలో ఏయే లక్షణాలు ఏ వ్యాధులతో సంబంధం కలిగి ఉన్నాయో మాత్రమే వివరిస్తుంది మరియు వైద్యుడిని ఎప్పుడు సంప్రదించాలో మార్గదర్శకత్వం చేస్తుంది.',
      faqQ3: 'ఈ వేదిక AI ఊహాజనిత తప్పులను (hallucinations) ఎలా నివారిస్తుంది?',
      faqA3: 'హెల్త్‌వైజ్ AI రిట్రీవల్-ఆగ్మెంటెడ్ జనరేషన్ (RAG) ఉపయోగిస్తుంది. సమాధానం ఇచ్చే ముందు ప్రపంచ ఆరోగ్య సంస్థ (WHO), CDC అధికారిక డేటాబేస్ నుండి ధృవీకరించిన భాగాలను శోధిస్తుంది. ధృవీకరించిన సమాచారం లేకపోతే తప్పుడు సమాధానం ఇవ్వకుండా పరిమితిని అంగీకరిస్తుంది.',
      faqQ4: 'నేను ప్రాణాంతక అత్యవసర లక్షణం గురించి అడిగితే ఏమి జరుగుతుంది?',
      faqA4: 'భద్రతా వ్యవస్థ తీవ్రమైన ఛాతీ నొప్పి, పక్షవాత లక్షణాలు (FAST), శ్వాసలో తీవ్ర ఇబ్బంది వంటి రెడ్-ఫ్లాగ్ సంకేతాలను నిరంతరం పర్యవేక్షిస్తుంది. అలాంటివి గుర్తించిన వెంటనే అత్యవసర వైద్య హెచ్చరికలను ప్రదర్శించి వెంటనే స్థానిక ఎమర్జెన్సీ నంబర్లను సంప్రదించమని సూచిస్తుంది.',
      faqQ5: 'నా వ్యక్తిగత ఆరోగ్య సమాచారం భద్రపరచబడుతుందా లేదా అమ్మబడుతుందా?',
      faqA5: 'మేము వినియోగదారుల గోప్యతను గౌరవిస్తాము. సాధారణ చాట్‌ల నుండి మేము ఎలాంటి వ్యక్తిగత వైద్య ప్రొఫైల్‌లను రూపొందించము మరియు సంభాషణలను తొలగించవచ్చు. విద్యా ప్రభావాన్ని అంచనా వేయడానికి మాత్రమే సమాచారాన్ని సమగ్రంగా, అనామకంగా ఉపయోగిస్తాము.',
      faqQ6: 'నేను డబ్బు చెల్లించాలా లేదా OpenAI/Anthropic API కీలు అందించాలా?',
      faqA6: 'అవసరం లేదు. ఈ వేదిక Puter.js తో అనుసంధానించబడింది, ఇది వినియోగదారులకు లేదా డెవలపర్లకు ప్రత్యేక API కీలు అవసరం లేకుండా నేరుగా సర్వర్‌లెస్ AI సేవలను అందిస్తుంది.',
    },
    footer: {
      emergencyWarningTitle: 'అత్యవసర వైద్య హెచ్చరిక',
      emergencyWarningText: 'తీవ్రమైన ఛాతీ నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ప్రాణాంతక పరిస్థితి ఉంటే వెంటనే అత్యవసర సేవలకు (112 / 108) కాల్ చేయండి.',
      emergencyContactsBtn: 'అత్యవసర నంబర్లు',
      brandDesc: 'ప్రజారోగ్య అవగాహన, నివారణ సంరక్షణ మరియు ఆరోగ్య అక్షరాస్యతను ప్రోత్సహించే AI-ఆధారిత వేదిక.',
      evidenceBasedEducation: 'శాస్త్రీయ ఆధారిత విద్య',
      exploreHealth: 'ఆరోగ్య సమాచారం',
      trustedSources: 'విశ్వసనీయ మూలాలు',
      platformSafety: 'వేదిక & భద్రత',
      aiChatbot: 'AI ఆరోగ్య చాట్‌బాట్',
      diseaseExplorer: 'వ్యాధుల డైరెక్టరీ',
      preventionGuides: 'నివారణ మార్గదర్శకాలు',
      vaccinationSchedules: 'టీకా షెడ్యూల్స్',
      healthyHabits: 'ఆరోగ్యకర అలవాట్లు & పోషణ',
      verifiedDirectory: 'ధృవీకరించబడిన వనరుల డైరెక్టరీ',
      aboutProject: 'ప్రాజెక్ట్ గురించి',
      privacyPolicy: 'గోప్యతా విధానం',
      termsOfService: 'సేవా నిబంధనలు',
      safetyAuditLogs: 'భద్రతా ఆడిట్ లాగ్స్',
      allRightsReserved: 'సర్వహక్కులు ప్రత్యేకించబడ్డాయి. ప్రపంచ ఆరోగ్య సంస్థ (WHO) మార్గదర్శకాల ఆధారంగా రూపొందించబడింది.',
      disclaimer: 'గమనిక: ఇది వైద్య సలహా కాదు. అత్యవసర పరిస్థితుల్లో 112 / 108 కు కాల్ చేయండి.',
    },
    auth: {
      signInTitle: 'హెల్త్‌వైజ్‌లోకి లాగిన్ అవ్వండి',
      signInSubtitle: 'మీరు సేవ్ చేసిన సంభాషణలు, బుక్‌మార్క్‌లు మరియు ప్రాధాన్యతలను యాక్సెస్ చేయండి.',
      signUpTitle: 'మీ ఖాతాను సృష్టించుకోండి',
      signUpSubtitle: 'సంభాషణలను భద్రపరచండి, వ్యాధి మార్గదర్శకాలను బుక్‌మార్క్ చేయండి మరియు మీ ప్రాధాన్యతలను సర్దుబాటు చేసుకోండి.',
      emailLabel: 'ఈమెయిల్ చిరునామా',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'పాస్‌వర్డ్',
      passwordPlaceholder: '••••••••',
      fullNameLabel: 'పూర్తి పేరు',
      fullNamePlaceholder: 'డా. జానకి రామ్',
      signInBtn: 'లాగిన్ చేయండి',
      signUpBtn: 'ఖాతా సృష్టించండి',
      oneClickTest: 'ఒక క్లిక్ టెస్ట్ లాగిన్',
      signInAsUser: 'వినియోగదారుగా లాగిన్',
      signInAsAdmin: 'అడ్మిన్‌గా లాగిన్',
      noAccount: 'ఖాతా లేదా?',
      hasAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      createOne: 'ఇప్పుడే కొత్త ఖాతా సృష్టించండి',
      signInInstead: 'లాగిన్ పేజీకి వెళ్లండి',
    },
    admin: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      knowledgeBase: 'జ్ఞాన భాండాగారం',
      sources: 'మూలాలు',
      contentReview: 'కంటెంట్ సమీక్ష',
      analytics: 'విశ్లేషణలు',
      feedback: 'ఫీడ్‌బ్యాక్',
      safetyLogs: 'భద్రతా లాగ్‌లు',
      settings: 'సెట్టింగ్‌లు',
      adminPortal: 'అడ్మిన్ పోర్టల్',
      backToApp: 'ప్రధాన యాప్‌కు తిరిగి వెళ్లండి',
      superAdminRole: 'పాత్ర: సూపర్ అడ్మినిస్ట్రేటర్',
      rlsEnforced: 'Supabase RLS ద్వారా రక్షించబడింది',
      overviewTitle: 'పరిపాలనా అవలోకనం',
      overviewSubtitle: 'ప్రజారోగ్య సమాచార సమగ్రత, RAG రిట్రీవల్ విశ్లేషణలు మరియు భద్రతా సమ్మతిని పర్యవేక్షించండి.',
      indexedDocs: 'ఇండెక్స్ చేయబడిన పత్రాలు',
      verifiedSources: 'ధృవీకరించబడిన మూలాలు',
      pendingReviews: 'సమీక్షలో ఉన్న కంటెంట్',
      safetyTriggers: 'రెడ్-ఫ్లాగ్ భద్రతా ట్రిగ్గర్లు',
      systemHealth: 'సిస్టమ్ స్థితి & RAG ఇండెక్స్ స్థితి',
      allServicesOp: 'అన్ని సేవలు సజావుగా పనిచేస్తున్నాయి',
      aiEngine: 'AI ఇంజిన్',
      databaseRls: 'డేటాబేస్ & RLS',
      safetyGuardrails: 'భద్రతా రక్షణలు',
      readyForInference: 'సేవకు సిద్ధంగా ఉంది',
      schemaMigrationsReady: 'స్కీమా మైగ్రేషన్లు సిద్ధంగా ఉన్నాయి',
      engineActive: '100% క్రియాశీలం',
    },
    common: {
      loading: 'లోడ్ అవుతోంది...',
      error: 'ఒక లోపం సంభవించింది',
      retry: 'మళ్ళీ ప్రయత్నించండి',
      save: 'భద్రపరచండి',
      cancel: 'రద్దు చేయండి',
      delete: 'తొలగించండి',
      edit: 'సవరించండి',
      close: 'మూసివేయండి',
      back: 'వెనుకకు',
      search: 'శోధించండి',
      noData: 'సమాచారం అందుబాటులో లేదు',
      comingSoon: 'త్వరలో అందుబాటులోకి వస్తుంది',
      educationalNotice: 'విద్యా సంబంధిత గమనిక:',
      educationalNoticeText: 'ఈ చాట్‌బాట్ విద్యా ప్రయోజనాల కోసం మాత్రమే సాధారణ ఆరోగ్య సమాచారాన్ని అందిస్తుంది. ఇది వైద్య నిర్ధారణ లేదా చికిత్సను అందించదు. వ్యక్తిగత వైద్య సలహా కోసం అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.',
      importantDisclaimer: 'ముఖ్యమైన వైద్య నిరాకరణ',
      importantDisclaimerText: 'ఈ చాట్‌బాట్ విద్యా ప్రయోజనాల కోసం మాత్రమే సాధారణ ఆరోగ్య సమాచారాన్ని అందిస్తుంది. ఇది వైద్య నిర్ధారణ లేదా చికిత్సను అందించదు. వ్యక్తిగత వైద్య సలహా కోసం అర్హత కలిగిన వైద్యుడిని సంప్రదించండి. అత్యవసర పరిస్థితుల్లో వెంటనే స్థానిక అత్యవసర సేవలను సంప్రదించండి.',
      zeroLatencyEscalation: 'తక్షణ అత్యవసర సూచన',
      callHotline: 'కాల్ చేయండి',
      allHotlines: 'అన్ని అంతర్జాతీయ హెల్ప్‌లైన్లు',
      hotlinesDirectoryTitle: 'అత్యవసర & సంక్షోభ హెల్ప్‌లైన్ల డైరెక్టరీ',
      hotlinesDirectoryDesc: 'అధికారిక జాతీయ అత్యవసర సేవలు మరియు సంక్షోభ సహాయ లైన్లు',
      searchHotlines: 'దేశం లేదా సేవ ద్వారా హెల్ప్‌లైన్లను శోధించండి...',
    },
  },

  hi: {
    nav: {
      home: 'होम',
      chat: 'चैट',
      diseases: 'रोग संदर्शिका',
      prevention: 'रोकथाम',
      vaccination: 'टीकाकरण',
      healthyHabits: 'स्वस्थ आदतें',
      resources: 'संसाधन',
      bookmarks: 'सहेजे गए',
      about: 'हमारे बारे में',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      admin: 'व्यवस्थापक कंसोल',
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      selectLanguage: 'भाषा चुनें',
      appTitle: 'हेल्थवाइज',
      appSubtitle: 'सार्वजनिक स्वास्थ्य जागरूकता',
    },
    chat: {
      title: 'हेल्थवाइज AI',
      evidenceGrounded: 'तथ्य आधारित',
      newChat: 'नई बातचीत',
      startTitle: 'स्वास्थ्य बातचीत शुरू करें',
      startDesc: 'रोग के लक्षण, रोकथाम के उपाय, टीकाकरण कार्यक्रम या पोषण संबंधी सलाह पूछें। सभी उत्तर विश्वसनीय WHO स्रोतों पर आधारित हैं।',
      placeholder: 'रोग, लक्षण, रोकथाम, टीके या पोषण के बारे में पूछें...',
      send: 'भेजें',
      disclaimer: 'केवल सामान्य स्वास्थ्य शिक्षा के लिए। व्यक्तिगत सलाह हेतु चिकित्सक से संपर्क करें।',
      analyzing: 'स्वास्थ्य साहित्य का विश्लेषण किया जा रहा है...',
      emergencyAlertTitle: 'आपातकालीन चेतावनी सलाह',
      sources: 'स्रोत:',
      askAI: 'AI से पूछें',
      emergencyHotlines: 'आपातकालीन हेल्पलाइन',
    },
    diseases: {
      badge: 'चिकित्सा संदर्शिका',
      title: 'रोग संदर्शिका एवं नैदानिक दिशानिर्देश',
      subtitle: 'विश्व स्वास्थ्य संगठन (WHO) के आधिकारिक दस्तावेज़ों पर आधारित संक्रामक और गैर-संक्रामक रोगों का प्रामाणिक विवरण।',
      searchPlaceholder: 'रोग, लक्षण या मुख्य शब्द खोजें (उदा. बुखार, डेंगू, रक्तचाप)...',
      filterBy: 'श्रेणी:',
      all: 'सभी',
      keySigns: 'प्रमुख नैदानिक लक्षण:',
      readGuide: 'विस्तृत मार्गदर्शिका पढ़ें',
      askAI: 'AI से पूछें',
      whoGrounded: 'WHO प्रमाणित',
      noResults: 'कोई स्वास्थ्य स्थिति नहीं मिली',
      noResultsDesc: 'कृपया अपना खोज शब्द या श्रेणी फ़िल्टर बदलकर पुनः प्रयास करें।',
    },
    diseaseDetail: {
      back: 'रोग संदर्शिका पर वापस जाएं',
      bookmark: 'सहेजें',
      bookmarked: 'सहेजा गया',
      share: 'साझा करें',
      linkCopied: 'लिंक कॉपी किया गया',
      askAI: 'AI से पूछें',
      reviewed: 'समीक्षा तिथि:',
      symptomsTitle: 'पहचाने गए नैदानिक लक्षण',
      symptomsSubtitle: 'स्वास्थ्य मानदंडों के अनुसार सामान्य लक्षण',
      warningSignsTitle: 'आपातकालीन चेतावनी संकेत (रेड-फ्लैग्स)',
      warningSignsSubtitle: 'गंभीर लक्षण जिनके लिए तत्काल अस्पताल देखभाल आवश्यक है',
      riskFactorsTitle: 'जोखिम कारक और संवेदनशीलता',
      riskFactorsSubtitle: 'रोग के प्रसार या गंभीरता को बढ़ाने वाली स्थितियां',
      preventionTitle: 'वैज्ञानिक रोकथाम के उपाय',
      preventionSubtitle: 'WHO द्वारा अनुशंसित निवारक प्रोटोकॉल',
      whenToSeekCareTitle: 'चिकित्सक से तत्काल कब संपर्क करें',
      ctaTitle: 'क्या आपके पास इस स्थिति के बारे में प्रश्न हैं?',
      ctaDesc: 'हमारे AI सहायक से लक्षणों, जोखिम न्यूनीकरण और नैदानिक परीक्षण के बारे में पूछें।',
      startConversation: 'बातचीत शुरू करें',
      relatedTitle: 'संबंधित अन्य रोग',
    },
    resources: {
      badge: 'विश्वसनीय संसाधन',
      title: 'विश्वसनीय स्वास्थ्य संसाधन एवं हेल्पलाइन',
      subtitle: 'आधिकारिक सरकारी स्वास्थ्य दिशानिर्देशों, सहकर्मी-समीक्षित रिपॉजिटरी और आपातकालीन नंबरों के सीधे लिंक।',
      emergencySectionTitle: 'आपातकालीन चिकित्सा हेल्पलाइन',
      emergencySectionDesc: 'किसी भी जानलेवा आपात स्थिति में तुरंत स्थानीय आपातकालीन सेवाओं को कॉल करें। चैटबॉट पर निर्भर न रहें।',
      callNow: 'कॉल करें',
      portalsTitle: 'आधिकारिक स्वास्थ्य पोर्टल एवं दिशानिर्देश',
      portalsSubtitle: 'सत्यापित नैदानिक डेटाबेस, निगरानी दिशानिर्देश और आधिकारिक तथ्य-पत्रक',
      searchPlaceholder: 'संसाधन खोजें...',
      visit: 'आधिकारिक पोर्टल पर जाएं',
      verified: 'सत्यापित',
    },
    bookmarks: {
      title: 'सहेजे गए स्वास्थ्य संसाधन',
      subtitle: 'सहेजे गए रोग तथ्य-पत्रक, निवारक दिशानिर्देशों और स्वास्थ्य पोर्टलों तक त्वरित पहुंच।',
      all: 'सभी',
      diseases: 'रोग',
      external: 'बाहरी संसाधन',
      emptyTitle: 'कोई बुकमार्क नहीं मिला',
      emptyDesc: 'आपने अभी तक कोई स्वास्थ्य मार्गदर्शिका सहेजी नहीं है। संदर्शिका देखें और सहेजने के लिए बुकमार्क पर क्लिक करें।',
      browseBtn: 'रोग संदर्शिका देखें',
      readGuide: 'मार्गदर्शिका पढ़ें',
      visitResource: 'संसाधन देखें',
      savedOn: 'सहेजा गया:',
      guestNotice: 'आप वर्तमान में अतिथि मोड में हैं। आपके बुकमार्क आपके स्थानीय ब्राउज़र में सहेजे गए हैं।',
      signInLink: 'सभी उपकरणों पर सिंक करने के लिए साइन इन करें',
    },
    safety: {
      mandatoryDisclaimer: '⚕️ यह केवल सामान्य शैक्षिक स्वास्थ्य जानकारी है। व्यक्तिगत चिकित्सकीय सलाह, निदान या उपचार के लिए लाइसेंस प्राप्त चिकित्सक से परामर्श लें।',
      emergencyEscalationTitle: '🚨 तत्काल चिकित्सा चेतावनी',
      emergencyEscalationMessage: 'आपके द्वारा बताए गए लक्षण जानलेवा आपात स्थिति का संकेत हो सकते हैं। तुरंत आपातकालीन सेवाओं (112 / 108 / 911) पर कॉल करें।',
    },
    home: {
      heroBadge: 'AI-सहायता प्राप्त सार्वजनिक स्वास्थ्य शिक्षा मंच',
      heroTitle: 'अपने स्वास्थ्य को समझें।',
      heroTitleHighlight: 'सटीक और सही निर्णय लें।',
      heroDesc: 'विश्व स्वास्थ्य संगठन (WHO) और मान्यता प्राप्त स्वास्थ्य संस्थानों की प्रामाणिक जानकारी पर आधारित AI मंच, जो सामान्य रोगों, जोखिम कारकों, रोकथाम और स्वस्थ जीवनशैली को समझाता है।',
      startChat: 'स्वास्थ्य बातचीत शुरू करें',
      exploreDiseases: 'रोग संदर्शिका देखें',
      whoCdcGrounded: 'WHO एवं CDC तथ्य आधारित',
      zeroHallucination: 'सटीक सुरक्षा दिशानिर्देश',
      strictSafety: 'सख्त गैर-नैदानिक सुरक्षा',
      assistantTitle: 'हेल्थवाइज AI सहायक',
      evidenceGrounded: 'तथ्य आधारित',
      demoUserQuery: 'डेंगू बुखार के शुरुआती लक्षण क्या हैं?',
      demoAiResponse: 'संक्रमण के 4-10 दिनों बाद आमतौर पर दिखने वाले मुख्य लक्षण:',
      demoRedFlag: 'आपातकालीन चेतावनी: पेट में तेज दर्द या लगातार उल्टी होने पर तुरंत अस्पताल जाएं।',
      demoSource: 'स्रोत: विश्व स्वास्थ्य संगठन (WHO)',
      educationalOnly: 'केवल शैक्षिक उद्देश्य',
      tryAsking: 'यह पूछें:',
      ctaBadge: 'सुलभ सार्वजनिक स्वास्थ्य शिक्षा',
      ctaTitle: 'किसी रोग या रोकथाम के बारे में प्रश्न हैं?',
      ctaDesc: 'लक्षणों, जोखिम कारकों और रोकथाम प्रोटोकॉल को समझने के लिए हमारे AI स्वास्थ्य सहायक के साथ गोपनीय बातचीत शुरू करें।',
      ctaChatBtn: 'अभी स्वास्थ्य बातचीत शुरू करें',
      ctaDiseasesBtn: 'रोग संदर्शिका ब्राउज़ करें',
      ctaDisclaimer: '* हेल्थवाइज AI सामान्य स्वास्थ्य जानकारी प्रदान करता है, यह कोई चिकित्सकीय निदान या उपचार नहीं देता।',

      // Platform Capabilities
      capBadge: 'प्लेटफ़ॉर्म क्षमताएं',
      capTitle: 'विश्वसनीय जनस्वास्थ्य शिक्षा के लिए निर्मित',
      capDesc: 'सर्वोच्च नैतिक और नैदानिक संचार मानकों को बनाए रखते हुए सटीक, समझने में आसान स्वास्थ्य जानकारी प्रदान करने के लिए प्रत्येक सुविधा तैयार की गई है।',
      capDiseaseEduTitle: 'रोग शिक्षा एवं समझदारी',
      capDiseaseEduDesc: 'संक्रामक और दीर्घकालिक रोगों के रोगजनन, प्रसार और जोखिम कारकों को सरल एवं स्पष्ट भाषा में समझें।',
      capSymptomsTitle: 'लक्षण बनाम रोग निदान',
      capSymptomsDesc: 'स्पष्ट सीमाएं: बिना निदान किए यह समझाता है कि लक्षण क्या संकेत दे सकते हैं, यह रेखांकित करते हुए कि केवल डॉक्टर ही निदान कर सकते हैं।',
      capPreventionTitle: 'तथ्य-आधारित रोकथाम',
      capPreventionDesc: 'मच्छर जनित रोग नियंत्रण, हाथ स्वच्छता मानक, वायु निस्यंदन और संक्रमण नियंत्रण पर व्यावहारिक रोकथाम दिशानिर्देश।',
      capVaccineTitle: 'टीकाकरण साक्षरता',
      capVaccineDesc: 'WHO दिशानिर्देशों से सत्यापित टीकाकरण कार्यक्रम, टीका सुरक्षा सिद्धांत, लक्षित आयु वर्ग और बूस्टर सिफारिशें।',
      capNutritionTitle: 'पोषण एवं संपूर्ण कल्याण',
      capNutritionDesc: 'चयापचय स्वास्थ्य, उच्च रक्तचाप नियंत्रण, जलयोजन और रोग प्रतिरोधक क्षमता के लिए सार्वजनिक स्वास्थ्य पोषण सिफारिशें।',
      capEmergencyTitle: 'रेड-फ्लैग आपातकालीन पहचान',
      capEmergencyDesc: 'खतरनाक लक्षणों (उदा. स्ट्रोक, तीव्र एनाफिलेक्सिस) की तत्काल पहचान करके उपयोगकर्ताओं को तुरंत आपातकालीन देखभाल हेतु निर्देशित करता है।',
      capStandard: 'सार्वजनिक स्वास्थ्य मानक',

      // Supported Topics
      topicsBadge: 'चयनित स्वास्थ्य ज्ञान',
      topicsTitle: 'समर्थित स्वास्थ्य विषय',
      topicsDesc: 'विश्व के अग्रणी सार्वजनिक स्वास्थ्य अधिकारियों से तैयार की गई तथ्य-आधारित मार्गदर्शिकाओं का अन्वेषण करें।',
      topicsViewAll: 'सभी विषय देखें',
      topicDengueName: 'डेंगू एवं वेक्टर-जनित रोग',
      topicDengueCategory: 'वेक्टर जनित रोग',
      topicDengueDesc: 'एडीज मच्छरों द्वारा फैलने वाला वायरल संक्रमण। लक्षणों की पहचान, महत्वपूर्ण जलयोजन प्रोटोकॉल और मच्छर नियंत्रण सीखें।',
      topicDengueBadge: 'WHO सत्यापित दिशानिर्देश',
      topicDiabetesName: 'टाइप 2 डायबिटीज मेलिटस',
      topicDiabetesCategory: 'दीर्घकालिक चयापचय विकार',
      topicDiabetesDesc: 'इंसुलिन संवेदनशीलता, प्रारंभिक संकेत, संतुलित पोषण और नियमित शारीरिक गतिविधि के बारे में व्यापक जागरूकता।',
      topicDiabetesBadge: 'तथ्य आधारित',
      topicHypertensionName: 'उच्च रक्तचाप (हाइपरटेंशन)',
      topicHypertensionCategory: 'हृदय स्वास्थ्य',
      topicHypertensionDesc: '"साइलेंट किलर" के रूप में जाना जाता है। रक्तचाप सीमा, आहार में नमक की कमी और तनाव प्रबंधन को समझें।',
      topicHypertensionBadge: 'नैदानिक प्रोटोकॉल',
      topicInfluenzaName: 'इन्फ्लूएंजा एवं श्वसन देखभाल',
      topicInfluenzaCategory: 'श्वसन संक्रमण',
      topicInfluenzaDesc: 'मौसमी फ्लू बनाम सामान्य सर्दी का अंतर, ड्रॉपलेट ट्रांसमिशन से बचाव और वार्षिक फ्लू टीके का महत्व।',
      topicInfluenzaBadge: 'CDC दिशानिर्देश',
      topicHygieneName: 'स्वच्छता, सैनिटेशन और सुरक्षित जल',
      topicHygieneCategory: 'संक्रमण रोकथाम',
      topicHygieneDesc: 'हाथ धोने के प्रोटोकॉल (WHO 6-चरणीय तकनीक), खाद्य स्वच्छता, सुरक्षित पेयजल प्रथाएं और पर्यावरणीय स्वच्छता।',
      topicHygieneBadge: 'निवारक मानक',
      topicVaccineName: 'अनिवार्य टीकाकरण',
      topicVaccineCategory: 'निवारक चिकित्सा',
      topicVaccineDesc: 'सार्वभौमिक टीकाकरण कार्यक्रम, शिशु टीके, वयस्क बूस्टर और टीकों की सुरक्षा से जुड़े तथ्यों की स्पष्टता।',
      topicVaccineBadge: 'आधिकारिक कार्यक्रम',
      topicReadGuide: 'नैदानिक मार्गदर्शिका पढ़ें',

      // How It Works
      howBadge: 'प्रणाली कार्यप्रणाली',
      howTitle: 'हेल्थवाइज AI कैसे कार्य करता है',
      howDesc: 'प्राकृतिक भाषा प्रसंस्करण, रिट्रीवल-ऑगमेंटेड जेनरेशन (RAG) और सख्त स्वास्थ्य सुरक्षा सीमाओं का 5-चरणीय पारदर्शी तंत्र।',
      howStep1Title: 'उपयोगकर्ता प्रश्न एवं NLP विश्लेषण',
      howStep1Desc: 'प्राकृतिक भाषा प्रसंस्करण उपयोगकर्ता के इनपुट का विश्लेषण करता है, जिससे आशय, चिकित्सीय इकाइयां, लक्षण और आपातकाल की पहचान होती है।',
      howStep2Title: 'तत्कालता एवं रेड-फ्लैग ट्राइएज',
      howStep2Desc: 'नियम-आधारित सुरक्षा ट्राइएज सामान्य खोज से पहले आपातकालीन लक्षणों (जैसे सीने में दर्द, स्ट्रोक के लक्षण) की जांच करता है।',
      howStep3Title: 'साक्ष्य पुनर्प्राप्ति (RAG)',
      howStep3Desc: 'रिट्रीवल-ऑगमेंटेड जेनरेशन आधिकारिक स्वास्थ्य ज्ञानकोषों (WHO, CDC, MoHFW) से सत्यापित अंशों को खोजता है।',
      howStep4Title: 'साक्ष्य-आधारित AI निष्कर्ष',
      howStep4Desc: 'Puter.js AI प्राप्त साक्ष्यों के आधार पर बिना किसी भ्रामक जानकारी के सरल भाषा में स्पष्ट व्याख्या तैयार करता है।',
      howStep5Title: 'सुरक्षा जांच एवं स्रोत उद्धरण',
      howStep5Desc: 'निदान-मुक्त नियमों को लागू करता है, आधिकारिक स्रोतों के उद्धरण संलग्न करता है और अनिवार्य अस्वीकरण शामिल करता है।',
      howVerifiedStep: 'सत्यापित चरण',

      // Trusted Sources
      sourcesBadge: 'विश्वसनीय स्रोत',
      sourcesTitle: 'सत्यापित वैश्विक स्वास्थ्य अधिकारियों द्वारा संकलित',
      sourcesDesc: 'हेल्थवाइज AI केवल आधिकारिक प्रकाशनों, तकनीकी रिपोर्टों और सहकर्मी-समीक्षित नैदानिक दिशानिर्देशों पर आधारित है।',
      sourceWhoType: 'वैश्विक सार्वजनिक स्वास्थ्य एजेंसी',
      sourceWhoDesc: 'अंतरराष्ट्रीय सार्वजनिक स्वास्थ्य प्राधिकरण जो रोग प्रकोप समाचार, तकनीकी निर्देश और टीकाकरण दिशानिर्देश प्रकाशित करता है।',
      sourceWhoCoverage: 'वैश्विक रोग वर्गीकरण, टीकाकरण कार्यक्रम, महामारी अलर्ट',
      sourceCdcType: 'संघीय सार्वजनिक स्वास्थ्य एजेंसी (USA)',
      sourceCdcDesc: 'संक्रामक रोगों, सामुदायिक रोकथाम कार्यक्रमों और पर्यावरणीय स्वास्थ्य पर विज्ञान-आधारित मार्गदर्शन।',
      sourceCdcCoverage: 'संक्रामक रोगजनक प्रबंधन, श्वसन संक्रमण, वेक्टर नियंत्रण',
      sourceMohfwType: 'राष्ट्रीय स्वास्थ्य मंत्रालय (भारत सरकार)',
      sourceMohfwDesc: 'राष्ट्रीय स्वास्थ्य नीतियां, वेक्टर जनित रोग नियंत्रण कार्यक्रम (NVBDCP), और सार्वभौमिक टीकाकरण कार्यक्रम (UIP)।',
      sourceMohfwCoverage: 'डेंगू एवं मलेरिया राष्ट्रीय दिशानिर्देश, UIP टीकाकरण अनुसूची, स्थानीय परामर्श',
      sourceNhsType: 'सार्वजनिक स्वास्थ्य प्रणाली',
      sourceNhsDesc: 'रोगी स्वास्थ्य स्थिति निर्देशिकाएं, लक्षण विवरण और नैदानिक ट्राइएज सिफारिशें।',
      sourceNhsCoverage: 'दीर्घकालिक रोग जीवनशैली प्रबंधन, लक्षण जांच प्रोटोकॉल',
      sourceCuratedAreas: 'संकलित ज्ञान क्षेत्र:',
      sourceAudited: 'ऑडिटेड मेटाडेटा एवं संस्करणित',
      sourceVisitPortal: 'पोर्टल पर जाएं',

      // Multilingual Showcase
      multiBadge: 'समावेशिता एवं पहुंच',
      multiTitle: 'बहुभाषी स्वास्थ्य साक्षरता',
      multiDesc: 'सार्वजनिक स्वास्थ्य जागरूकता तभी प्रभावी होती है जब लोग इसे अपनी मातृभाषा में समझ सकें। हेल्थवाइज AI बिना किसी नैदानिक त्रुटि या सुरक्षा समझौते के प्रामाणिक स्वास्थ्य शिक्षा प्रदान करता है।',
      multiPointEn: 'मानक वैश्विक चिकित्सा शब्दावली और अंतरराष्ट्रीय सहमति।',
      multiPointTe: 'क्षेत्रीय जन जागरूकता के लिए उपयुक्त क्षेत्रीय भाषा में व्याख्या।',
      multiPointHi: 'ग्रामीण और शहरी दोनों क्षेत्रों में व्यापक राष्ट्रीय पहुंच।',
      multiTryChat: 'इस भाषा में स्वास्थ्य चैट शुरू करें',

      // FAQ Section
      faqBadge: 'सामान्य प्रश्न',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
      faqDesc: 'समझें कि हमारा AI जनस्वास्थ्य सहायक कैसे काम करता है और हम किन सुरक्षा सीमाओं का पालन करते हैं।',
      faqQ1: 'क्या हेल्थवाइज AI किसी डॉक्टर या नैदानिक परामर्श की जगह ले सकता है?',
      faqA1: 'बिल्कुल नहीं। हेल्थवाइज AI स्वास्थ्य साक्षरता, रोग जागरूकता और निवारक स्वच्छता में सुधार के लिए डिज़ाइन किया गया एक शैक्षिक मंच है। यह कभी भी रोगों का निदान नहीं करता, दवाएं नहीं लिखता, और न ही किसी चिकित्सक के परामर्श का विकल्प है।',
      faqQ2: 'क्या चैटबॉट लक्षणों के आधार पर बीमारी का निदान कर सकता है या दवा की खुराक बता सकता है?',
      faqA2: 'नहीं। यह प्रणाली किसी भी बीमारी का निदान करने या दवाओं की खुराक निर्धारित करने से सख्ती से मना करती है। यह केवल समझाती है कि विभिन्न लक्षणों का चिकित्सा साहित्य में क्या अर्थ है और डॉक्टर से कब संपर्क करना चाहिए।',
      faqQ3: 'यह मंच AI के भ्रामक उत्तरों (hallucinations) को कैसे रोकता है?',
      faqA3: 'हेल्थवाइज AI रिट्रीवल-ऑगमेंटेड जेनरेशन (RAG) का उपयोग करता है। प्रतिक्रिया देने से पहले विश्व स्वास्थ्य संगठन (WHO), CDC के डेटाबेस से सत्यापित साक्ष्य प्राप्त किए जाते हैं। यदि पर्याप्त साक्ष्य नहीं हैं, तो AI उत्तर गढ़ने के बजाय अपनी सीमा स्पष्ट कर देता है।',
      faqQ4: 'यदि मैं किसी जानलेवा लक्षण के बारे में पूछूं तो क्या होगा?',
      faqA4: 'सुरक्षा प्रणाली सीने में तेज दर्द, स्ट्रोक के लक्षण (FAST) या सांस लेने में भारी तकलीफ जैसे आपातकालीन संकेतों की लगातार निगरानी करती है। ऐसे लक्षण मिलने पर तुरंत आपातकालीन चेतावनी दी जाती है और स्थानीय आपातकालीन सेवाओं से संपर्क करने का निर्देश दिया जाता है।',
      faqQ5: 'क्या मेरी व्यक्तिगत स्वास्थ्य जानकारी सहेजी या बेची जाती है?',
      faqA5: 'हम आपकी गोपनीयता का पूर्ण सम्मान करते हैं। हम बातचीत से कोई व्यक्तिगत चिकित्सीय प्रोफ़ाइल नहीं बनाते हैं और आप अपनी बातचीत कभी भी हटा सकते हैं। केवल शैक्षिक प्रभाव के मूल्यांकन के लिए अनाम डेटा ट्रैक किया जाता है।',
      faqQ6: 'क्या मुझे भुगतान करना होगा या OpenAI/Anthropic API कुंजी देनी होगी?',
      faqA6: 'नहीं। यह मंच Puter.js से जुड़ा हुआ है, जो उपयोगकर्ताओं या डेवलपर्स को व्यक्तिगत API कुंजी के बिना सीधे सर्वरलेस AI सेवाएं प्रदान करता है।',
    },
    footer: {
      emergencyWarningTitle: 'आपातकालीन चिकित्सा चेतावनी',
      emergencyWarningText: 'यदि आपको सीने में तेज दर्द, सांस लेने में तकलीफ या जानलेवा स्थिति महसूस हो रही है, तो तुरंत आपातकालीन सेवाओं (112 / 108 / 911) पर कॉल करें।',
      emergencyContactsBtn: 'आपातकालीन संपर्क',
      brandDesc: 'रोग शिक्षा, निवारक देखभाल और स्वास्थ्य साक्षरता को बढ़ावा देने वाला AI-संचालित जनस्वास्थ्य मंच।',
      evidenceBasedEducation: 'तथ्य-आधारित शिक्षा',
      exploreHealth: 'स्वास्थ्य अन्वेषण',
      trustedSources: 'विश्वसनीय स्रोत',
      platformSafety: 'मंच एवं सुरक्षा',
      aiChatbot: 'AI स्वास्थ्य चैटबॉट',
      diseaseExplorer: 'रोग संदर्शिका',
      preventionGuides: 'रोकथाम दिशानिर्देश',
      vaccinationSchedules: 'टीकाकरण कार्यक्रम',
      healthyHabits: 'स्वस्थ आदतें और पोषण',
      verifiedDirectory: 'सत्यापित संसाधन संदर्शिका',
      aboutProject: 'परियोजना के बारे में',
      privacyPolicy: 'गोपनीयता नीति',
      termsOfService: 'सेवा की शर्तें',
      safetyAuditLogs: 'सुरक्षा ऑडिट लॉग्स',
      allRightsReserved: 'सर्वाधिकार सुरक्षित। विश्व स्वास्थ्य संगठन (WHO) के दिशानिर्देशों पर आधारित।',
      disclaimer: 'अस्वीकरण: चिकित्सकीय सलाह नहीं है। आपात स्थिति के लिए 112 / 108 पर कॉल करें।',
    },
    auth: {
      signInTitle: 'हेल्थवाइज में साइन इन करें',
      signInSubtitle: 'अपनी सहेजी गई बातचीत, बुकमार्क और प्राथमिकताओं तक पहुंचें।',
      signUpTitle: 'अपना खाता बनाएं',
      signUpSubtitle: 'बातचीत सहेजें, रोग संदर्शिका बुकमार्क करें और अपनी प्राथमिकताएं सेट करें।',
      emailLabel: 'ईमेल पता',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'पासवर्ड',
      passwordPlaceholder: '••••••••',
      fullNameLabel: 'पूरा नाम',
      fullNamePlaceholder: 'डॉ. रमेश शर्मा',
      signInBtn: 'साइन इन करें',
      signUpBtn: 'खाता बनाएं',
      oneClickTest: 'त्वरित वन-क्लिक टेस्ट लॉगिन',
      signInAsUser: 'उपयोगकर्ता के रूप में साइन इन',
      signInAsAdmin: 'व्यवस्थापक के रूप में साइन इन',
      noAccount: 'क्या आपके पास खाता नहीं है?',
      hasAccount: 'पहले से ही एक खाता है?',
      createOne: 'अभी नया खाता बनाएं',
      signInInstead: 'इसके बजाय साइन इन करें',
    },
    admin: {
      dashboard: 'डैशबोर्ड',
      knowledgeBase: 'ज्ञानकोष',
      sources: 'स्रोत',
      contentReview: 'सामग्री समीक्षा',
      analytics: 'एनालिटिक्स',
      feedback: 'प्रतिक्रिया',
      safetyLogs: 'सुरक्षा लॉग्स',
      settings: 'सेटिंग्स',
      adminPortal: 'व्यवस्थापक पोर्टल',
      backToApp: 'मुख्य ऐप पर वापस जाएं',
      superAdminRole: 'भूमिका: सुपर एडमिनिस्ट्रेटर',
      rlsEnforced: 'Supabase RLS द्वारा सुरक्षित',
      overviewTitle: 'प्रशासनिक अवलोकन',
      overviewSubtitle: 'जनस्वास्थ्य ज्ञान अखंडता, RAG पुनर्प्राप्ति और सुरक्षा अनुपालन की निगरानी करें।',
      indexedDocs: 'इंडेक्स किए गए दस्तावेज़',
      verifiedSources: 'सत्यापित स्रोत',
      pendingReviews: 'लंबित सामग्री समीक्षाएं',
      safetyTriggers: 'रेड-फ्लैग सुरक्षा ट्रिगर्स',
      systemHealth: 'सिस्टम स्वास्थ्य एवं RAG इंडेक्स स्थिति',
      allServicesOp: 'सभी सेवाएं सुचारू रूप से चालू हैं',
      aiEngine: 'AI इंजन',
      databaseRls: 'डेटाबेस एवं RLS',
      safetyGuardrails: 'सुरक्षा दिशानिर्देश',
      readyForInference: 'सेवा के लिए तैयार',
      schemaMigrationsReady: 'स्कीमा माइग्रेशन तैयार हैं',
      engineActive: '100% सक्रिय',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'एक त्रुटि हुई',
      retry: 'पुनः प्रयास करें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      close: 'बंद करें',
      back: 'वापस जाएं',
      search: 'खोजें',
      noData: 'कोई डेटा उपलब्ध नहीं है',
      comingSoon: 'जल्द आ रहा है',
      educationalNotice: 'शैक्षिक सूचना:',
      educationalNoticeText: 'यह चैटबॉट केवल शैक्षिक उद्देश्यों के लिए सामान्य स्वास्थ्य जानकारी प्रदान करता है। यह कोई चिकित्सीय निदान या उपचार नहीं देता। व्यक्तिगत चिकित्सीय सलाह के लिए योग्य चिकित्सक से परामर्श लें।',
      importantDisclaimer: 'महत्वपूर्ण चिकित्सा अस्वीकरण',
      importantDisclaimerText: 'यह चैटबॉट केवल शैक्षिक उद्देश्यों के लिए सामान्य स्वास्थ्य जानकारी प्रदान करता है। यह कोई चिकित्सीय निदान या उपचार नहीं देता। व्यक्तिगत चिकित्सीय सलाह के लिए योग्य चिकित्सक से परामर्श लें। किसी भी आपात स्थिति में तुरंत स्थानीय आपातकालीन सेवाओं से संपर्क करें।',
      zeroLatencyEscalation: 'तत्काल आपातकालीन वृद्धि',
      callHotline: 'कॉल करें',
      allHotlines: 'सभी अंतरराष्ट्रीय हेल्पलाइन',
      hotlinesDirectoryTitle: 'आपातकालीन एवं संकट हेल्पलाइन निर्देशिका',
      hotlinesDirectoryDesc: 'आधिकारिक राष्ट्रीय आपातकालीन सेवाएं और संकट सहायता लाइनें',
      searchHotlines: 'देश या सेवा के अनुसार हेल्पलाइन खोजें...',
    },
  },
};
