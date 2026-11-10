/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Figure — Holographic Digital Twin Edition
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 *
 * Implements the "HUMAN DIGITAL TWIN" center panel from the mission control interface.
 * Built entirely with vector SVG, four toggleable layers (Surface, Skeleton, Organs, Landmarks),
 * interactive telemetry hotspots, data-driven HUD callouts, and clinical decision support triage.
 *
 * All part definitions: src/data/bodyParts.json
 * All hotspot geometries: src/data/bodyHotspots.json
 * All HUD callouts: src/data/bodyCallouts.json
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import rawBodyParts from '../../data/bodyParts.json';
import rawHotspots from '../../data/bodyHotspots.json';
import rawCallouts from '../../data/bodyCallouts.json';

import {
  BodyPartDefinition,
  BodyPartEvaluation,
  BodyHotspot,
  BodyCallout,
  ResolvedBodyPart,
  IndicatorKey,
  HoloLayersState,
} from '../../types/bodyMap';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';
import { HoloBody } from './HoloBody';
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
  Search,
  Edit3,
  Download,
  X,
  Layers,
  Radio,
} from 'lucide-react';

// ─── Type-safe JSON imports ───────────────────────────────────────────────────
const bodyPartsData = rawBodyParts as BodyPartDefinition[];
const hotspotsData = rawHotspots as BodyHotspot[];
const calloutsData = rawCallouts as BodyCallout[];

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtendedStatus = HealthStatus | 'NEUTRAL';

interface DragState {
  hotspotId: string;
  startMouseX: number;
  startMouseY: number;
  startCx: number;
  startCy: number;
}

