/**
 * HealthWise AI — Disease Directory Service
 *
 * Provides evidence-based clinical guides and disease awareness summaries.
 * Built on official World Health Organization (WHO) and international health guidelines.
 *
 * Dual-mode support:
 * - Supabase PostgreSQL `public.diseases` table
 * - Resilient offline/local fallback with authentic WHO-grounded dataset
 */

import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { Disease } from '../../types/database';

export const SEEDED_DISEASES: Disease[] = [
  {
    id: 'disease-dengue',
    slug: 'dengue',
    name: 'Dengue Fever & Severe Dengue',
    category: 'Vector-Borne',
    overview:
      'Dengue is a viral infection transmitted to humans through the bites of infected female Aedes mosquitoes (predominantly Aedes aegypti). It is widespread throughout tropical and sub-tropical climates worldwide. While most infections cause mild flu-like symptoms, severe dengue is a potentially lethal complication resulting in plasma leakage, fluid accumulation, respiratory distress, and severe bleeding.',
    symptoms: [
      'Sudden high fever (reaching 40°C / 104°F)',
      'Severe headache and intense retro-orbital (behind the eyes) pain',
      'Generalized muscle and severe joint pains ("breakbone fever")',
      'Nausea, persistent vomiting, and loss of appetite',
      'Swollen lymph glands and characteristic maculopapular rash',
    ],
    warning_signs: [
      'Severe abdominal pain or persistent tenderness',
      'Persistent vomiting (at least 3 episodes in 24 hours)',
      'Mucosal bleeding (gums, nose, blood in stool or vomit)',
      'Extreme lethargy, restlessness, or sudden confusion',
      'Rapid, labored breathing and sudden drop in blood pressure',
    ],
    risk_factors: [
      'Living in or traveling to tropical and sub-tropical endemic regions',
      'Secondary infection with a different dengue virus serotype (greatly heightens severe dengue risk)',
      'Infancy and advanced age with reduced physiological reserve',
      'Underlying conditions including diabetes, hypertension, and asthma',
    ],
    prevention: [
      'Eliminate standing water weekly from flower vases, containers, buckets, and discarded tires',
      'Apply DEET, Picaridin, or IR3535 insect repellent to exposed skin',
      'Install fine wire mesh screens on windows and doors',
      'Wear light-colored, long-sleeved clothing during peak mosquito activity (early morning and late afternoon)',
      'Support community vector surveillance and larviciding programs',
    ],
    when_to_seek_care:
      'Consult a doctor immediately upon developing acute high fever in a known dengue transmission zone. If any WARNING SIGNS emerge (such as severe abdominal pain, persistent vomiting, or mucosal bleeding) during the critical defervescence phase (days 3–7 as fever drops), seek emergency hospital admission without delay.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue',
    last_reviewed: '2025-08-21',
    created_at: '2025-08-21T00:00:00Z',
    updated_at: '2026-01-12T18:11:32Z',
  },
  {
    id: 'disease-diabetes',
    slug: 'diabetes',
    name: 'Type 2 Diabetes Mellitus',
    category: 'Metabolic & Endocrine',
    overview:
      'Type 2 diabetes is a chronic noncommunicable disorder characterized by elevated blood glucose levels (hyperglycemia) resulting from the body becoming resistant to insulin or failing to produce sufficient insulin. Over time, poorly controlled diabetes causes extensive damage to the heart, blood vessels, eyes, kidneys, and peripheral nerves.',
    symptoms: [
      'Excessive thirst (polydipsia) and dry mouth',
      'Frequent urination (polyuria), particularly at night',
      'Persistent fatigue, low energy, and muscle weakness',
      'Unexplained weight loss despite increased appetite',
      'Blurred vision and frequent or slow-healing skin infections',
    ],
    warning_signs: [
      'Kussmaul breathing (deep, rapid respiration) signaling diabetic ketoacidosis',
      'Sweet, fruity odor on breath accompanied by persistent vomiting',
      'Confusion, extreme drowsiness, dizziness, or loss of consciousness',
      'Severe hypoglycemia (blood sugar <70 mg/dL with tremors, sweating, palpitations)',
      'Non-healing diabetic foot ulcers with signs of local infection or blackened tissue',
    ],
    risk_factors: [
      'Overweight or obesity, particularly abdominal visceral adiposity (waist circumference)',
      'Physical inactivity and sedentary lifestyle habits',
      'Family history of diabetes in first-degree relatives',
      'Age 45 or older, though increasingly diagnosed in young adults and adolescents',
      'History of gestational diabetes or polycystic ovary syndrome (PCOS)',
    ],
    prevention: [
      'Maintain a healthy body weight through calorie moderation and whole-food nutrition',
      'Engage in at least 150 minutes of moderate-intensity physical activity (brisk walking, cycling) per week',
      'Adopt a dietary pattern rich in dietary fiber, vegetables, and legumes while strictly minimizing added sugars and refined starches',
      'Avoid all forms of tobacco use, which compounds cardiovascular disease risk',
      'Participate in periodic fasting blood glucose or HbA1c screening if risk factors are present',
    ],
    when_to_seek_care:
      'Schedule a routine primary care medical checkup for persistent thirst, unusual fatigue, or unexplained weight loss. Seek emergency hospital care if experiencing rapid breathing, fruity breath, disorientation, or sudden neurological deficits indicative of hyperosmolar hyperglycemic state or ketoacidosis.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
    last_reviewed: '2024-11-14',
    created_at: '2024-11-14T00:00:00Z',
    updated_at: '2025-06-10T12:00:00Z',
  },
  {
    id: 'disease-hypertension',
    slug: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    overview:
      'Hypertension (high blood pressure) is diagnosed when systolic blood pressure is persistently ≥140 mmHg or diastolic blood pressure is persistently ≥90 mmHg. Often called the "silent killer" because it typically produces no early symptoms, hypertension is the single leading preventable cause of cardiovascular disease, myocardial infarction, heart failure, and stroke globally.',
    symptoms: [
      'Typically asymptomatic in early and moderate stages ("silent killer")',
      'Early morning occipital headaches when blood pressure is markedly elevated',
      'Occasional lightheadedness, vertigo, or mild dizziness',
      'Tinnitus (buzzing or ringing in the ears)',
      'Visual disturbances or epistaxis (nosebleeds) in severe cases',
    ],
    warning_signs: [
      'Hypertensive crisis (BP ≥180/120 mmHg) accompanied by severe chest pressure',
      'Sudden onset severe shortness of breath or pulmonary congestion',
      'Severe neurological symptoms: sudden facial droop, arm weakness, or slurred speech',
      'Sudden "thunderclap" headache or acute alteration in mental orientation',
      'Acute blurred vision or sudden partial loss of vision',
    ],
    risk_factors: [
      'High dietary sodium intake (>2 grams sodium or 5 grams salt per day)',
      'Low dietary potassium consumption (inadequate fruits and vegetables)',
      'Physical inactivity and chronic psychological stress',
      'Excessive alcohol consumption and tobacco use',
      'Advancing age, family history, and coexisting metabolic syndrome or renal impairment',
    ],
    prevention: [
      'Limit salt intake to less than 1 teaspoon (5 grams) per day across all prepared meals',
      'Adopt the DASH (Dietary Approaches to Stop Hypertension) dietary pattern rich in fruits, vegetables, and low-fat dairy',
      'Engage in regular aerobic exercise for 30 minutes daily on most days of the week',
      'Maintain or achieve a body mass index (BMI) within the healthy range (18.5–24.9 kg/m²)',
      'Monitor blood pressure routinely at home or local pharmacy clinics',
    ],
    when_to_seek_care:
      'Have blood pressure checked by a medical provider at least once every 1–2 years if normal, or more frequently if borderline. Seek immediate emergency care (dial 112/911) if blood pressure exceeds 180/120 mmHg or is accompanied by chest pain, shortness of breath, numbness, or visual impairment.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension',
    last_reviewed: '2024-03-16',
    created_at: '2024-03-16T00:00:00Z',
    updated_at: '2025-05-18T10:00:00Z',
  },
  {
    id: 'disease-malaria',
    slug: 'malaria',
    name: 'Malaria (Plasmodium Infection)',
    category: 'Vector-Borne',
    overview:
      'Malaria is a life-threatening, acute febrile illness caused by Plasmodium parasites (primarily P. falciparum and P. vivax) transmitted through the bites of infected female Anopheles mosquitoes. P. falciparum causes the vast majority of severe malaria and fatalities. Prompt diagnosis via rapid diagnostic tests (RDTs) or microscopy, coupled with artemisinin-based combination therapy (ACT), is life-saving.',
    symptoms: [
      'Paroxysms of high fever preceded by rigorous, shaking chills',
      'Profuse sweating as body temperature abruptly declines',
      'Severe headache, generalized myalgia, and body fatigue',
      'Nausea, vomiting, and abdominal discomfort',
      'Mild jaundice (yellowing of sclera) and pallor due to hemolytic anemia',
    ],
    warning_signs: [
      'Cerebral malaria: impaired consciousness, delirium, or repetitive generalized seizures',
      'Severe anemia: extreme pallor, rapid heart rate, and profound exhaustion',
      'Acute respiratory distress syndrome (acidotic breathing or pulmonary edema)',
      'Spontaneous bleeding or disseminated intravascular coagulation',
      'Dark, tea-colored urine ("blackwater fever") indicating massive intravascular hemolysis',
    ],
    risk_factors: [
      'Residing in or visiting malaria-endemic tropical regions (Sub-Saharan Africa, South Asia, Amazon basin)',
      'Infants and children under 5 years of age (highest mortality vulnerability)',
      'Pregnant women, who suffer increased risk of maternal anemia and low birth weight',
      'Non-immune travelers lacking pre-existing semi-immunity',
    ],
    prevention: [
      'Sleep under insecticide-treated mosquito nets (ITNs / LLINs) every single night',
      'Support indoor residual spraying (IRS) with approved insecticides',
      'Take recommended antimalarial chemoprophylaxis when traveling to high-transmission areas',
      'Apply tropical-strength mosquito repellents to exposed skin during evening and night biting hours',
      'Administer the WHO-recommended malaria vaccines (RTS,S/AS01 or R21/Matrix-M) for eligible children in endemic areas',
    ],
    when_to_seek_care:
      'Seek clinical evaluation and blood testing within 24 hours of fever onset if you live in or have recently traveled to a malaria-endemic region. Severe symptoms (seizures, altered mental status, dark urine, or severe breathlessness) are medical emergencies requiring immediate parenteral antimalarial therapy.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/malaria',
    last_reviewed: '2024-12-04',
    created_at: '2024-12-04T00:00:00Z',
    updated_at: '2025-06-12T14:00:00Z',
  },
  {
    id: 'disease-influenza',
    slug: 'influenza',
    name: 'Seasonal Influenza (Flu)',
    category: 'Respiratory',
    overview:
      'Influenza is an acute respiratory viral infection caused by influenza viruses (types A and B) circulating globally. It spreads readily via airborne droplets generated by coughing or sneezing, and by contaminated surfaces. While most people recover within one to two weeks without medical treatment, influenza can cause severe disease, secondary bacterial pneumonia, and death in high-risk individuals.',
    symptoms: [
      'Sudden onset of high fever (often 38°C–40°C / 100°F–104°F)',
      'Prominent dry, hacking cough and sore throat',
      'Severe generalized myalgia, back pain, and muscle soreness',
      'Moderate to severe headache and painful eye movement',
      'Profound fatigue, malaise, and loss of appetite lasting up to 2 weeks',
    ],
    warning_signs: [
      'Shortness of breath, rapid breathing, or chest pain during respiration',
      'Bluish discoloration of the lips or fingernail beds (hypoxia)',
      'Persistent dizziness, confusion, or difficulty awakening',
      'Fever that resolves for 24–48 hours then returns worse with a productive purulent cough (secondary bacterial infection)',
      'Inability to drink or retain fluids leading to acute dehydration',
    ],
    risk_factors: [
      'Adults aged 65 years and older',
      'Children younger than 59 months, particularly under 2 years',
      'Pregnant women at all stages of pregnancy',
      'Individuals with underlying chronic health conditions (asthma, COPD, heart disease, diabetes)',
      'Healthcare workers with elevated viral exposure',
    ],
    prevention: [
      'Receive an annual seasonal influenza vaccination before peak transmission season',
      'Practice diligent hand hygiene with soap and water or alcohol-based hand rub',
      'Cover coughs and sneezes into a tissue or bent elbow (respiratory etiquette)',
      'Stay home when symptomatic to prevent transmission in schools and workplaces',
      'Clean frequently touched surfaces in shared home and office environments',
    ],
    when_to_seek_care:
      'Consult a primary care doctor if symptoms fail to improve after 5–7 days or if you belong to a high-risk group (early antiviral treatment within 48 hours is beneficial). Seek emergency care immediately for difficulty breathing, chest pain, confusion, or blue lips.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/influenza-(seasonal)',
    last_reviewed: '2024-10-03',
    created_at: '2024-10-03T00:00:00Z',
    updated_at: '2025-09-15T11:00:00Z',
  },
  {
    id: 'disease-tuberculosis',
    slug: 'tuberculosis',
    name: 'Tuberculosis (TB)',
    category: 'Infectious & Respiratory',
    overview:
      'Tuberculosis (TB) is a contagious bacterial infection caused by Mycobacterium tuberculosis that primarily attacks the lungs (pulmonary TB), though it can affect other organs (extrapulmonary TB). It is transmitted through airborne droplets when individuals with active pulmonary TB cough, sneeze, or spit. TB is curable and preventable with standard multi-drug antibiotic regimens.',
    symptoms: [
      'Persistent cough lasting 3 weeks or longer',
      'Hemoptysis (coughing up blood or blood-streaked sputum)',
      'Drenching night sweats and recurrent low-grade fever',
      'Unexplained progressive weight loss and profound anorexia',
      'Chronic chest pain exacerbated by coughing or deep breathing',
    ],
    warning_signs: [
      'Massive hemoptysis (coughing up large volumes of blood)',
      'Severe respiratory distress or acute shortness of breath at rest',
      'Neurological signs (neck stiffness, confusion) signaling TB meningitis',
      'Severe medication intolerance: yellowing skin/eyes (drug-induced hepatotoxicity)',
      'Profound wasting and cachexia',
    ],
    risk_factors: [
      'People living with HIV (TB is the leading cause of death among HIV patients)',
      'Close contact with an individual with untreated active pulmonary TB',
      'Under-nutrition, diabetes mellitus, and chronic immunosuppression',
      'Tobacco smoking and heavy alcohol consumption',
      'Living in crowded, poorly ventilated residential conditions',
    ],
    prevention: [
      'Administer the BCG (Bacillus Calmette-Guérin) vaccine to newborns in high-burden countries',
      'Ensure early diagnosis, sputum testing (GeneXpert), and full completion of prescribed antibiotic courses',
      'Provide TB preventive treatment (TPT) for household contacts and individuals with HIV',
      'Ensure adequate natural ventilation and infection control measures in health facilities',
      'Adopt good cough hygiene and wear appropriate masks in high-risk settings',
    ],
    when_to_seek_care:
      'Seek medical evaluation for any cough persisting beyond 2–3 weeks, especially if accompanied by night sweats or weight loss. Seek emergency medical attention for coughing up visible blood or acute breathlessness.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis',
    last_reviewed: '2024-10-29',
    created_at: '2024-10-29T00:00:00Z',
    updated_at: '2025-08-20T10:00:00Z',
  },
  {
    id: 'disease-pneumonia',
    slug: 'pneumonia',
    name: 'Pneumonia (Lower Respiratory Infection)',
    category: 'Respiratory',
    overview:
      'Pneumonia is an acute lower respiratory infection of the lung parenchyma caused by bacteria (such as Streptococcus pneumoniae), viruses (such as RSV and influenza), or fungi. The alveoli (air sacs) become inflamed and fill with pus and fluid, which makes breathing painful and severely limits oxygen exchange. Pneumonia is the single largest infectious cause of death in children worldwide.',
    symptoms: [
      'Cough producing green, yellow, or rusty-colored mucus',
      'High fever accompanied by shaking chills and diaphoresis',
      'Shortness of breath and rapid, shallow breathing',
      'Sharp or stabbing pleuritic chest pain that worsens with deep breathing or coughing',
      'Loss of appetite, fatigue, and confusion (particularly in elderly adults)',
    ],
    warning_signs: [
      'Severe respiratory distress: chest indrawing (retraction of chest wall on inhale)',
      'Central cyanosis: blue or pale lips, gums, or nail beds signaling low oxygen',
      'Inability to drink, persistent vomiting, or convulsions (in young children)',
      'Oxygen saturation (SpO2) dropping below 92% on room air',
      'Hypotension and septic shock symptoms (cold, clammy skin, confusion)',
    ],
    risk_factors: [
      'Children aged 2 years or younger and adults aged 65 years or older',
      'Immunocompromised state (malnutrition, HIV, immunosuppressive therapy)',
      'Pre-existing chronic lung diseases (asthma, COPD, bronchiectasis)',
      'Exposure to indoor air pollution from biomass fuels or tobacco smoke',
      'Recent viral upper respiratory illness compromising mucosal defenses',
    ],
    prevention: [
      'Immunization with Pneumococcal conjugate vaccine (PCV), Hib, and Influenza vaccines',
      'Exclusive breastfeeding for the first 6 months of life to build infant immune defenses',
      'Adequate childhood nutrition and addressing low birth weight',
      'Reducing household air pollution through clean cooking technologies and smoke-free homes',
      'Frequent hand hygiene to minimize pathogen transmission',
    ],
    when_to_seek_care:
      'Consult a physician urgently for any persistent fever and productive cough with chest discomfort. Seek emergency hospital care immediately if breathing becomes fast or labored, chest indrawing occurs, lips turn blue, or confusion develops.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/pneumonia',
    last_reviewed: '2024-11-12',
    created_at: '2024-11-12T00:00:00Z',
    updated_at: '2025-07-08T12:00:00Z',
  },
  {
    id: 'disease-waterborne-diarrhea',
    slug: 'waterborne-diarrhea',
    name: 'Waterborne Diarrheal Diseases & Cholera',
    category: 'Infectious & Waterborne',
    overview:
      'Diarrheal disease is the passage of 3 or more loose or liquid stools per day. It is caused by bacterial (Vibrio cholerae, Shigella, E. coli), viral (Rotavirus), or parasitic pathogens transmitted via ingestion of contaminated water, food, or poor hand hygiene. The main danger is acute dehydration and electrolyte depletion, which can be rapidly fatal in young children if oral rehydration therapy is delayed.',
    symptoms: [
      'Frequent watery or loose stools (in cholera, copious "rice-water" stools)',
      'Abdominal cramps and rumbling',
      'Nausea and vomiting',
      'Low-grade fever and dry mouth',
      'Signs of mild dehydration: increased thirst, dry mucous membranes, reduced urine output',
    ],
    warning_signs: [
      'Signs of severe dehydration: sunken eyes, skin that pinches back very slowly (>2 seconds)',
      'Lethargy, unresponsiveness, or unconsciousness',
      'Anuria (no urination for 6–8 hours)',
      'Rapid, weak pulse and low blood pressure (hypovolemic shock)',
      'Gross blood in the stool (dysentery, suggesting invasive bacterial infection)',
    ],
    risk_factors: [
      'Lack of access to safe drinking water and safely managed sanitation facilities',
      'Poor hand hygiene practices after defecation and before food preparation',
      'Malnutrition and micronutrient deficiencies (especially zinc and vitamin A)',
      'Infants who are not exclusively breastfed',
      'Displaced populations living in crowded camps or flood-affected regions',
    ],
    prevention: [
      'Drink and use only safe, treated, or boiled water',
      'Wash hands thoroughly with soap and running water at critical times (after toilet, before eating)',
      'Administer Rotavirus vaccination to all eligible infants',
      'Administer Oral Cholera Vaccine (OCV) in endemic and outbreak-prone settings',
      'Promote proper food safety: cook food thoroughly and store protected from flies',
    ],
    when_to_seek_care:
      'Begin oral rehydration solution (ORS) immediately at home upon diarrhea onset. Seek urgent medical care if diarrhea persists beyond 48 hours, high fever develops, stools contain visible blood, or signs of dehydration (sunken eyes, lethargy, lack of tears) appear.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease',
    last_reviewed: '2024-05-02',
    created_at: '2024-05-02T00:00:00Z',
    updated_at: '2025-06-15T15:00:00Z',
  },
  {
    id: 'disease-measles',
    slug: 'measles',
    name: 'Measles (Rubeola Virus)',
    category: 'Vaccine-Preventable',
    overview:
      'Measles is an extremely contagious, airborne disease caused by a virus in the paramyxovirus family. The virus infects the respiratory tract then spreads throughout the body. It spreads when an infected person breathes, coughs, or sneezes, and the virus can remain infectious in the air for up to two hours. Vaccination with two doses of measles-containing vaccine (MCV) provides lifelong protection.',
    symptoms: [
      'High fever (often >39°C / 102°F) beginning 10–12 days after exposure',
      'The "3 Cs": prominent Cough, Coryza (runny nose), and Conjunctivitis (red, watery eyes)',
      'Koplik spots: tiny white spots with red halos inside the mouth on inner cheeks',
      'Maculopapular erythematous rash starting on the face and behind ears, spreading down the body',
      'General malaise, photophobia (sensitivity to light), and loss of appetite',
    ],
    warning_signs: [
      'Severe secondary bacterial pneumonia (leading cause of measles death)',
      'Acute encephalitis: high fever, severe headache, convulsions, or coma',
      'Severe diarrhea and secondary dehydration',
      'Corneal ulceration and blindness (exacerbated by vitamin A deficiency)',
      'Stridor and croup (severe swelling of the upper airway)',
    ],
    risk_factors: [
      'Unvaccinated individuals (particularly children under 5 years)',
      'Vitamin A deficiency, which severely elevates blindness and mortality rates',
      'Malnutrition and compromised cell-mediated immunity',
      'Pregnant women who contract measles risk miscarriage or premature labor',
      'Communities with vaccine coverage rates below 95% (herd immunity threshold)',
    ],
    prevention: [
      'Receive 2 doses of the Measles-Rubella (MR) or MMR vaccine as per national immunization schedule',
      'Administer high-dose Vitamin A supplements to all children diagnosed with measles',
      'Isolate infected individuals during the contagious period (4 days before to 4 days after rash appears)',
      'Ensure high community vaccine uptake to preserve herd immunity',
    ],
    when_to_seek_care:
      'Notify your healthcare clinic prior to arriving if you suspect measles so appropriate airborne isolation precautions can be implemented. Seek emergency medical attention for difficulty breathing, persistent high fever, drowsiness, or convulsions.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/measles',
    last_reviewed: '2024-08-09',
    created_at: '2024-08-09T00:00:00Z',
    updated_at: '2025-07-25T09:00:00Z',
  },
  {
    id: 'disease-asthma',
    slug: 'asthma',
    name: 'Asthma (Chronic Bronchial Disease)',
    category: 'Chronic Respiratory',
    overview:
      'Asthma is a major noncommunicable chronic disease affecting children and adults. The air passages in the lungs become inflamed and narrow due to inflammation and tightening of the muscles around the small airways, causing recurrent attacks of breathlessness, wheezing, and coughing. While it cannot be cured, appropriate medical management with inhaled corticosteroids allows people to live normal, active lives.',
    symptoms: [
      'Recurrent wheezing (a high-pitched whistling sound during exhalation)',
      'Breathlessness and sensation of chest tightness',
      'Chronic cough, particularly troublesome at night or early morning',
      'Symptoms triggered by cold air, viral infections, exercise, or allergens',
    ],
    warning_signs: [
      'Severe acute asthma exacerbation: inability to speak full sentences in one breath',
      'Silent chest: wheezing disappears because airflow is critically reduced (airway closure)',
      'Retraction of neck and intercostal muscles during inhalation (respiratory fatigue)',
      'Cyanosis: gray or bluish lips or fingernails signaling life-threatening hypoxia',
      'Failure of quick-relief bronchodilator (albuterol inhaler) to relieve symptoms within minutes',
    ],
    risk_factors: [
      'Genetic predisposition and family history of asthma or allergic atopy (eczema, hay fever)',
      'Exposure to indoor allergens (house dust mites, pet dander, mold)',
      'Exposure to outdoor air pollution and second-hand tobacco smoke',
      'Occupational exposure to chemical irritants, fumes, or industrial dusts',
      'Overweight and obesity in both adults and children',
    ],
    prevention: [
      'Identify and systematically avoid individual environmental triggers (smoke, pet dander, cold air)',
      'Use prescribed daily inhaled corticosteroid controller medications consistently even when feeling well',
      'Always carry a prescribed fast-acting bronchodilator (rescue inhaler)',
      'Receive annual influenza and pneumococcal immunizations to prevent viral triggers',
      'Maintain an updated written Asthma Action Plan created with your physician',
    ],
    when_to_seek_care:
      'Review asthma control with your physician if using rescue inhalers more than twice a week. Seek emergency hospital care (dial 112/911) immediately if breathlessness makes talking impossible, chest retracts heavily, or rescue inhaler doses provide no relief.',
    source_id: '00000000-0000-0000-0000-000000000001',
    source_name: 'World Health Organization (WHO)',
    source_url: 'https://www.who.int/news-room/fact-sheets/detail/asthma',
    last_reviewed: '2024-05-14',
    created_at: '2024-05-14T00:00:00Z',
    updated_at: '2025-06-20T10:00:00Z',
  },
];

