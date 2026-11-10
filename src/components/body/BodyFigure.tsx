/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Figure — Photo overlay edition
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 *
 * Uses the realistic anatomy illustration at /anatomy/body-full.png
 * with an SVG overlay (viewBox="0 0 100 100") carrying percentage-coordinate hotspots
 * loaded from src/data/bodyHotspots.json.
 *
 * All part metadata lives in src/data/bodyParts.json.
 * bilateral:true parts auto-expand to -left / -right variants.
 * Parts with no linkedIndicators show a neutral GREY educational status.
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

import {
  BodyPartDefinition,
  BodyPartEvaluation,
  BodyHotspot,
  ResolvedBodyPart,
  IndicatorKey,
} from '../../types/bodyMap';
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
  Search,
  Edit3,
  Download,
  X,
} from 'lucide-react';

// ─── Type-safe JSON imports ───────────────────────────────────────────────────
const bodyPartsData = rawBodyParts as BodyPartDefinition[];
const hotspotsData = rawHotspots as BodyHotspot[];

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

function getStatusGlowColor(status: ExtendedStatus, opacity: number): string {
  switch (status) {
    case 'RED':    return `rgba(239, 68, 68, ${opacity})`;
    case 'YELLOW': return `rgba(245, 158, 11, ${opacity})`;
    case 'GREEN':  return `rgba(16, 185, 129, ${opacity})`;
    default:       return `rgba(100, 116, 139, ${opacity})`; // slate-500
  }
}