interface BodyFigureProps {
  latestAssessment?: DailyAssessmentRecord;
  className?: string;
  onSelectPart?: (partId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Expand bilateral parts → left + right resolved entries, single parts → one */
function resolveBodyParts(defs: BodyPartDefinition[]): ResolvedBodyPart[] {
  const out: ResolvedBodyPart[] = [];
  for (const def of defs) {
    if (def.bilateral) {
      out.push({
        id: `${def.id}-right`,
        baseId: def.id,
        displayName: `Right ${def.name}`,
        side: 'right',
        definition: def,
      });
      out.push({
        id: `${def.id}-left`,
        baseId: def.id,
        displayName: `Left ${def.name}`,
        side: 'left',
        definition: def,
      });
    } else {
      out.push({
        id: def.id,
        baseId: def.id,
        displayName: def.name,
        side: 'none',
        definition: def,
      });
    }
  }
  return out;
}

function getStatusDotClass(status: ExtendedStatus): string {
  switch (status) {
    case 'RED':    return 'bg-rose-500 animate-pulse';
    case 'YELLOW': return 'bg-amber-400';
    case 'GREEN':  return 'bg-emerald-400';
    default:       return 'bg-slate-500';
  }
}

const SYSTEM_ICON_MAP: Record<string, React.ReactNode> = {
  Neurological:   <Brain    className="w-4 h-4 text-cyan-400" />,
  Cardiovascular: <Heart    className="w-4 h-4 text-rose-400" />,
  Pulmonary:      <Wind     className="w-4 h-4 text-cyan-400" />,
  Metabolic:      <Flame    className="w-4 h-4 text-amber-400" />,
  Gastrointestinal:<Flame   className="w-4 h-4 text-orange-400" />,
  Renal:          <Zap      className="w-4 h-4 text-blue-400" />,
  Musculoskeletal:<Activity className="w-4 h-4 text-emerald-400" />,
  Integumentary:  <Sparkles className="w-4 h-4 text-pink-400" />,
};

const SYSTEM_ORDER: string[] = [
  'Neurological',
  'Cardiovascular',
  'Pulmonary',
  'Metabolic',
  'Gastrointestinal',
  'Renal',
  'Musculoskeletal',
  'Integumentary',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const BodyFigure: React.FC<BodyFigureProps> = ({
  latestAssessment,
  className = '',
  onSelectPart,
}) => {
  const resolvedParts = useMemo(() => resolveBodyParts(bodyPartsData), []);
  const [hotspots, setHotspots] = useState<BodyHotspot[]>(hotspotsData);

  // 4 Toggleable layers matching Image 1
  const [layers, setLayers] = useState<HoloLayersState>({
    surface: true,
    skeleton: true,
    organs: true,
    landmarks: true,
  });

  const [selectedId, setSelectedId] = useState<string>('heart');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // ─── Evaluate each resolved part ────────────────────────────────────────────
  const evaluations = useMemo<Map<string, BodyPartEvaluation>>(() => {
    const map = new Map<string, BodyPartEvaluation>();
    const statusLabels: Record<ExtendedStatus, string> = {
      GREEN:   'Nominal / Cleared',
      YELLOW:  'Warning / Monitored',
      RED:     'Urgent Intervention Required',
      NEUTRAL: 'Educational — No Live Indicator',
    };

    for (const rp of resolvedParts) {
      const indicators = rp.definition.linkedIndicators as IndicatorKey[];

      if (indicators.length === 0) {
        // No linked indicator → neutral grey educational status
        map.set(rp.id, {
          resolvedPart: rp,
          status: 'GREEN',
          statusLabel: statusLabels.NEUTRAL,
          dominantReason: 'Educational information only — no live telemetry indicator is currently linked to this region. Telemetry models will expand with Nov 13 NASA resources.',
          contributingIndicators: [],
        });
        continue;
      }

      const contributing = indicators.map((key) => {
        const indResult = latestAssessment?.results[key];
        return {
          key,
          displayName: indResult?.displayName ?? key,
          valueDisplay: indResult?.valueDisplay ?? '—',
          unit:         indResult?.unit ?? '',
          status:       (indResult?.status ?? 'GREEN') as HealthStatus,
        };
      });

      const hasRed    = contributing.some((c) => c.status === 'RED');
      const hasYellow = contributing.some((c) => c.status === 'YELLOW');
      let status: HealthStatus = 'GREEN';
      let dominantReason = 'All linked physiological indicators are within nominal operational thresholds.';

      if (hasRed) {
        status = 'RED';
        const names = contributing.filter((c) => c.status === 'RED').map((c) => c.displayName);
        dominantReason = `Urgent alert: Critical deviation detected in ${names.join(', ')}. Microgravity countermeasure review required.`;
      } else if (hasYellow) {
        status = 'YELLOW';
        const names = contributing.filter((c) => c.status === 'YELLOW').map((c) => c.displayName);
        dominantReason = `Operational advisory: Sub-nominal variance in ${names.join(', ')}. Enhanced telemetry monitoring advised.`;
      }

      map.set(rp.id, {
        resolvedPart: rp,
        status,
        statusLabel: statusLabels[status],
        dominantReason,
        contributingIndicators: contributing,
      });
    }
    return map;
  }, [resolvedParts, latestAssessment]);

  // Active evaluation for the info panel
  const activeEval = evaluations.get(selectedId) ?? evaluations.get('heart');

  // Determine whether the selected part has no indicators (neutral)
  const isNeutral = (activeEval?.contributingIndicators.length ?? 0) === 0;

  // ─── Selection ──────────────────────────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (onSelectPart) onSelectPart(id);
  }, [onSelectPart]);

  // ─── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setHighlightId(null);
      return;
    }
    const lower = q.toLowerCase();
    const match = resolvedParts.find(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.definition.system.toLowerCase().includes(lower) ||
        p.definition.regionName.toLowerCase().includes(lower)
    );
    if (match) {
      setHighlightId(match.id);
      setSelectedId(match.id);
    } else {
      setHighlightId(null);
    }
  };

  // ─── Edit-mode drag ─────────────────────────────────────────────────────────
  const handleHotspotMouseDown = (e: React.MouseEvent<SVGElement>, id: string) => {
    if (!editMode) return;
    e.preventDefault();
    const hs = hotspots.find((h) => h.id === id);
    if (!hs || hs.shape !== 'ellipse' || hs.cx == null || hs.cy == null) return;
    setDragState({
      hotspotId: id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startCx: hs.cx,
      startCy: hs.cy,
    });
  };

  useEffect(() => {
    if (!dragState) return;
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 100 / rect.width;
      const scaleY = 200 / rect.height;
      const dx = (e.clientX - dragState.startMouseX) * scaleX;
      const dy = (e.clientY - dragState.startMouseY) * scaleY;
      setHotspots((prev) =>
        prev.map((h) =>
          h.id === dragState.hotspotId
            ? { ...h, cx: Math.round((dragState.startCx + dx) * 10) / 10, cy: Math.round((dragState.startCy + dy) * 10) / 10 }
            : h
        )
      );
    };
    const onUp = () => setDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState]);

  const exportHotspots = () => {
    const json = JSON.stringify(hotspots, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'bodyHotspots.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Chips grouped by system ─────────────────────────────────────────────────
  const partsBySystem = useMemo(() => {
    const grouped: Record<string, ResolvedBodyPart[]> = {};
    for (const p of resolvedParts) {
      const sys = p.definition.system;
      if (!grouped[sys]) grouped[sys] = [];
      grouped[sys].push(p);
    }
    return grouped;
  }, [resolvedParts]);

  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return resolvedParts;
    const q = searchQuery.toLowerCase();
    return resolvedParts.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.definition.system.toLowerCase().includes(q)
    );
  }, [resolvedParts, searchQuery]);

  // ─── Info panel icon ─────────────────────────────────────────────────────────
  const getSystemIcon = (system: string): React.ReactNode =>
    SYSTEM_ICON_MAP[system] ?? <Activity className="w-4 h-4 text-cyan-400" />;

  // ─── Layer Toggle Handler ───────────────────────────────────────────────────
  const toggleLayer = (layerKey: keyof HoloLayersState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-4 ${className}`}>

      {/* ── Top Mission Control Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-space-900/90 border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search body part or system…"
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-space-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setHighlightId(null); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Urgent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Info only
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
              editMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle hotspot editor — drag ellipses to reposition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editMode ? 'Editing…' : 'Edit Hotspots'}
          </button>
          {editMode && (
            <button
              onClick={exportHotspots}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all"
              title="Export updated hotspot JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          )}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-space-800 text-cyan-300 font-mono text-[10px]">TAB</kbd>
              {' '}/{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-space-800 text-cyan-300 font-mono text-[10px]">ENTER</kbd>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Human Digital Twin Hologram Panel ───────────────────────── */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">

          {editMode && (
            <div className="w-full px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono">
              ✦ HOTSPOT EDITOR ACTIVE — drag ellipses to reposition · Export JSON when done
            </div>
          )}

          {/* Holographic Body Container (Matches Image 1 Center Twin Panel) */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-space-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 p-3">

            {/* Corner Sci-Fi Tech Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-400/60 z-10 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-400/60 z-10 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-400/60 z-10 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-400/60 z-10 pointer-events-none" />

            {/* Subtle Matrix Dot Grid Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Top HUD Header */}
            <div className="relative z-10 flex items-start justify-between border-b border-cyan-500/20 pb-2 mb-2">
              <div>
                <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>02 &nbsp; HUMAN DIGITAL TWIN</span>
                </div>
                <div className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                  MULTILAYER VOLUME / ANTERIOR PROJECTION
                </div>
              </div>

              {/* Active Scan Indicator */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE SCAN</span>
              </div>
            </div>

            {/* Center Vector Holographic Body Figure (Scales to ~90% panel height) */}
            <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] flex items-center justify-center">
              <HoloBody
                layers={layers}
                hotspots={hotspots}
                resolvedParts={resolvedParts}
                evaluations={evaluations}
                callouts={calloutsData}
                selectedId={selectedId}
                hoveredId={hoveredId}
                highlightId={highlightId}
                editMode={editMode}
                onSelectPart={handleSelect}
                onHoverPart={setHoveredId}
                onHotspotMouseDown={handleHotspotMouseDown}
                svgRef={svgRef}
              />

              {/* Bottom-Left Layers Legend (Directly matching Image 1) */}
              <div className="absolute bottom-2 left-2 z-20 p-2 rounded-lg bg-space-950/90 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono space-y-1 shadow-lg">
                <div className="text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>LAYERS</span>
                </div>
                {(['surface', 'skeleton', 'organs', 'landmarks'] as const).map((layerKey) => {
                  const isActive = layers[layerKey];
                  return (
                    <button
                      key={layerKey}
                      onClick={() => toggleLayer(layerKey)}
                      className="flex items-center gap-1.5 text-left w-full hover:text-cyan-200 transition-colors"
                      title={`Toggle ${layerKey.toUpperCase()} layer`}
                    >
                      <span
                        className={`w-2 h-2 rounded-[2px] border transition-all ${
                          isActive
                            ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.7)]'
                            : 'bg-transparent border-slate-600'
                        }`}
                      />
                      <span className={isActive ? 'text-cyan-300' : 'text-slate-500'}>
                        {layerKey.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom HUD Telemetry Status Strip */}
            <div className="relative z-10 mt-2 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">01 / VOLUME</span>
              <span className="text-cyan-400">02 / ANATOMY</span>
              <span className="text-slate-500">03 / TRACKING (12/12)</span>
            </div>
          </div>

          {/* ── Chips Grid Grouped by System (All 33 parts, L/R side-by-side, no stray comma) ── */}
          <div className="w-full max-h-60 overflow-y-auto rounded-xl bg-space-950/80 border border-slate-800 p-2.5 space-y-2.5 scrollbar-thin scrollbar-track-space-950 scrollbar-thumb-slate-700">
            {searchQuery.trim()
              ? /* Flat filtered list */
                (<div className="flex flex-wrap gap-1">
                  {filteredParts.map((p) => {
                    const ev = evaluations.get(p.id);
                    const noInd = !ev || ev.contributingIndicators.length === 0;
                    const extSt: ExtendedStatus = noInd ? 'NEUTRAL' : (ev?.status ?? 'GREEN');
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                          selectedId === p.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotClass(extSt)}`} />
                        {p.displayName}
                      </button>
                    );
                  })}
                </div>)
              : /* Grouped by system with bilateral L/R paired side-by-side */
                SYSTEM_ORDER.map((sys) => {
                  const parts = partsBySystem[sys];
                  if (!parts || parts.length === 0) return null;
                  return (
                    <div key={sys}>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        {getSystemIcon(sys)}
                        <span>{sys}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {parts.map((p) => {
                          const ev = evaluations.get(p.id);
                          const noInd = !ev || ev.contributingIndicators.length === 0;
                          const extSt: ExtendedStatus = noInd ? 'NEUTRAL' : (ev?.status ?? 'GREEN');
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelect(p.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                                selectedId === p.id
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                                  : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotClass(extSt)}`} />
                              {p.side !== 'none'
                                ? `${p.side === 'right' ? 'R.' : 'L.'}${p.definition.name}`
                                : p.definition.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ── RIGHT: Clinical Decision Support & Telemetry Info Panel ───────── */}
        <div className="lg:col-span-7 space-y-4">
          {activeEval && (
            <Card
              glow={
                isNeutral ? 'none'
                : activeEval.status === 'RED' ? 'red'
                : activeEval.status === 'YELLOW' ? 'yellow'
                : 'green'
              }
              title={activeEval.resolvedPart.displayName}
              subtitle={`System: ${activeEval.resolvedPart.definition.system} · ${activeEval.resolvedPart.definition.regionName}`}
              icon={getSystemIcon(activeEval.resolvedPart.definition.system)}
              headerSlot={
                isNeutral ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono bg-slate-900 border-slate-700 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>EDUCATIONAL INFO</span>
                  </span>
                ) : (
                  <StatusBadge
                    status={activeEval.status}
                    label={activeEval.statusLabel}
                    size="sm"
                  />
                )
              }
            >
              <div className="space-y-4 text-xs font-sans">

                {/* Primary Function */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Primary Function & Operational Purpose
                  </h4>
                  <p className="text-slate-200 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                    {activeEval.resolvedPart.definition.shortFunction}
                  </p>
                </div>

                {/* Status Reason & Microgravity Triage */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Current Microgravity Evaluation
                  </h4>
                  <p className="text-slate-300 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                    {activeEval.dominantReason}
                  </p>
                </div>

                {/* Linked Telemetry Indicators */}
                {activeEval.contributingIndicators.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Linked Telemetry Indicators ({activeEval.contributingIndicators.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeEval.contributingIndicators.map((ind) => (
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
                )}

                {/* Microgravity Context + Countermeasures */}
                <div className="grid grid-cols-1 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-space-950/60 border border-slate-800/80">
                    <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Microgravity Adaptation Context
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {activeEval.resolvedPart.definition.description}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-space-950/60 border border-slate-800/80">
                    <div className="text-[11px] font-mono text-emerald-400 mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Targeted Countermeasure Protocols
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {activeEval.resolvedPart.definition.countermeasures}
                    </p>
                  </div>
                </div>

                {/* Scientific Source / Protocol Reference */}
                <div className="p-3 rounded-lg bg-space-950/90 border border-cyan-500/20 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-cyan-400 mb-1 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>SCIENTIFIC SOURCE / PROTOCOL REFERENCE:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {activeEval.resolvedPart.definition.source}
                  </p>
                  <div className="mt-1 text-[10px] text-slate-500 font-sans">
                    Review status: <span className="text-amber-400 uppercase">{activeEval.resolvedPart.definition.reviewStatus}</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300/90 text-[11px]">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <p>
                    <strong>Disclaimer:</strong> Decision support only, not a medical diagnosis. Prototype for NASA Space Apps Challenge 2026.
                  </p>
                </div>

              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
