/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Human Body Figure (Front View)
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 * 
 * Data-driven anatomical telemetry visualizer.
 * All content (names, functions, linked indicators, medical citations) is imported
 * from src/data/bodyParts.json so medical researchers (Eman, Moazzama) can edit without code changes.
 */

import React, { useState, useMemo } from 'react';
import bodyPartsData from '../../data/bodyParts.json';
import { BodyPartDefinition, BodyPartId, BodyPartEvaluation } from '../../types/bodyMap';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';
import {
  Activity,
  Heart,
  Wind,
  ShieldAlert,
  Brain,
  Info,
  BookOpen,
  Zap,
  Target,
  Sparkles,
  Flame,
} from 'lucide-react';

interface BodyFigureProps {
  latestAssessment?: DailyAssessmentRecord;
  className?: string;
  onSelectPart?: (partId: BodyPartId) => void;
}

export const BodyFigure: React.FC<BodyFigureProps> = ({
  latestAssessment,
  className = '',
  onSelectPart,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<BodyPartId>('chest');
  const [hoveredPartId, setHoveredPartId] = useState<BodyPartId | null>(null);

  const bodyParts = bodyPartsData as BodyPartDefinition[];

  // Evaluate status for each body part based on latest assessment results
  const evaluatedParts = useMemo<Record<BodyPartId, BodyPartEvaluation>>(() => {
    const map: Partial<Record<BodyPartId, BodyPartEvaluation>> = {};

    bodyParts.forEach((def) => {
      let status: HealthStatus = 'GREEN';
      let dominantReason = 'All linked physiological indicators are operating within nominal thresholds.';

      const contributing = def.linkedIndicators.map((key) => {
        const indResult = latestAssessment?.results[key];
        const indStatus: HealthStatus = indResult?.status || 'GREEN';
        const displayName = indResult?.displayName || key;
        const valueDisplay = indResult?.valueDisplay || 'Nominal';
        const unit = indResult?.unit || '';

        return {
          key,
          displayName,
          valueDisplay,
          unit,
          status: indStatus,
        };
      });

      // Triage hierarchy: RED > YELLOW > GREEN
      const hasRed = contributing.some((c) => c.status === 'RED');
      const hasYellow = contributing.some((c) => c.status === 'YELLOW');

      if (hasRed) {
        status = 'RED';
        const redIndicators = contributing.filter((c) => c.status === 'RED').map((c) => c.displayName);
        dominantReason = `Urgent alert: Significant deviation detected in ${redIndicators.join(', ')}. Microgravity countermeasure protocol review required.`;
      } else if (hasYellow) {
        status = 'YELLOW';
        const yellowIndicators = contributing.filter((c) => c.status === 'YELLOW').map((c) => c.displayName);
        dominantReason = `Operational advisory: Sub-nominal variance observed in ${yellowIndicators.join(', ')}. Enhanced telemetry monitoring advised.`;
      }

      const statusLabels: Record<HealthStatus, string> = {
        GREEN: 'Nominal / Cleared',
        YELLOW: 'Warning / Monitored',
        RED: 'Urgent Intervention Required',
      };

      map[def.id] = {
        definition: def,
        status,
        statusLabel: statusLabels[status],
        dominantReason,
        contributingIndicators: contributing,
      };
    });

    return map as Record<BodyPartId, BodyPartEvaluation>;
  }, [bodyParts, latestAssessment]);

  const activeEvaluation = evaluatedParts[selectedPartId] || evaluatedParts.chest;

  const handleSelect = (id: BodyPartId) => {
    setSelectedPartId(id);
    if (onSelectPart) {
      onSelectPart(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: BodyPartId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(id);
    }
  };

  // Color & visual helpers based on health status
  const getStatusColor = (status: HealthStatus, isHovered: boolean, isSelected: boolean) => {
    switch (status) {
      case 'RED':
        return {
          fill: isSelected ? 'rgba(239, 68, 68, 0.45)' : isHovered ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.22)',
          stroke: '#ef4444',
          glow: 'filter drop-shadow(0 0 8px rgba(239,68,68,0.7))',
        };
      case 'YELLOW':
        return {
          fill: isSelected ? 'rgba(245, 158, 11, 0.45)' : isHovered ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.22)',
          stroke: '#f59e0b',
          glow: 'filter drop-shadow(0 0 8px rgba(245,158,11,0.7))',
        };
      case 'GREEN':
      default:
        return {
          fill: isSelected ? 'rgba(16, 185, 129, 0.45)' : isHovered ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.20)',
          stroke: '#10b981',
          glow: 'filter drop-shadow(0 0 8px rgba(16,185,129,0.6))',
        };
    }
  };

  const getSystemIcon = (id: BodyPartId) => {
    switch (id) {
      case 'head':
        return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'chest':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'lungs':
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'abdomen':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'arms':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'legs':
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-space-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Click or navigate via <kbd className="px-1.5 py-0.5 rounded bg-space-800 text-cyan-300 font-mono text-[10px]">TAB</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-space-800 text-cyan-300 font-mono text-[10px]">ENTER</kbd> across the 6 anatomical telemetry regions.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-neon-green/40" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-neon-yellow/40" /> Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-neon-red/40 animate-pulse" /> Urgent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Interactive Holographic SVG Figure */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-[320/540] rounded-2xl p-4 bg-gradient-to-b from-space-950 via-space-900 to-space-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 flex items-center justify-center">
            
            {/* Background telemetry radar grid lines */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Corner tech ticks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

            {/* SVG Anatomy Canvas */}
            <svg
              viewBox="0 0 320 540"
              className="w-full h-full max-h-[500px] select-none"
              role="img"
              aria-label="Interactive anatomical astronaut model with 6 telemetry target regions"
            >
              <defs>
                <linearGradient id="bodyBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0e1526" />
                  <stop offset="100%" stopColor="#060913" />
                </linearGradient>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Holographic scanning horizontal sweep line */}
              <line
                x1="20"
                y1="260"
                x2="300"
                y2="260"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              {/* Anatomical Background Neutral Silhouette */}
              <g id="body-silhouette" opacity="0.4" pointerEvents="none">
                {/* Head */}
                <ellipse cx="160" cy="55" rx="30" ry="36" fill="#141d34" stroke="#334155" strokeWidth="1.5" />
                {/* Neck */}
                <path d="M150 90 L170 90 L172 104 L148 104 Z" fill="#141d34" stroke="#334155" strokeWidth="1" />
                {/* Torso & Pelvis */}
                <path
                  d="M120 104 L200 104 L208 170 L198 234 L122 234 L112 170 Z"
                  fill="#141d34"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Left Arm */}
                <path
                  d="M116 108 L90 128 L82 195 L72 268 L88 268 L98 198 L116 142 Z"
                  fill="#141d34"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Right Arm */}
                <path
                  d="M204 108 L230 128 L238 195 L248 268 L232 268 L222 198 L204 142 Z"
                  fill="#141d34"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Left Leg */}
                <path
                  d="M125 234 L155 234 L152 350 L146 480 L126 510 L114 510 L134 350 Z"
                  fill="#141d34"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Right Leg */}
                <path
                  d="M165 234 L195 234 L186 350 L206 510 L194 510 L174 480 L168 350 Z"
                  fill="#141d34"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              </g>

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 1: HEAD (Neuro-vestibular / Cognition) */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.head;
                const isSelected = selectedPartId === 'head';
                const isHovered = hoveredPartId === 'head';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-head"
                    tabIndex={0}
                    role="button"
                    aria-label={`Head & Neuro-Vestibular region. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('head')}
                    onKeyDown={(e) => handleKeyDown(e, 'head')}
                    onMouseEnter={() => setHoveredPartId('head')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    <ellipse
                      cx="160"
                      cy="54"
                      rx="28"
                      ry="34"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    <path
                      d="M152 86 L168 86 L170 100 L150 100 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    {/* Sensory radar wave marker */}
                    <path
                      d="M150 48 Q160 40 170 48"
                      fill="none"
                      stroke={c.stroke}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                    {/* Status Target Marker */}
                    <circle cx="160" cy="54" r={isSelected ? 5 : 3.5} fill={c.stroke} />
                    {isSelected && (
                      <circle cx="160" cy="54" r="9" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 2: LUNGS (Thoracic / ECLSS Heat Sync)  */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.lungs;
                const isSelected = selectedPartId === 'lungs';
                const isHovered = hoveredPartId === 'lungs';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-lungs"
                    tabIndex={0}
                    role="button"
                    aria-label={`Lungs & Pulmonary System. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('lungs')}
                    onKeyDown={(e) => handleKeyDown(e, 'lungs')}
                    onMouseEnter={() => setHoveredPartId('lungs')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    {/* Left Lung Lobe */}
                    <path
                      d="M125 108 C120 120 120 145 128 156 C136 156 142 148 144 135 C144 120 140 108 125 108 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Right Lung Lobe */}
                    <path
                      d="M195 108 C200 120 200 145 192 156 C184 156 178 148 176 135 C176 120 180 108 195 108 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Bronchial indicator lines */}
                    <line x1="130" y1="126" x2="140" y2="132" stroke={c.stroke} strokeWidth="1" opacity="0.6" />
                    <line x1="190" y1="126" x2="180" y2="132" stroke={c.stroke} strokeWidth="1" opacity="0.6" />
                    {isSelected && (
                      <>
                        <circle cx="134" cy="132" r="3" fill="#22d3ee" />
                        <circle cx="186" cy="132" r="3" fill="#22d3ee" />
                      </>
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 3: CHEST & HEART (Cardiovascular Core) */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.chest;
                const isSelected = selectedPartId === 'chest';
                const isHovered = hoveredPartId === 'chest';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-chest"
                    tabIndex={0}
                    role="button"
                    aria-label={`Chest & Cardiovascular Core. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('chest')}
                    onKeyDown={(e) => handleKeyDown(e, 'chest')}
                    onMouseEnter={() => setHoveredPartId('chest')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    {/* Central Cardiac Plate */}
                    <polygon
                      points="148,106 172,106 170,160 150,160"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Stylized Heart Pulse Node */}
                    <circle
                      cx="160"
                      cy="130"
                      r={isSelected ? 9 : 7}
                      fill={c.stroke}
                      opacity={evalData.status === 'RED' ? 0.95 : 0.8}
                      className={evalData.status === 'RED' ? 'animate-ping' : ''}
                    />
                    <circle cx="160" cy="130" r="5" fill="#ffffff" />
                    {/* ECG pulse accent */}
                    <path
                      d="M152 144 L157 144 L160 138 L163 148 L166 144 L170 144"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity="0.9"
                    />
                    {isSelected && (
                      <circle cx="160" cy="130" r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 4: ABDOMEN (Metabolic & Gut Energy)    */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.abdomen;
                const isSelected = selectedPartId === 'abdomen';
                const isHovered = hoveredPartId === 'abdomen';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-abdomen"
                    tabIndex={0}
                    role="button"
                    aria-label={`Abdomen & Metabolic System. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('abdomen')}
                    onKeyDown={(e) => handleKeyDown(e, 'abdomen')}
                    onMouseEnter={() => setHoveredPartId('abdomen')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    <path
                      d="M130 166 L190 166 L196 226 L124 226 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Glycemic metabolic hex icon */}
                    <polygon
                      points="160,186 168,191 168,201 160,206 152,201 152,191"
                      fill="none"
                      stroke={c.stroke}
                      strokeWidth="1.5"
                    />
                    <circle cx="160" cy="196" r="2.5" fill={c.stroke} />
                    {isSelected && (
                      <circle cx="160" cy="196" r="13" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" />
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 5: ARMS & EXTREMITIES (Dexterity/Load) */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.arms;
                const isSelected = selectedPartId === 'arms';
                const isHovered = hoveredPartId === 'arms';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-arms"
                    tabIndex={0}
                    role="button"
                    aria-label={`Arms & Upper Musculoskeletal Dexterity. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('arms')}
                    onKeyDown={(e) => handleKeyDown(e, 'arms')}
                    onMouseEnter={() => setHoveredPartId('arms')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    {/* Left Arm Upper + Forearm + Hand */}
                    <path
                      d="M116 110 L94 130 L86 195 L74 266 L86 266 L98 200 L118 145 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Right Arm Upper + Forearm + Hand */}
                    <path
                      d="M204 110 L226 130 L234 195 L246 266 L234 266 L222 200 L202 145 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Joint pivot markers */}
                    <circle cx="90" cy="196" r="3" fill={c.stroke} />
                    <circle cx="230" cy="196" r="3" fill={c.stroke} />
                    {isSelected && (
                      <>
                        <circle cx="90" cy="196" r="7" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx="230" cy="196" r="7" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                      </>
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* INTERACTIVE REGION 6: LEGS, FEMUR & BONE DENSITY          */}
              {/* ========================================================= */}
              {(() => {
                const evalData = evaluatedParts.legs;
                const isSelected = selectedPartId === 'legs';
                const isHovered = hoveredPartId === 'legs';
                const c = getStatusColor(evalData.status, isHovered, isSelected);

                return (
                  <g
                    id="part-legs"
                    tabIndex={0}
                    role="button"
                    aria-label={`Legs, Femur & Musculoskeletal Base. Status: ${evalData.statusLabel}.`}
                    onClick={() => handleSelect('legs')}
                    onKeyDown={(e) => handleKeyDown(e, 'legs')}
                    onMouseEnter={() => setHoveredPartId('legs')}
                    onMouseLeave={() => setHoveredPartId(null)}
                    className="cursor-pointer focus:outline-none transition-transform"
                  >
                    {/* Left Thigh, Knee, Calf, Foot */}
                    <path
                      d="M126 236 L154 236 L150 350 L144 480 L124 512 L112 512 L132 350 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Right Thigh, Knee, Calf, Foot */}
                    <path
                      d="M166 236 L194 236 L186 350 L206 512 L194 512 L174 480 L168 350 Z"
                      fill={c.fill}
                      stroke={isSelected ? '#22d3ee' : c.stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Knee joint sensor nodes */}
                    <circle cx="141" cy="350" r="3.5" fill={c.stroke} />
                    <circle cx="178" cy="350" r="3.5" fill={c.stroke} />
                    {isSelected && (
                      <>
                        <circle cx="141" cy="350" r="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx="178" cy="350" r="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
                      </>
                    )}
                  </g>
                );
              })()}
            </svg>

            {/* Live selected badge over figure */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-space-950/90 border border-slate-800 text-[11px] backdrop-blur-md">
              <span className="text-slate-400 font-mono">SELECTED:</span>
              <span className="text-cyan-300 font-semibold uppercase tracking-wider">
                {activeEvaluation.definition.name.split('&')[0].trim()}
              </span>
            </div>
          </div>

          {/* Quick selection chips below avatar */}
          <div className="w-full max-w-[340px] mt-4 flex flex-wrap gap-1.5 justify-center">
            {bodyParts.map((part) => {
              const isSelected = selectedPartId === part.id;
              const evalInfo = evaluatedParts[part.id];
              return (
                <button
                  key={part.id}
                  onClick={() => handleSelect(part.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan/20'
                      : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      evalInfo.status === 'RED'
                        ? 'bg-rose-500 animate-pulse'
                        : evalInfo.status === 'YELLOW'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{part.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detailed Telemetry Subsystem Side Panel */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            glow={
              activeEvaluation.status === 'RED'
                ? 'red'
                : activeEvaluation.status === 'YELLOW'
                ? 'yellow'
                : 'green'
            }
            title={activeEvaluation.definition.name}
            subtitle={`Subsystem: ${activeEvaluation.definition.regionName}`}
            icon={getSystemIcon(selectedPartId)}
            headerSlot={
              <StatusBadge
                status={activeEvaluation.status}
                label={activeEvaluation.statusLabel}
                size="sm"
              />
            }
          >
            <div className="space-y-4 text-xs font-sans">
              {/* Short Simple Function */}
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Primary Function & Operational Purpose
                </h4>
                <p className="text-slate-200 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                  {activeEvaluation.definition.shortFunction}
                </p>
              </div>

              {/* Status Reason & Clinical Departure */}
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Current Microgravity Evaluation
                </h4>
                <p className="text-slate-300 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                  {activeEvaluation.dominantReason}
                </p>
              </div>

              {/* Contributing Linked Indicators */}
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Linked Telemetry Indicators ({activeEvaluation.contributingIndicators.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeEvaluation.contributingIndicators.map((ind) => (
                    <div
                      key={ind.key}
                      className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="overflow-hidden mr-2">
                        <div className="text-slate-300 font-medium truncate">{ind.displayName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          Reading: <span className="text-cyan-300 font-semibold">{ind.valueDisplay}</span> {ind.unit}
                        </div>
                      </div>
                      <StatusBadge status={ind.status} size="sm" showIcon={false} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Spaceflight Impact & Recommended Countermeasures */}
              <div className="grid grid-cols-1 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-space-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Microgravity Adaptation Context
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {activeEvaluation.definition.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-space-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-mono text-emerald-400 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Targeted Countermeasure Protocols
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {activeEvaluation.definition.countermeasures}
                  </p>
                </div>
              </div>

              {/* Scientific Source / Literature Reference for Eman & Moazzama */}
              <div className="p-3 rounded-lg bg-space-950/90 border border-cyan-500/20 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-1 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>SCIENTIFIC SOURCE / PROTOCOL REFERENCE:</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {activeEvaluation.definition.source}
                </p>
              </div>

              {/* Mandatory Medical Decision Support Disclaimer */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300/90 text-[11px]">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>Disclaimer:</strong> Decision support only, not a medical diagnosis. Prototype designed for the NASA Space Apps Challenge 2026.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

