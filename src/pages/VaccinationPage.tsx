import React, { useState } from 'react';
import { Syringe, ShieldCheck, CheckCircle2, AlertCircle, Info, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const VaccinationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infants' | 'adults' | 'safety'>('infants');

  const infantSchedule = [
    { age: 'At Birth', vaccines: 'BCG, Hepatitis B (Birth dose), OPV-0', prevents: 'Tuberculosis, Hep B, Poliomyelitis' },
    { age: '6 Weeks', vaccines: 'Pentavalent-1, OPV-1, Rotavirus-1, fIPV-1, PCV-1', prevents: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib, Polio, Rotaviral Diarrhea, Pneumonia' },
    { age: '10 Weeks', vaccines: 'Pentavalent-2, OPV-2, Rotavirus-2', prevents: 'Secondary immune booster response' },
    { age: '14 Weeks', vaccines: 'Pentavalent-3, OPV-3, Rotavirus-3, fIPV-2, PCV-2', prevents: 'Full primary course completion' },
    { age: '9-12 Months', vaccines: 'MR-1 (Measles-Rubella), PCV-Booster, JE-1 (endemic zones)', prevents: 'Measles, Rubella, Japanese Encephalitis' },
    { age: '16-24 Months', vaccines: 'MR-2, DPT-Booster-1, OPV-Booster', prevents: 'Preschool antibody maintenance' },
  ];

  const adultVaccines = [
    { name: 'Tetanus, Diphtheria, Pertussis (Td/Tdap)', frequency: 'Every 10 years for Td; Tdap during each pregnancy', rationale: 'Waning childhood immunity leaves adults vulnerable to wound-acquired tetanus and transmitting pertussis to newborns.' },
    { name: 'Influenza (Annual Flu Shot)', frequency: 'Annually before peak flu season', rationale: 'Crucial for older adults (65+), healthcare workers, and patients with chronic respiratory or metabolic conditions.' },
    { name: 'Human Papillomavirus (HPV)', frequency: '2 or 3 doses based on age of initiation (up to age 26-45)', rationale: 'Prevents cervical, anal, and oropharyngeal cancers caused by oncogenic HPV types.' },
    { name: 'Pneumococcal (PCV / PPSV23)', frequency: 'Recommended for adults 65+ or high-risk chronic patients', rationale: 'Shields against invasive pneumococcal disease, bacteremia, and pneumococcal pneumonia.' },
    { name: 'Hepatitis B', frequency: '3-dose series for unimmunized adults', rationale: 'Prevents chronic liver cirrhosis and hepatocellular carcinoma resulting from blood/fluid transmission.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Immunization Literacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Vaccination Guide & Public Health Schedules
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Immunization saves an estimated 3.5 to 5 million lives each year according to the World Health Organization. Review verified infant schedules, adult boosters, and safety facts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('infants')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'infants' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Universal Child Schedule
          </button>
          <button
            onClick={() => setActiveTab('adults')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'adults' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adult Immunization
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'safety' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safety & Demystification
          </button>
        </div>
      </div>

      {/* Tab 1: Infant schedule */}
      {activeTab === 'infants' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Universal Immunization Programme (UIP) Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Standard public health schedule protecting infants against 12 vaccine-preventable diseases.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                    <th className="pb-3 pr-4">Age Milestone</th>
                    <th className="pb-3 pr-4">Recommended Vaccines</th>
                    <th className="pb-3">Disease Protection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {infantSchedule.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-teal-700 whitespace-nowrap">{row.age}</td>
                      <td className="py-3.5 pr-4 text-slate-800 font-medium">{row.vaccines}</td>
                      <td className="py-3.5 text-slate-600">{row.prevents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Adult schedule */}
      {activeTab === 'adults' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adultVaccines.map((v, idx) => (
            <Card key={idx} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-base">{v.name}</h4>
                <Badge variant="primary">Adult</Badge>
              </div>
              <div className="text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg font-semibold inline-block">
                Frequency: {v.frequency}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {v.rationale}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Safety & Facts */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">How Vaccines Are Evaluated for Safety</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vaccines undergo rigorous multi-phase clinical trials (Phases 1 through 3) involving tens of thousands of participants before regulatory clearance. Post-marketing surveillance (Phase 4 / VAERS) monitors adverse events continuously.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <span className="font-bold text-emerald-900 text-sm">Myth: Natural infection is always better than vaccination.</span>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Fact: Natural infection can cause fatal complications (e.g. encephalitis from measles, paralysis from polio, or liver cancer from Hepatitis B). Vaccines trigger immune memory safely without the risk of severe disease.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <span className="font-bold text-emerald-900 text-sm">Myth: Vaccines overload a baby’s immune system.</span>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Fact: Infants encounter thousands of antigens daily in air and food. The antigens in all childhood vaccines combined represent a tiny fraction of what a baby’s immune system routinely processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