function getStatusStroke(status: ExtendedStatus): string {
  switch (status) {
    case 'RED':    return '#ef4444';
    case 'YELLOW': return '#f59e0b';
    case 'GREEN':  return '#10b981';
    default:       return '#64748b';
  }
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
  'Neurological', 'Cardiovascular', 'Pulmonary', 'Metabolic',
  'Gastrointestinal', 'Renal', 'Musculoskeletal', 'Integumentary',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const BodyFigure: React.FC<BodyFigureProps> = ({
  latestAssessment,
  className = '',
  onSelectPart,
}) => {
  const resolvedParts = useMemo(() => resolveBodyParts(bodyPartsData), []);
  const [hotspots, setHotspots] = useState<BodyHotspot[]>(hotspotsData);

  const [selectedId, setSelectedId] = useState<string>('heart');
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editMode, setEditMode]       = useState(false);
  const [dragState, setDragState]     = useState<DragState | null>(null);

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
          status: 'GREEN', // neutral — we'll represent separately via ExtendedStatus
          statusLabel: statusLabels.NEUTRAL,
          dominantReason: 'Educational information only — no live telemetry indicator is currently linked to this region. Data will be populated after Nov 13 NASA resource delivery.',
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(id); }
  }, [handleSelect]);

  // ─── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setHighlightId(null); return; }
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
  const handleHotspotMouseDown = (e: React.MouseEvent, id: string) => {
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
      const scaleY = 100 / rect.height;
      const dx = (e.clientX - dragState.startMouseX) * scaleX;
      const dy = (e.clientY - dragState.startMouseY) * scaleY;
      setHotspots((prev) =>
        prev.map((h) =>
          h.id === dragState.hotspotId
            ? { ...h, cx: dragState.startCx + dx, cy: dragState.startCy + dy }
            : h
        )
      );
    };
    const onUp = () => setDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragState]);

  const exportHotspots = () => {
    const json = JSON.stringify(hotspots, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'bodyHotspots.json'; a.click();
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

  // ─── Render hotspot shape ────────────────────────────────────────────────────
  const renderHotspot = (hs: BodyHotspot) => {
    // find the resolved part for this hotspot id
    const rp = resolvedParts.find((p) => p.id === hs.id);
    const ev = rp ? evaluations.get(rp.id) : undefined;
    const noIndicators = !ev || ev.contributingIndicators.length === 0;
    const extStatus: ExtendedStatus = noIndicators ? 'NEUTRAL' : (ev?.status ?? 'GREEN');

    const isSelected  = selectedId  === hs.id;
    const isHovered   = hoveredId   === hs.id;
    const isHighlight = highlightId === hs.id;

    const baseOpacity  = editMode ? 0.4 : isSelected ? 0.35 : isHovered ? 0.25 : 0.0;
    const strokeOpacity = editMode ? 1 : isSelected || isHovered || isHighlight ? 1 : 0;
    const fill   = getStatusGlowColor(extStatus, baseOpacity);
    const stroke = isSelected || isHighlight ? '#22d3ee' : getStatusStroke(extStatus);
    const strokeW = isSelected ? 1.5 : isHovered ? 1.0 : editMode ? 0.8 : 0;

    const sharedProps = {
      fill,
      stroke,
      strokeWidth: strokeW,
      strokeOpacity,
      style: {
        cursor: editMode ? 'move' : 'pointer',
        filter: (isSelected || isHighlight)
          ? `drop-shadow(0 0 6px ${getStatusGlowColor(extStatus, 0.9)})`
          : isHovered
          ? `drop-shadow(0 0 4px ${getStatusGlowColor(extStatus, 0.7)})`
          : 'none',
        transition: editMode ? 'none' : 'fill 0.15s, stroke 0.15s',
      },
      tabIndex: 0,
      role: 'button' as const,
      'aria-label': `${hs.label}${rp ? ` — ${ev?.statusLabel ?? ''}` : ''}`,
      'aria-pressed': isSelected,
      onClick:    () => { if (!editMode && rp) handleSelect(rp.id); },
      onKeyDown:  (e: React.KeyboardEvent<SVGElement>) => { if (rp) handleKeyDown(e, rp.id); },
      onMouseEnter: () => setHoveredId(hs.id),
      onMouseLeave: () => setHoveredId(null),
      onMouseDown: (e: React.MouseEvent<SVGElement>) => handleHotspotMouseDown(e, hs.id),
    };

    if (hs.shape === 'ellipse' && hs.cx != null && hs.cy != null) {
      return (
        <ellipse
          key={hs.id}
          cx={`${hs.cx}%`}
          cy={`${hs.cy}%`}
          rx={`${hs.rx ?? 5}%`}
          ry={`${hs.ry ?? 5}%`}
          {...sharedProps}
        />
      );
    }
    if (hs.shape === 'polygon' && hs.points) {
      // Convert space-separated "x,y" percentage pairs to SVG polygon points
      return (
        <polygon
          key={hs.id}
          points={hs.points}
          {...sharedProps}
        />
      );
    }
    return null;
  };

  // ─── Info panel icon ─────────────────────────────────────────────────────────
  const getSystemIcon = (system: string): React.ReactNode =>
    SYSTEM_ICON_MAP[system] ?? <Activity className="w-4 h-4 text-cyan-400" />;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-4 ${className}`}>

      {/* ── Top toolbar ───────────────────────────────────────────────────── */}
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

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Anatomy image + SVG overlay ─────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">

          {editMode && (
            <div className="w-full px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono">
              ✦ HOTSPOT EDITOR ACTIVE — drag ellipses to reposition · Export JSON when done
            </div>
          )}

          {/* Body panel: image + SVG overlay stacked */}
          <div
            className="relative w-full max-w-[300px] rounded-2xl overflow-hidden"
            style={{ aspectRatio: '1 / 2' }}
          >
            {/* Corner ticks */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 z-10 pointer-events-none" />

            {/* Background — dark panel, no border on image */}
            <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />

            {/* Subtle dot-grid ambiance */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* Anatomy photo — transparent PNG, blends into dark background */}
            <img
              src="/anatomy/body-full.png"
              alt="Frontal anatomy illustration — interactive regions highlighted above"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ mixBlendMode: 'screen', opacity: 0.92 }}
              draggable={false}
            />

            {/* SVG overlay — viewBox 0 0 100 100 (percentage coords) */}
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              style={{ userSelect: 'none' }}
              role="img"
              aria-label="Interactive anatomical body map with clickable telemetry regions"
            >
              {/* Render skin hotspot last (behind all others) so it doesn't eat clicks */}
              {hotspots.filter((h) => h.id !== 'skin').map(renderHotspot)}
            </svg>

            {/* Selected part mini-label */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between bg-space-950/90 backdrop-blur-md text-[11px] border-t border-slate-800">
              <span className="text-slate-400 font-mono">SELECTED</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[55%] text-right">
                {activeEval?.resolvedPart.displayName ?? '—'}
              </span>
            </div>
          </div>

          {/* ── Chip grid grouped by system ─────────────────────────────── */}
          <div className="w-full max-w-[300px] max-h-56 overflow-y-auto rounded-xl bg-space-950/80 border border-slate-800 p-2 space-y-2 scrollbar-thin scrollbar-track-space-950 scrollbar-thumb-slate-700">
            {searchQuery.trim()
              ? /* flat filtered list */
                (<div className="flex flex-wrap gap-1">
                  {filteredParts.map((p) => {
                    const ev = evaluations.get(p.id);
                    const noInd = !ev || ev.contributingIndicators.length === 0;
                    const extSt: ExtendedStatus = noInd ? 'NEUTRAL' : (ev?.status ?? 'GREEN');
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
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
              : /* grouped by system */
                SYSTEM_ORDER.map((sys) => {
                  const parts = partsBySystem[sys];
                  if (!parts) return null;
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
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan/20'
                                  : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotClass(extSt)}`} />
                              {/* Use short name: "Right Femur" → "R.Femur" for bilateral */}
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

        {/* ── RIGHT: Info panel ───────────────────────────────────────────── */}
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

                {/* Function */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Primary Function & Operational Purpose
                  </h4>
                  <p className="text-slate-200 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                    {activeEval.resolvedPart.definition.shortFunction}
                  </p>
                </div>

                {/* Status reason */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Current Microgravity Evaluation
                  </h4>
                  <p className="text-slate-300 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-slate-800">
                    {activeEval.dominantReason}
                  </p>
                </div>

                {/* Linked indicators */}
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

                {/* Microgravity context + countermeasures */}
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

                {/* Source */}
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
