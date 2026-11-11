/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: 2D Holographic Human Digital Twin (Matches 03_interactive_body_overview.png)
 * Ultra-clean, modern dark glass aesthetic with glowing anatomical subsystems and live ECG pulse.
 */

import React, { useState } from 'react';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import {
  Heart,
  Wind,
  Utensils,
  Dumbbell,
  Brain,
  Shield,
  CheckCircle,
  Info,
} from 'lucide-react';

interface HumanDigitalTwin2DProps {
  latestAssessment?: DailyAssessmentRecord;
  onSelectSystem?: (systemId: string) => void;
  initialSelectedId?: string;
}

interface SystemItem {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  hotspotY: number; // percentage on body
  hotspotX: number;
  status: HealthStatus;
  statusBadgeText: string;
  cardTitle: string;
  cardDesc: string;
  quickInfo: string;
  biometricDisplay: string;
  countermeasure: string;
}

export const HumanDigitalTwin2D: React.FC<HumanDigitalTwin2DProps> = ({
  latestAssessment,
  onSelectSystem,
  initialSelectedId = 'heart',
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);

  // Indicators
  const v = latestAssessment?.values || {
    heartRate: 72,
    systolic: 118,
    diastolic: 76,
    bloodSugar: 92,
    bodyTemperature: 36.6,
    sleepDuration: 7.75,
    mood: 'good' as const,
  };

  const hrStatus = latestAssessment?.results.heartRate.status || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status || 'GREEN';
  const tempStatus = latestAssessment?.results.bodyTemperature.status || 'GREEN';
  const moodStatus = latestAssessment?.results.mood.status || 'GREEN';

  const systems: SystemItem[] = [
    {
      id: 'heart',
      name: 'Heart & Circulatory',
      icon: Heart,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      hotspotX: 47,
      hotspotY: 34,
      status: hrStatus,
      statusBadgeText: hrStatus === 'GREEN' ? 'Healthy' : hrStatus === 'YELLOW' ? 'Warning' : 'Urgent',
      cardTitle: 'Heart Health',
      cardDesc:
        hrStatus === 'GREEN'
          ? 'Your heart rate and arterial perfusion are within the nominal microgravity operational range.'
          : latestAssessment?.results.heartRate.reason || 'Resting cardiovascular elevation detected.',
      quickInfo: 'A normal resting astronaut heart rate is 55–90 bpm in microgravity.',
      biometricDisplay: `${v.heartRate} bpm • ${v.systolic}/${v.diastolic} mmHg`,
      countermeasure: 'NASA CEVIS: 30-min aerobic interval training + 1.2 L oral electrolyte hydration.',
    },
    {
      id: 'respiratory',
      name: 'Respiratory System',
      icon: Wind,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      hotspotX: 53,
      hotspotY: 31,
      status: 'GREEN',
      statusBadgeText: 'Healthy',
      cardTitle: 'Respiratory Function',
      cardDesc: 'Alveolar oxygen diffusion and cabin partial pressure (ppO₂) are balanced without gravitational gradient.',
      quickInfo: 'Normal astronaut SpO₂ at sea-level equivalent habitat pressure is 95–100%.',
      biometricDisplay: 'SpO₂ 98.6% • Cabin O₂ 21.3%',
      countermeasure: 'Ensure cabin ventilation velocity exceeds 0.2 m/s to prevent expired CO₂ bubble formation.',
    },
    {
      id: 'digestive',
      name: 'Digestive System',
      icon: Utensils,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      hotspotX: 50,
      hotspotY: 46,
      status: sugarStatus,
      statusBadgeText: sugarStatus === 'GREEN' ? 'Normal' : 'Attention',
      cardTitle: 'Metabolic & Digestive Health',
      cardDesc:
        sugarStatus === 'GREEN'
          ? 'Blood glucose metabolism and spaceflight gastrointestinal motility are nominal.'
          : latestAssessment?.results.bloodSugar.reason || 'Metabolic glucose variance logged.',
      quickInfo: 'Target pre-meal capillary glucose range is 70–115 mg/dL.',
      biometricDisplay: `${v.bloodSugar} mg/dL Glucose`,
      countermeasure: 'Maintain dietary fiber intake and spaceflight hydration schedule.',
    },
    {
      id: 'musculoskeletal',
      name: 'Musculoskeletal',
      icon: Dumbbell,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
      hotspotX: 43,
      hotspotY: 72,
      status: 'GREEN',
      statusBadgeText: 'Good',
      cardTitle: 'Musculoskeletal Integrity',
      cardDesc: 'Bone density retention and postural muscular strength are preserved through scheduled daily resistive exercises.',
      quickInfo: 'NASA standard mandates 2.5 hours/day of countermeasure exercise on ARED and T2.',
      biometricDisplay: '+3.4 cm height expansion',
      countermeasure: 'Execute 600 kg-force ARED deadlifts and axial squats to counter bone calcium loss.',
    },
    {
      id: 'nervous',
      name: 'Nervous System',
      icon: Brain,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      hotspotX: 50,
      hotspotY: 15,
      status: moodStatus,
      statusBadgeText: moodStatus === 'GREEN' ? 'Normal' : 'Caution',
      cardTitle: 'Central Nervous System',
      cardDesc:
        moodStatus === 'GREEN'
          ? 'Vestibular balance and psychological cognitive readiness are nominal. Zero Space Adaptation Syndrome (SAS) symptoms.'
          : latestAssessment?.results.mood.reason || 'Cognitive fatigue or vestibular conflict detected.',
      quickInfo: 'Adequate circadian sleep (7–9 hrs) protects frontal lobe executive reaction time.',
      biometricDisplay: `${latestAssessment?.results.mood.valueDisplay || 'Good Readiness'}`,
      countermeasure: 'Enforce sleep chamber acoustic isolation and perform 10-minute mindfulness breathing.',
    },
    {
      id: 'immune',
      name: 'Immune System',
      icon: Shield,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      hotspotX: 50,
      hotspotY: 25,
      status: tempStatus,
      statusBadgeText: tempStatus === 'GREEN' ? 'Good' : 'Elevated',
      cardTitle: 'Immune & Thermoregulation',
      cardDesc:
        tempStatus === 'GREEN'
          ? 'Core body temperature and leukocyte activity are within optimal parameters.'
          : latestAssessment?.results.bodyTemperature.reason || 'Core temperature elevation logged.',
      quickInfo: 'Normal astronaut resting core body temperature is 36.3–37.3 °C.',
      biometricDisplay: `${v.bodyTemperature} °C Core Temp`,
      countermeasure: 'Verify liquid cooling ventilation garment (LCVG) airflow during exercise periods.',
    },
  ];

  const currentSystem = systems.find((s) => s.id === selectedId) || systems[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectSystem?.(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 select-none animate-fade-in">
      
      {/* ── Column 1: Glowing 2D Holographic Anatomical Silhouette (lg:col-span-4) ── */}
      <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0c142b]/90 border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl shadow-2xl min-h-[480px]">
        
        {/* Holographic background grid rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-80 h-80 rounded-full border border-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
          <div className="absolute w-60 h-60 rounded-full border border-blue-400 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
        </div>

        {/* Outer space atmospheric glow at bottom */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-t from-cyan-500/20 via-blue-600/10 to-transparent blur-2xl pointer-events-none" />

        {/* 2D High-Tech Vector Human Figure */}
        <div className="relative w-48 h-96 flex items-center justify-center">
          <svg viewBox="0 0 120 220" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" fill="none">
            {/* Sci-Fi Base Ring */}
            <ellipse cx="60" cy="208" rx="46" ry="8" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx="60" cy="208" rx="34" ry="6" fill="#00f0ff" fillOpacity="0.12" stroke="#00f0ff" strokeWidth="1" />

            {/* Glowing Human Anatomical Silhouette Path */}
            <path
              d="M60,14 C65,14 69,18 69,24 C69,29 65,34 60,34 C55,34 51,29 51,24 C51,18 55,14 60,14 Z
                 M55,36 L65,36 L68,42 L79,48 L88,88 L81,90 L74,58 L68,58 L68,110 L73,165 L76,202 L64,202 L61,130 L59,130 L56,202 L44,202 L47,165 L52,110 L52,58 L46,58 L39,90 L32,88 L41,48 L52,42 Z"
              stroke="#00f0ff"
              strokeWidth="2"
              fill="#06b6d4"
              fillOpacity="0.15"
              strokeLinejoin="round"
            />

            {/* Chest Ribcage Accents */}
            <line x1="53" y1="48" x2="67" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="52" y1="55" x2="68" y2="55" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="53" y1="62" x2="67" y2="62" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="55" y1="69" x2="65" y2="69" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* Spinal Column Line */}
            <line x1="60" y1="40" x2="60" y2="105" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 3" strokeOpacity="0.7" />

            {/* Pulsing Hotspot Rings */}
            {systems.map((s) => {
              const isSelected = s.id === selectedId;
              const nodeColor = s.status === 'RED' ? '#ef4444' : s.status === 'YELLOW' ? '#f59e0b' : '#10b981';
              const svgX = (s.hotspotX / 100) * 120;
              const svgY = (s.hotspotY / 100) * 220;

              return (
                <g key={s.id} onClick={() => handleSelect(s.id)} className="cursor-pointer">
                  {isSelected && (
                    <circle cx={svgX} cy={svgY} r="9" stroke={nodeColor} strokeWidth="1.5" strokeDasharray="2 2" className="animate-spin" />
                  )}
                  <circle cx={svgX} cy={svgY} r="6" fill={nodeColor} fillOpacity="0.3" />
                  <circle cx={svgX} cy={svgY} r="3.5" fill={nodeColor} className={isSelected ? 'animate-ping' : ''} />
                </g>
              );
            })}
          </svg>
        </div>

        <p className="mt-3 text-[11px] font-mono text-cyan-300 text-center tracking-wider">
          Click any organ hotspot or system from the list
        </p>
      </div>

      {/* ── Column 2: System List with Icons & Status (lg:col-span-4) ───── */}
      <div className="lg:col-span-4 p-5 rounded-3xl bg-[#0c142b]/90 border border-cyan-500/30 space-y-2 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-bold px-1">
            Anatomical Subsystems (6 Modules)
          </span>

          <div className="space-y-1.5">
            {systems.map((sys) => {
              const isSelected = sys.id === selectedId;
              const Icon = sys.icon;
              const statusColor =
                sys.status === 'GREEN'
                  ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                  : sys.status === 'RED'
                  ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                  : 'text-amber-400 bg-amber-500/15 border-amber-500/30';

              return (
                <button
                  key={sys.id}
                  onClick={() => handleSelect(sys.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-400/50 shadow-lg shadow-cyan-950/40'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sys.iconBg} shrink-0`}>
                      <Icon className={`w-4 h-4 ${sys.iconColor}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {sys.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{sys.biometricDisplay}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${statusColor}`}>
                    {sys.statusBadgeText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-[#1b2752] text-center">
          <span className="text-[10px] font-mono text-slate-400">
            Real-time biometric integration active
          </span>
        </div>
      </div>

      {/* ── Column 3: Health Status Detail & Quick Info (lg:col-span-4) ─── */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        
        {/* Top Detail Card (Matches 03_interactive_body_overview.png) */}
        <div className="p-6 rounded-3xl bg-[#0c142b]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${currentSystem.iconBg}`}>
                <currentSystem.icon className={`w-5 h-5 ${currentSystem.iconColor}`} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-sans">{currentSystem.cardTitle}</h3>
                <span className="text-[10px] font-mono text-cyan-400">TELEMETRY SURVEILLANCE</span>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                currentSystem.status === 'GREEN'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : currentSystem.status === 'RED'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{currentSystem.statusBadgeText}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentSystem.cardDesc}
          </p>

          {/* Glowing Green ECG Pulse Line (matches design mockup) */}
          <div className="h-10 w-full flex items-center">
            <svg viewBox="0 0 240 30" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,15 40,15 50,4 60,26 70,8 80,20 90,15 150,15 160,2 170,28 180,6 190,22 200,15 240,15"
                fill="none"
                stroke={currentSystem.status === 'GREEN' ? '#10b981' : currentSystem.status === 'RED' ? '#ef4444' : '#f59e0b'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            </svg>
          </div>

          {/* Countermeasure Protocol */}
          <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs">
            <strong className="text-cyan-300 font-mono block mb-1">NASA PROTOCOL:</strong>
            <p className="text-slate-300 leading-relaxed">{currentSystem.countermeasure}</p>
          </div>
        </div>

        {/* Bottom Quick Info Card (Matches 03_interactive_body_overview.png) */}
        <div className="p-5 rounded-3xl bg-[#0c142b]/90 border border-blue-500/30 backdrop-blur-xl shadow-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-sans">Quick Info</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {currentSystem.quickInfo}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
