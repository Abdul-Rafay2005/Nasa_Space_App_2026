/**
 * Aegis Health — Official NASA Challenge Resources & Submission Attribution Modal
 * Conforms to Section 1, 5, 6, 7 & 8 of Hackathon Research Report (Eman Saleem)
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  BookOpen,
  Copy,
  Check,
  Award,
  Info,
} from 'lucide-react';

interface NasaResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NasaResourcesModal: React.FC<NasaResourcesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'submission_text' | 'guidelines'>('resources');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const nasaSubmissionText = `We used NASA's Human Research Program resources as the scientific base of the app. The 5 Hazards of Human Spaceflight page is our framework: every indicator and alert is tagged with one hazard. The Risks of Human Spaceflight pages (cardiovascular adaptations, hypoxia, immune system, sleep, behavioral conditions, bone changes, SANS, radiation-induced cancers, nutrition) supply the 'why it matters' explanation shown on each alert card. From Ongoing HRP Research, ARCHeR (Artemis II) guided our sleep and activity tracking, and Standard Measures guided our personal-baseline design (comparing each astronaut to their own pre-flight data). Safety limits come from NASA-STD-3001 technical briefs (CO2 3 mmHg; career radiation 600 mSv).`;

  const partnerSubmissionText = `CSA 'Monitoring Radiation for Astronaut Health': neutrons are about 30% of ISS radiation and especially harmful, so our radiation panel shows the neutron share and supports continuous, autonomous monitoring. CSA 'Why Do We Conduct Science Experiments in Space?': background on how long missions affect the body (accelerated-aging-like changes), used in our presentation. Other: NEWS2 (Royal College of Physicians), American Heart Association and CDC for clinical reference ranges. All astronaut data shown in the demo is simulated.`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official NASA & Partner Challenge Resources" maxWidth="2xl">
      <div className="space-y-4 text-xs font-sans">
        {/* Header Tabs */}
        <div className="flex bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'resources' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>5 Official Resources</span>
          </button>
          <button
            onClick={() => setActiveTab('submission_text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'submission_text' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Submission Fields</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guidelines' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Challenge Guardrails</span>
          </button>
        </div>

        {/* TAB 1: 5 OFFICIAL RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> 1. NASA HRP: 5 Hazards of Human Spaceflight
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30">NASA Core</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong>Framework:</strong> Radiation, Isolation & Confinement, Distance from Earth, Gravity Fields, Hostile/Closed Environments. Every indicator and alert in Aegis Health is tagged with its primary space hazard.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> 2. NASA HRP: Risks of Human Spaceflight
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30">17 NASA Risks</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Cardiovascular Adaptations, Hypoxia, Immune Responses, Sleep, Behavioral Health, SANS (eyes), Bone Changes, Nutrition, and Radiation. Used directly for every "Why it matters" alert card explanation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> 3. Ongoing HRP Research in Space
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30">Artemis II & ISS</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong>ARCHeR (Artemis II):</strong> Wrist actigraphy for sleep & motion. <strong>Standard Measures:</strong> Pre-flight personal baseline matching. <strong>Tempus Pro & EIMO 2023:</strong> Autonomous Earth-independent telemedicine when Mars delay grows.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 4. CSA: Monitoring Radiation for Astronaut Health
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">Partner Agency (CSA)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Neutrons constitute ~30% of ISS radiation dose and are especially destructive biologically. Highlights CSA's CANS autonomous spectrometer. Aegis Health monitors total radiation with its 30% biological neutron weighting.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 5. CSA: Why Do We Conduct Experiments in Space?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">Partner Agency (CSA)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Validates how long-duration microgravity induces accelerated-aging-like physiological changes and why continuous multi-sensor tracking is essential for deep space exploration.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900/60 border border-cyan-500/20 text-[11px] font-mono text-slate-400 space-y-1">
              <div><strong>Technical Safety Standards:</strong> NASA-STD-3001 Vol 2 & OCHMO TB-004 (Cabin CO2 ≤3.0 mmHg), NASA OCHMO TB-020 (Career Radiation &lt;600 mSv).</div>
              <div><strong>Clinical Reference Ranges:</strong> NEWS2 (Royal College of Physicians), American Heart Association (AHA), CDC Diabetes & Sleep.</div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSION TEXT */}
        {activeTab === 'submission_text' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 font-mono">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-cyan-300">NASA Data (Submission Field):</label>
                <button
                  onClick={() => copyToClipboard(nasaSubmissionText, 'nasa')}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-cyan-300"
                >
                  {copiedField === 'nasa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'nasa' ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={5}
                value={nasaSubmissionText}
                className="w-full p-2.5 rounded-lg bg-space-950 border border-slate-800 text-[11px] text-slate-200 leading-relaxed select-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-cyan-300">Space Agency Partner & Other Data (Submission Field):</label>
                <button
                  onClick={() => copyToClipboard(partnerSubmissionText, 'partner')}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-cyan-300"
                >
                  {copiedField === 'partner' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'partner' ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={5}
                value={partnerSubmissionText}
                className="w-full p-2.5 rounded-lg bg-space-950 border border-slate-800 text-[11px] text-slate-200 leading-relaxed select-all"
              />
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGE GUARDRAILS */}
        {activeTab === 'guidelines' && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200 font-mono">What to Say (Judging Alignment):</h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Say <strong>"decision-support prototype"</strong>. Do not say "medical device" or "clinical diagnosis".</li>
                <li>State clearly that demonstration astronaut telemetry is simulated.</li>
                <li>Do not claim to solve NASA gap Med07 (closed in 2022).</li>
                <li>Highlight that rule-based decision trees with explicit NASA risk references are easier for crew to trust than black-box AI (citing NASA EIMO 2023 on AI hallucination risks).</li>
                <li>Earth-independent design: built specifically for Mars missions where 5–40 minute speed-of-light delays prevent real-time ground intervention.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
