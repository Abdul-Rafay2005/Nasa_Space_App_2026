/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Human Body Figure (Phase 1 Baseline)
 * Team: Abdul Rafay & Sameen
 * 
 * Satisfies PDF Requirement: "basic body figure with a few clickable parts"
 * Dynamically color-codes body systems based on latest assessment status (Green / Yellow / Red).
 */

import React, { useState } from 'react';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';
import { Activity, Info } from 'lucide-react';

interface BodyPartInfo {
  id: 'brain' | 'heart' | 'arm' | 'core' | 'abdomen';
  name: string;
  system: string;
  relatedIndicator: string;
  reading: string;
  status: HealthStatus;
  statusLabel: string;
  microgravityHazard: string;
  countermeasure: string;
}

interface InteractiveBodyFigureProps {
  latestAssessment?: DailyAssessmentRecord;
}

export const InteractiveBodyFigure: React.FC<InteractiveBodyFigureProps> = ({
  latestAssessment,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<'brain' | 'heart' | 'arm' | 'core' | 'abdomen'>('heart');

  // Map latest assessment to body parts
  const hrStatus = latestAssessment?.results.heartRate.status || 'GREEN';
  const bpStatus = latestAssessment?.results.bloodPressure.status || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status || 'GREEN';
  const tempStatus = latestAssessment?.results.bodyTemperature.status || 'GREEN';
  const moodStatus = latestAssessment?.results.mood.status || 'GREEN';

  const bodyPartsData: Record<string, BodyPartInfo> = {
    brain: {
      id: 'brain',
      name: 'Cranial & Neuro-Vestibular System',
      system: 'Central Nervous System & Circadian Axis',
      relatedIndicator: 'Mood & Sleep Duration',
      reading: `${latestAssessment?.results.mood.valueDisplay || 'Good'} • ${latestAssessment?.results.sleepDuration.valueDisplay || '7.5'} hrs sleep`,
      status: moodStatus === 'RED' ? 'RED' : moodStatus === 'YELLOW' ? 'YELLOW' : 'GREEN',
      statusLabel: latestAssessment?.results.mood.statusLabel || 'Nominal',
      microgravityHazard: 'Cephalic fluid shift increases intracranial pressure (SANS risk). 16 orbital sunrises/day disrupts circadian sleep architecture.',
      countermeasure: 'Actigraphy sleep hygiene protocol, blue-light filtering visor, and vestibular adaptation monitoring.',
    },
    heart: {
      id: 'heart',
      name: 'Cardiovascular Core (Heart)',
      system: 'Autonomic Circulatory Pump',
      relatedIndicator: 'Resting Heart Rate (BPM)',
      reading: `${latestAssessment?.results.heartRate.valueDisplay || '65'} BPM`,
      status: hrStatus,
      statusLabel: latestAssessment?.results.heartRate.statusLabel || 'Nominal',
      microgravityHazard: 'Cardiac atrophy and ventricular deconditioning due to reduced hydrostatic pressure gradient in zero-G.',
      countermeasure: 'Daily 2.5 hours of T2 treadmill and Cycle Ergometer (CEVIS) aerobic countermeasure intervals.',
    },
    arm: {
      id: 'arm',
      name: 'Brachial Arterial Vasculature',
      system: 'Systemic Hemodynamic Pressure',
      relatedIndicator: 'Blood Pressure (Systolic / Diastolic)',
      reading: `${latestAssessment?.results.bloodPressure.valueDisplay || '118/76'} mmHg`,
      status: bpStatus,
      statusLabel: latestAssessment?.results.bloodPressure.statusLabel || 'Nominal',
      microgravityHazard: 'Arterial wall remodeling and endothelial stiffening; orthostatic intolerance upon planetary re-entry.',
      countermeasure: 'Lower Body Negative Pressure (LBNP) suits and oral electrolyte fluid re-loading prior to maneuvers.',
    },
    abdomen: {
      id: 'abdomen',
      name: 'Metabolic & Digestive Core',
      system: 'Hepatic-Pancreatic Glycemic Control',
      relatedIndicator: 'Blood Glucose (Blood Sugar)',
      reading: `${latestAssessment?.results.bloodSugar.valueDisplay || '90'} mg/dL`,
      status: sugarStatus,
      statusLabel: latestAssessment?.results.bloodSugar.statusLabel || 'Nominal',
      microgravityHazard: 'Sub-clinical insulin sensitivity shifts, altered gut microbiome motility, and microgravity caloric deficit.',
      countermeasure: 'Fortified space nutritional rations, personalized caloric tracking, and daily metabolic surveillance.',
    },
    core: {
      id: 'core',
      name: 'Thoraco-Abdominal Core (Thermoregulation)',
      system: 'Core Thermal Balance',
      relatedIndicator: 'Core Body Temperature',
      reading: `${latestAssessment?.results.bodyTemperature.valueDisplay || '36.8'} °C`,
      status: tempStatus,
      statusLabel: latestAssessment?.results.bodyTemperature.statusLabel || 'Nominal',
      microgravityHazard: 'Reduced convective airflow impairs sweat evaporation, leading to "Space Fever" (elevated core temp during work).',
      countermeasure: 'Active cabin ventilation loops, cooling vests during EVA, and calibrated hydration replenishment.',
    },
  };

  const currentPart = bodyPartsData[selectedPartId];

  // Helper color classes for SVG elements
  const getColorClass = (status: HealthStatus, isSelected: boolean) => {
    let base = 'transition-all duration-300 cursor-pointer ';
    if (status === 'RED') {
      base += isSelected ? 'fill-rose-500 stroke-rose-300 stroke-2' : 'fill-rose-500/80 hover:fill-rose-400';
    } else if (status === 'YELLOW') {
      base += isSelected ? 'fill-amber-400 stroke-amber-200 stroke-2' : 'fill-amber-400/80 hover:fill-amber-300';
    } else {
      base += isSelected ? 'fill-cyan-400 stroke-cyan-200 stroke-2' : 'fill-cyan-500/60 hover:fill-cyan-400';
    }
    return base;
  };

  return (
    <Card
      glow="cyan"
      title="Interactive Human Body Visualization"
      subtitle="Clickable physiological figure — Real-time organ telemetry status"
      icon={<Activity className="w-4 h-4" />}
      headerSlot={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          CLICK BODY REGION TO INSPECT
        </span>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Interactive Stylized Astronaut Silhouette Figure */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-space-950/80 border border-slate-800">
          
          <div className="relative w-56 h-80 flex items-center justify-center">
            {/* Background scanner grid circle */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-spin-slow pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-500/20 pointer-events-none" />

            <svg viewBox="0 0 200 320" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              {/* Outer Body Outline / Silhouette */}
              <path
                d="M100 20 C110 20 118 28 118 40 C118 50 112 56 100 58 C88 56 82 50 82 40 C82 28 90 20 100 20 Z
                   M85 64 L115 64 L132 80 L145 130 L136 135 L124 95 L124 165 L118 240 L126 300 L112 300 L104 245 L100 190 L96 245 L88 300 L74 300 L82 240 L76 165 L76 95 L64 135 L55 130 L68 80 Z"
                className="fill-space-900/90 stroke-slate-700/80 stroke-1"
              />

              {/* 1. Head / Brain (Clickable) */}
              <circle
                cx="100"
                cy="38"
                r="15"
                className={getColorClass(bodyPartsData.brain.status, selectedPartId === 'brain')}
                onClick={() => setSelectedPartId('brain')}
              />
              <text x="100" y="41" textAnchor="middle" className="text-[9px] font-mono fill-space-950 font-bold pointer-events-none">
                CNS
              </text>

              {/* 2. Heart / Cardiovascular (Clickable) */}
              <circle
                cx="106"
                cy="92"
                r="13"
                className={getColorClass(bodyPartsData.heart.status, selectedPartId === 'heart')}
                onClick={() => setSelectedPartId('heart')}
              />
              <text x="106" y="95" textAnchor="middle" className="text-[9px] font-mono fill-space-950 font-bold pointer-events-none">
                HR
              </text>

              {/* 3. Arm / Arterial Blood Pressure (Clickable) */}
              <rect
                x="56"
                y="105"
                width="14"
                height="22"
                rx="6"
                className={getColorClass(bodyPartsData.arm.status, selectedPartId === 'arm')}
                onClick={() => setSelectedPartId('arm')}
              />
              <text x="63" y="119" textAnchor="middle" className="text-[8px] font-mono fill-space-950 font-bold pointer-events-none">
                BP
              </text>

              {/* 4. Abdomen / Glucose Core (Clickable) */}
              <circle
                cx="100"
                cy="130"
                r="12"
                className={getColorClass(bodyPartsData.abdomen.status, selectedPartId === 'abdomen')}
                onClick={() => setSelectedPartId('abdomen')}
              />
              <text x="100" y="133" textAnchor="middle" className="text-[8px] font-mono fill-space-950 font-bold pointer-events-none">
                GLU
              </text>

              {/* 5. Core / Thermoregulation (Clickable) */}
              <rect
                x="88"
                y="152"
                width="24"
                height="16"
                rx="5"
                className={getColorClass(bodyPartsData.core.status, selectedPartId === 'core')}
                onClick={() => setSelectedPartId('core')}
              />
              <text x="100" y="163" textAnchor="middle" className="text-[8px] font-mono fill-space-950 font-bold pointer-events-none">
                TEMP
              </text>

              {/* Tech connector lines from active part to focus pointer */}
              {selectedPartId === 'heart' && (
                <line x1="119" y1="92" x2="160" y2="92" className="stroke-cyan-400 stroke-1 stroke-dasharray-2 animate-pulse" />
              )}
              {selectedPartId === 'brain' && (
                <line x1="115" y1="38" x2="160" y2="38" className="stroke-cyan-400 stroke-1 stroke-dasharray-2 animate-pulse" />
              )}
              {selectedPartId === 'arm' && (
                <line x1="70" y1="116" x2="160" y2="116" className="stroke-cyan-400 stroke-1 stroke-dasharray-2 animate-pulse" />
              )}
              {selectedPartId === 'abdomen' && (
                <line x1="112" y1="130" x2="160" y2="130" className="stroke-cyan-400 stroke-1 stroke-dasharray-2 animate-pulse" />
              )}
              {selectedPartId === 'core' && (
                <line x1="112" y1="160" x2="160" y2="160" className="stroke-cyan-400 stroke-1 stroke-dasharray-2 animate-pulse" />
              )}
            </svg>
          </div>

          {/* Quick Select Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {(['brain', 'heart', 'arm', 'abdomen', 'core'] as const).map((partKey) => {
              const isSelected = selectedPartId === partKey;
              return (
                <button
                  key={partKey}
                  onClick={() => setSelectedPartId(partKey)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-space-950 font-bold shadow-neon-cyan/40'
                      : 'bg-space-900 text-slate-300 hover:bg-space-850 border border-slate-800'
                  }`}
                >
                  {partKey.toUpperCase()}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Detailed Organ / System Telemetry Dossier */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header of Selected System */}
          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  {currentPart.system}
                </span>
                <h3 className="font-bold text-base text-slate-100 font-sans">
                  {currentPart.name}
                </h3>
              </div>
              <StatusBadge status={currentPart.status} label={currentPart.statusLabel} size="md" />
            </div>

            {/* Current Telemetry Reading */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-sans">Current Telemetry:</span>
              <span className="font-mono text-lg font-bold text-cyan-300">
                {currentPart.reading}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({currentPart.relatedIndicator})
              </span>
            </div>
          </div>

          {/* Spaceflight Hazards & Medical Context (As researched by Eman & Moazzama) */}
          <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-3 text-xs">
            <div>
              <h4 className="font-mono text-slate-300 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Microgravity Spaceflight Physiological Hazard</span>
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans">
                {currentPart.microgravityHazard}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h4 className="font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prescribed Operational Countermeasure</span>
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans">
                {currentPart.countermeasure}
              </p>
            </div>
          </div>

        </div>

      </div>
    </Card>
  );
};