export const diseaseService = {
  /**
   * Get all diseases with optional search and category filters
   */
  async getDiseases(filter?: {
    search?: string;
    category?: string;
  }): Promise<Disease[]> {
    let list = SEEDED_DISEASES;

    // Try Supabase first if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('diseases')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          list = data as Disease[];
        }
      } catch (err) {
        console.warn('[DiseaseService] Supabase read failed, using seeded WHO data:', err);
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.overview.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.symptoms.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((d) => d.category.toLowerCase() === filter.category!.toLowerCase());
    }

    return list;
  },

  /**
   * Get a single disease entry by slug
   */
  async getDiseaseBySlug(slug: string): Promise<Disease | null> {
    const cleanSlug = slug.toLowerCase().trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('diseases')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (!error && data) {
          return data as Disease;
        }
      } catch (err) {
        console.warn('[DiseaseService] Supabase fetch by slug failed, using seeded WHO data:', err);
      }
    }

    return SEEDED_DISEASES.find((d) => d.slug.toLowerCase() === cleanSlug) || null;
  },

  /**
   * Get unique categories across all available diseases
   */
  async getCategories(): Promise<string[]> {
    const diseases = await this.getDiseases();
    const set = new Set<string>();
    diseases.forEach((d) => set.add(d.category));
    return ['All', ...Array.from(set).sort()];
  },
};
