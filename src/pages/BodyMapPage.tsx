/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Map & Digital Twin Page
 * Lead Developer: Abdul Rafay | Visualization: Sameen | UI: Abdullah
 * 
 * Supports both:
 *  - 3D Holographic Twin (Three.js WebGL with 360° Drag Rotation & Real-time Pulsing Organs)
 *  - 2D Digital Twin (Exact reproduction of 03_interactive_body_overview.png with ECG & Quick Info)
 */

import React, { useState } from 'react';
import { HumanDigitalTwin3D } from '../components/body/HumanDigitalTwin3D';
import { HumanDigitalTwin2D } from '../components/body/HumanDigitalTwin2D';
import { BodyFigure } from '../components/body/BodyFigure';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { Card } from '../components/common/Card';
import {
  User,
  ShieldAlert,
  Sparkles,
  Info,
  HeartPulse,
  Rotate3d,
  Layers,
  LayoutGrid,
} from 'lucide-react';

interface BodyMapPageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onNavigateToAssessment: () => void;
  initialSelectedPartId?: string;
}

export const BodyMapPage: React.FC<BodyMapPageProps> = ({
  profile: _profile,
  latestAssessment,
  onNavigateToAssessment,
  initialSelectedPartId,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d_clean' | '2d_detailed'>('2d_clean');
  const [selectedOrganId, setSelectedOrganId] = useState<string>(initialSelectedPartId || 'heart');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 select-none">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c142b] via-[#091026] to-[#0c142b] border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA SPACE APPS 2026 • HUMAN DIGITAL TWIN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-sans tracking-wide flex items-center gap-2.5">
              <User className="w-6 h-6 text-cyan-400" />
              Astronaut Human Digital Twin
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              Explore your body and check different physiological systems. Rotate the 3D twin 360° or switch to the 2D schematic overview to inspect real-time biometrics and NASA countermeasures.
            </p>
          </div>

          {/* Mode Switcher: 3D Twin vs 2D Clean vs 2D Detailed */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 rounded-2xl bg-[#060a1a] border border-blue-500/30 shadow-lg">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-4 h-4" />
                <span>3D TWIN (360°)</span>
              </button>
              <button
                onClick={() => setViewMode('2d_clean')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  viewMode === '2d_clean'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>2D OVERVIEW</span>
              </button>
              <button
                onClick={() => setViewMode('2d_detailed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  viewMode === '2d_detailed'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>ANATOMICAL LAYERS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Viewer Switch */}
      {viewMode === '3d' && (
        <HumanDigitalTwin3D
          latestAssessment={latestAssessment}
          selectedOrganId={selectedOrganId}
          onSelectOrgan={(id) => setSelectedOrganId(id)}
          height={600}
        />
      )}

      {viewMode === '2d_clean' && (
        <HumanDigitalTwin2D
          latestAssessment={latestAssessment}
          initialSelectedId={selectedOrganId}
          onSelectSystem={(id) => setSelectedOrganId(id)}
        />
      )}

      {viewMode === '2d_detailed' && (
        <BodyFigure
          latestAssessment={latestAssessment}
          initialSelectedId={selectedOrganId}
        />
      )}

      {/* Auxiliary Context & Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          glow="cyan"
          title="Digital Twin Telemetry Sync"
          subtitle="Real-time multi-sensor fusion"
          icon={<HeartPulse className="w-4 h-4 text-cyan-400" />}
        >
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The Human Digital Twin pulses and updates in real time based on active bio-telemetry. The cardiovascular core node beats synchronously with your logged heart rate ({latestAssessment?.values.heartRate || 72} BPM), and organ aura colors reflect microgravity operational flight tolerances.
          </p>
        </Card>

        <Card
          glow="none"
          title="Flight Operations Notice"
          subtitle="Autonomous deep space decision support"
          icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Organ status colors (Green/Yellow/Red) are automatically triaged from the latest telemetry check-in. If any linked vital enters a Warning or Critical state, the organ illuminates with urgent advisory.
            </p>
            {!latestAssessment && (
              <button
                onClick={onNavigateToAssessment}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-600/40 transition-all text-center block"
              >
                + Complete Initial Telemetry Assessment
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Official Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#0c142b]/80 border border-[#1b2752] flex items-center gap-3 text-xs text-slate-400 backdrop-blur-md">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-200 font-semibold">NASA Space Apps Challenge 2026 Prototype:</strong> This 360° interactive digital twin serves as autonomous engineering decision support for communication-delayed deep space missions (e.g. Mars surface analog) and does not replace certified NASA Flight Surgeons.
        </p>
      </div>

    </div>
  );
};
