/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: HoloBody — Vector Holographic Human Digital Twin
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 *
 * Front-view full-body holographic anatomical avatar built entirely as inline vector SVG.
 * Replicates the "HUMAN DIGITAL TWIN" center panel from the mission control interface (Image 1).
 *
 * Anatomical enhancements:
 * - Proportional arms hanging ~10-15° away from torso, reaching mid-thigh (~y=127.5).
 * - Upper arm and forearm of equal length (~35 units each); hand is ~1/9 body height (~23.5 units).
 * - Smooth bezier silhouette: deltoid caps, bicep curves, rounded elbow, tapered forearm,
 *   palm and 5 separate fingers with visible thumb on inner side angled outward.
 * - Complete arm skeleton: clavicle/scapula tips, humerus with rounded head, radius & ulna
 *   side by side, carpals, 5 metacarpals, 3-segment phalanges (2 for thumb) with joint dots.
 * - Joint circles at shoulder, elbow, wrist.
 * - 3D wireframe mesh rings across upper arms, forearms and palms.
 * - Exact hotspots for shoulders, upper arms, forearms, and hands (as single polygons).
 */

import React, { useId, useMemo } from 'react';
import { BodyHotspot, BodyCallout, ResolvedBodyPart, BodyPartEvaluation, HoloLayersState } from '../../types/bodyMap';
import { HealthStatus } from '../../types/health';

type ExtendedStatus = HealthStatus | 'NEUTRAL';

interface HoloBodyProps {
  layers: HoloLayersState;
  hotspots: BodyHotspot[];
  resolvedParts: ResolvedBodyPart[];
  evaluations: Map<string, BodyPartEvaluation>;
  callouts: BodyCallout[];
  selectedId: string;
  hoveredId: string | null;
  highlightId: string | null;
  editMode: boolean;
  onSelectPart: (partId: string) => void;
  onHoverPart: (partId: string | null) => void;
  onHotspotMouseDown?: (e: React.MouseEvent<SVGElement>, id: string) => void;
  svgRef?: React.RefObject<SVGSVGElement>;
}

// ─── Realistic Anatomical Body Silhouette Path ────────────────────────────────
// Arms angled 10-15° outward, fingertips reaching mid-thigh (y=127.5),
// palm with 5 articulated fingers and thumb on the medial/inner side.
export const BODY_SILHOUETTE_PATH = `
  M 50 10.5
  C 55 10.5 56.5 14 56.5 17
  C 56.5 21 54.5 24 53.5 25.5
  L 54 29.5
  L 67 33.5
  C 71 34.5 73.5 37 74.5 41
  C 75.5 47 75.5 56 75.0 64
  C 74.8 66 74.5 68 74.0 70
  C 75.5 76 77.0 84 78.0 92
  C 78.5 96 79.0 100 79.5 103.5
  C 77.5 107 75.0 110 73.5 114
  C 72.8 116 73.5 117.5 75.0 117
  C 76.5 116.5 77.5 113.5 78.0 112
  L 78.0 125
  C 78.0 126.8 79.5 126.8 79.5 125
  L 79.5 113
  L 79.8 127
  C 79.8 128.8 81.3 128.8 81.3 127
  L 81.3 113
  L 81.6 125.5
  C 81.6 127.2 83.0 127.2 83.0 125.5
  L 83.0 112.5
  L 83.3 123
  C 83.3 124.6 84.6 124.6 84.6 123
  C 84.6 116 84.0 110 82.5 103.5
  C 81.5 95 80.5 86 79.0 76
  C 78.0 70 77.0 66 76.5 68
  C 74.5 67 71.5 67 70.0 69
  C 68.5 60 67.0 52 64.5 46
  L 62 60
  C 61 70 59.5 80 58.5 88
  L 58 96
  C 57.5 102 55 106 51 107
  L 51 108
  L 56 126
  C 57.5 132 57.5 140 56.5 146
  L 57 150
  C 57 158 56.5 168 56 176
  L 58.5 186
  L 63 191
  C 64 192.5 62.5 193 60 193
  L 55.5 188
  L 54.5 176
  C 54.5 168 54.5 156 55 149
  L 54.5 145
  C 54 138 52 126 50.5 116
  L 50 112
  L 49.5 116
  C 48 126 46 138 45.5 145
  L 45 149
  C 45.5 156 45.5 168 45.5 176
  L 44.5 188
  L 40 193
  C 37.5 193 36 192.5 37 191
  L 41.5 186
  L 44 176
  C 43.5 168 43 158 43 150
  L 43.5 146
  C 42.5 140 42.5 132 44 126
  L 49 108
  L 49 107
  C 45 106 42.5 102 42 96
  L 41.5 88
  C 40.5 80 39 70 38 60
  L 35.5 46
  C 33.0 52 31.5 60 30.0 69
  C 28.5 67 25.5 67 23.5 68
  C 23.0 66 22.0 70 21.0 76
  C 19.5 86 18.5 95 17.5 103.5
  C 16.0 110 15.4 116 15.4 123
  C 15.4 124.6 16.7 124.6 16.7 123
  L 17.0 112.5
  L 17.0 125.5
  C 17.0 127.2 18.4 127.2 18.4 125.5
  L 18.7 113
  L 18.7 127
  C 18.7 128.8 20.2 128.8 20.2 127
  L 20.5 113
  L 20.5 125
  C 20.5 126.8 22.0 126.8 22.0 125
  L 22.0 112
  C 22.5 113.5 23.5 116.5 25.0 117
  C 26.5 117.5 27.2 116 26.5 114
  C 25.0 110 22.5 107 20.5 103.5
  C 21.0 100 21.5 96 22.0 92
  C 23.0 84 24.5 76 26.0 70
  C 25.5 68 25.2 66 25.0 64
  C 24.5 56 24.5 47 25.5 41
  C 26.5 37 29 34.5 33 33.5
  L 46 29.5
  L 46.5 25.5
  C 45.5 24 43.5 21 43.5 17
  C 43.5 14 45 10.5 50 10.5
  Z
`;

export const HoloBody: React.FC<HoloBodyProps> = ({
  layers,
  hotspots,
  resolvedParts,
  evaluations,
  callouts,
  selectedId,
  hoveredId,
  highlightId,
  editMode,
  onSelectPart,
  onHoverPart,
  onHotspotMouseDown,
  svgRef,
}) => {
  const uid = useId().replace(/:/g, '');

  const getStatusFill = (status: ExtendedStatus, opacity: number): string => {
    switch (status) {
      case 'RED':    return `rgba(239, 68, 68, ${opacity})`;
      case 'YELLOW': return `rgba(245, 158, 11, ${opacity})`;
      case 'GREEN':  return `rgba(16, 185, 129, ${opacity})`;
      default:       return `rgba(100, 116, 139, ${opacity})`;
    }
  };

  const getStatusStroke = (status: ExtendedStatus): string => {
    switch (status) {
      case 'RED':    return '#ef4444';
      case 'YELLOW': return '#f59e0b';
      case 'GREEN':  return '#10b981';
      default:       return '#64748b';
    }
  };

  // Compute area so non-skin hotspots are sorted largest first, smallest last.
  // Polygons (hands) get an effective area of ~30 so they sit on top of arms/torso.
  const getHotspotArea = (hs: BodyHotspot): number => {
    if (hs.shape === 'ellipse' && hs.cx != null && hs.cy != null) {
      return (hs.rx ?? 0) * (hs.ry ?? 0);
    }
    if (hs.shape === 'polygon') {
      return 28;
    }
    return 20;
  };

  const sortedHotspots = useMemo(() => {
    return [...hotspots]
      .filter((h) => h.id !== 'skin')
      .sort((a, b) => getHotspotArea(b) - getHotspotArea(a));
  }, [hotspots]);

  // Skin evaluation
  const skinPart = resolvedParts.find((p) => p.id === 'skin');
  const skinEval = skinPart ? evaluations.get('skin') : undefined;
  const isSkinSelected = selectedId === 'skin';
  const isSkinHovered = hoveredId === 'skin';
  const isSkinHighlight = highlightId === 'skin';

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Inline styles for animations and outline elimination */}
      <style>{`
        .holo-hotspot-elem {
          outline: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .holo-hotspot-elem:focus {
          outline: none !important;
        }
        .holo-hotspot-elem:focus-visible {
          outline: none !important;
        }
        @keyframes scanlineSweep {
          0% { transform: translateY(16px); opacity: 0.35; }
          48% { opacity: 0.90; }
          50% { transform: translateY(188px); opacity: 0.90; }
          98% { opacity: 0.35; }
          100% { transform: translateY(16px); opacity: 0.35; }
        }
        @keyframes platformPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.90; }
        }
        @keyframes haloPulse {
          0%, 100% { opacity: 0.30; }
          50% { opacity: 0.65; }
        }
        @media (prefers-reduced-motion: reduce) {
          .holo-scanline, .holo-platform-pulse, .holo-halo-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox="0 0 100 200"
        className="h-full w-auto max-w-full drop-shadow-[0_0_30px_rgba(6,182,212,0.20)]"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Human Digital Twin — Holographic Multilayer Anterior Projection"
      >
        <defs>
          {/* Cyan Glow Filter */}
          <filter id={`holoGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense Selected Glow (Applied strictly to the part's shape) */}
          <filter id={`selectedGlow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="blur1" />
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Body Silhouette Linear Gradient */}
          <linearGradient id={`bodyGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.14" />
            <stop offset="40%" stopColor="#0891b2" stopOpacity="0.09" />
            <stop offset="80%" stopColor="#0e7490" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.12" />
          </linearGradient>

          {/* Scanline Beam Gradient */}
          <linearGradient id={`scanGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>

          {/* Platform Radial Fill */}
          <radialGradient id={`platformGrad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.30" />
            <stop offset="70%" stopColor="#0891b2" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ══════════════════════════════════════════════════════════════════════
            LAYER 4: LANDMARKS & ENVIRONMENT (Background Elements)
            ══════════════════════════════════════════════════════════════════════ */}
        {layers.landmarks && (
          <g id="landmarks-layer-bg" className="opacity-90">
            {/* Left Vertical Telemetry Ruler */}
            <g id="ruler" stroke="#0891b2" strokeWidth="0.35" strokeOpacity="0.6">
              <line x1="8" y1="22" x2="8" y2="188" />
              {[
                { y: 24, l: '180' },
                { y: 34, l: '' },
                { y: 44, l: '160' },
                { y: 54, l: '' },
                { y: 64, l: '140' },
                { y: 74, l: '' },
                { y: 84, l: '120' },
                { y: 94, l: '' },
                { y: 104, l: '100' },
                { y: 114, l: '' },
                { y: 124, l: '80' },
                { y: 134, l: '' },
                { y: 144, l: '60' },
                { y: 154, l: '' },
                { y: 164, l: '40' },
                { y: 174, l: '' },
                { y: 184, l: '20' },
              ].map((t) => (
                <g key={t.y}>
                  <line
                    x1={t.l ? '5.8' : '7.0'}
                    y1={t.y}
                    x2="8"
                    y2={t.y}
                    strokeWidth={t.l ? '0.5' : '0.25'}
                    stroke={t.l ? '#22d3ee' : '#0891b2'}
                  />
                  {t.l && (
                    <text
                      x="4.6"
                      y={t.y + 1}
                      fill="#0e7490"
                      fontSize="2.2"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {t.l}
                    </text>
                  )}
                </g>
              ))}
              <text x="8" y="19" fill="#06b6d4" fontSize="2.2" fontFamily="monospace" textAnchor="middle">
                CM
              </text>
            </g>

            {/* Cranial Halo (Behind head) */}
            <g id="head-halo" className="holo-halo-pulse" style={{ transformOrigin: '50px 16.5px' }}>
              <circle
                cx="50"
                cy="16.5"
                r="14"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="0.35"
                strokeDasharray="1.5 2"
                strokeOpacity="0.45"
              />
              <circle
                cx="50"
                cy="16.5"
                r="16.5"
                fill="none"
                stroke="#0891b2"
                strokeWidth="0.25"
                strokeOpacity="0.3"
              />
              <line x1="50" y1="0.5" x2="50" y2="2.5" stroke="#22d3ee" strokeWidth="0.4" />
              <line x1="50" y1="30.5" x2="50" y2="32.5" stroke="#22d3ee" strokeWidth="0.4" />
              <line x1="33.5" y1="16.5" x2="35.5" y2="16.5" stroke="#22d3ee" strokeWidth="0.4" />
              <line x1="64.5" y1="16.5" x2="66.5" y2="16.5" stroke="#22d3ee" strokeWidth="0.4" />
            </g>

            {/* Waist Scan Ring (Anterior perspective orbit) */}
            <g id="waist-ring" opacity="0.85">
              <ellipse
                cx="50"
                cy="88"
                rx="35"
                ry="6.5"
                fill="none"
                stroke="#0891b2"
                strokeWidth="0.35"
                strokeDasharray="2 3"
                strokeOpacity="0.5"
              />
              <ellipse
                cx="50"
                cy="88"
                rx="33.5"
                ry="6.0"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="0.45"
                strokeOpacity="0.75"
              />
              <path d="M 16.5 86.5 L 15 88 L 16.5 89.5" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
              <path d="M 83.5 86.5 L 85 88 L 83.5 89.5" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
              <text x="14" y="87" fill="#0891b2" fontSize="2.0" fontFamily="monospace" textAnchor="end">
                [L-04]
              </text>
              <text x="86" y="87" fill="#0891b2" fontSize="2.0" fontFamily="monospace" textAnchor="start">
                SCALE // 120
              </text>
            </g>

            {/* Base Volumetric Platform (Stacked perspective ellipses at feet) */}
            <g id="foot-platform" className="holo-platform-pulse" style={{ transformOrigin: '50px 192px' }}>
              <ellipse
                cx="50"
                cy="192"
                rx="38"
                ry="8"
                fill={`url(#platformGrad-${uid})`}
                stroke="#0891b2"
                strokeWidth="0.4"
                strokeOpacity="0.6"
              />
              <ellipse
                cx="50"
                cy="192"
                rx="34"
                ry="6.8"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="0.45"
                strokeDasharray="2 2"
                strokeOpacity="0.8"
              />
              <ellipse
                cx="50"
                cy="192"
                rx="28"
                ry="5.2"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="0.3"
                strokeOpacity="0.5"
              />
              {[20, 35, 50, 65, 80].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 50 + 34 * Math.cos(rad);
                const y1 = 192 + 6.8 * Math.sin(rad);
                const x2 = 50 + 38 * Math.cos(rad);
                const y2 = 192 + 8.0 * Math.sin(rad);
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#22d3ee"
                    strokeWidth="0.4"
                    strokeOpacity="0.75"
                  />
                );
              })}
              <text
                x="50"
                y="197"
                fill="#0e7490"
                fontSize="1.8"
                fontFamily="monospace"
                textAnchor="middle"
                letterSpacing="0.4"
              >
                VOLUMETRIC RECONSTRUCTION
              </text>
            </g>

            {/* 3D Coordinate Axis Gizmo (Bottom Right) */}
            <g id="gizmo-3d" transform="translate(86, 178)" stroke="#22d3ee" strokeWidth="0.4" fill="none">
              <line x1="0" y1="0" x2="6" y2="0" />
              <line x1="0" y1="0" x2="-3.5" y2="4" />
              <line x1="0" y1="0" x2="0" y2="-6" />
              <text x="7" y="1" fill="#0891b2" fontSize="1.8" fontFamily="monospace">X</text>
              <text x="-5" y="6" fill="#0891b2" fontSize="1.8" fontFamily="monospace">Y</text>
              <text x="1" y="-6.5" fill="#0891b2" fontSize="1.8" fontFamily="monospace">Z</text>
              <text x="0" y="8" fill="#0891b2" fontSize="1.8" fontFamily="monospace" textAnchor="middle">FRONT</text>
            </g>
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            LAYER 1: SURFACE (Holographic Wireframe & Silhouette Mesh)
            ══════════════════════════════════════════════════════════════════════ */}
        {layers.surface && (
          <g id="surface-layer" filter={`url(#holoGlow-${uid})`}>
            {/* Full Body Outer Silhouette with Anatomical Arms & Hands */}
            <path
              d={BODY_SILHOUETTE_PATH}
              fill={`url(#bodyGrad-${uid})`}
              stroke="#22d3ee"
              strokeWidth="0.5"
              strokeOpacity="0.9"
            />

            {/* Cranium Facial Wireframe Cross-grid */}
            <g stroke="#22d3ee" strokeWidth="0.28" strokeOpacity="0.5" fill="none">
              <path d="M 45 14 Q 50 15 55 14" />
              <path d="M 44 17 Q 50 18.5 56 17" />
              <path d="M 44.5 20 Q 50 22 55.5 20" />
              <path d="M 46.5 23.5 Q 50 25 53.5 23.5" />
              <line x1="50" y1="10.5" x2="50" y2="25.5" strokeDasharray="1 1" />
              <path d="M 47.5 12 Q 46.5 18 47.5 24" />
              <path d="M 52.5 12 Q 53.5 18 52.5 24" />
            </g>

            {/* Torso, 3D Mesh Contours on Arms, Forearms & Legs */}
            <g stroke="#06b6d4" strokeWidth="0.28" strokeOpacity="0.55" fill="none">
              <ellipse cx="50" cy="28.5" rx="3.8" ry="1.0" />
              <ellipse cx="50" cy="36.0" rx="14.0" ry="2.2" />
              <ellipse cx="50" cy="44.0" rx="13.2" ry="2.5" />
              <ellipse cx="50" cy="54.0" rx="12.0" ry="2.4" />
              <ellipse cx="50" cy="64.0" rx="11.0" ry="2.2" />
              <ellipse cx="50" cy="74.0" rx="10.2" ry="2.0" />
              <ellipse cx="50" cy="83.0" rx="10.8" ry="2.2" />
              <ellipse cx="50" cy="94.0" rx="12.5" ry="2.5" />
              <ellipse cx="50" cy="103.0" rx="11.5" ry="2.4" />

              {/* 3D Wireframe Rings on Right Arm (Screen Left) */}
              <ellipse cx="29.5" cy="40" rx="3.4" ry="1.3" transform="rotate(-15 29.5 40)" />
              <ellipse cx="28.0" cy="47" rx="3.2" ry="1.2" transform="rotate(-12 28.0 47)" />
              <ellipse cx="27.0" cy="54" rx="3.0" ry="1.2" transform="rotate(-10 27.0 54)" />
              <ellipse cx="26.0" cy="61" rx="2.8" ry="1.1" transform="rotate(-8 26.0 61)" />
              <ellipse cx="25.5" cy="69" rx="2.5" ry="1.1" />
              <ellipse cx="24.5" cy="76" rx="2.6" ry="1.0" transform="rotate(6 24.5 76)" />
              <ellipse cx="23.5" cy="84" rx="2.5" ry="1.0" transform="rotate(8 23.5 84)" />
              <ellipse cx="22.5" cy="92" rx="2.3" ry="0.9" transform="rotate(10 22.5 92)" />
              <ellipse cx="21.0" cy="100" rx="2.2" ry="0.8" transform="rotate(10 21.0 100)" />
              <ellipse cx="20.5" cy="108" rx="2.8" ry="1.0" transform="rotate(10 20.5 108)" />

              {/* 3D Wireframe Rings on Left Arm (Screen Right) */}
              <ellipse cx="70.5" cy="40" rx="3.4" ry="1.3" transform="rotate(15 70.5 40)" />
              <ellipse cx="72.0" cy="47" rx="3.2" ry="1.2" transform="rotate(12 72.0 47)" />
              <ellipse cx="73.0" cy="54" rx="3.0" ry="1.2" transform="rotate(10 73.0 54)" />
              <ellipse cx="74.0" cy="61" rx="2.8" ry="1.1" transform="rotate(8 74.0 61)" />
              <ellipse cx="74.5" cy="69" rx="2.5" ry="1.1" />
              <ellipse cx="75.5" cy="76" rx="2.6" ry="1.0" transform="rotate(-6 75.5 76)" />
              <ellipse cx="76.5" cy="84" rx="2.5" ry="1.0" transform="rotate(-8 76.5 84)" />
              <ellipse cx="77.5" cy="92" rx="2.3" ry="0.9" transform="rotate(-10 77.5 92)" />
              <ellipse cx="79.0" cy="100" rx="2.2" ry="0.8" transform="rotate(-10 79.0 100)" />
              <ellipse cx="79.5" cy="108" rx="2.8" ry="1.0" transform="rotate(-10 79.5 108)" />

              {/* Thighs & Lower Legs */}
              <ellipse cx="44.5" cy="116" rx="4.8" ry="1.5" />
              <ellipse cx="44.0" cy="126" rx="4.6" ry="1.4" />
              <ellipse cx="44.0" cy="136" rx="4.2" ry="1.3" />
              <ellipse cx="44.0" cy="147.5" rx="3.6" ry="1.2" />
              <ellipse cx="44.0" cy="158" rx="3.4" ry="1.1" />
              <ellipse cx="43.8" cy="168" rx="2.8" ry="1.0" />
              <ellipse cx="43.0" cy="178" rx="2.2" ry="0.8" />

              <ellipse cx="55.5" cy="116" rx="4.8" ry="1.5" />
              <ellipse cx="56.0" cy="126" rx="4.6" ry="1.4" />
              <ellipse cx="56.0" cy="136" rx="4.2" ry="1.3" />
              <ellipse cx="56.0" cy="147.5" rx="3.6" ry="1.2" />
              <ellipse cx="56.0" cy="158" rx="3.4" ry="1.1" />
              <ellipse cx="56.2" cy="168" rx="2.8" ry="1.0" />
              <ellipse cx="57.0" cy="178" rx="2.2" ry="0.8" />

              <line x1="50" y1="28.5" x2="50" y2="107" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
            </g>
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            LAYER 2: SKELETON (Skull, 11 Rib Pairs, Stacked Spine, Full Arm Skeleton)
            ══════════════════════════════════════════════════════════════════════ */}
        {layers.skeleton && (
          <g id="skeleton-layer" stroke="#2dd4bf" strokeWidth="0.45" fill="none" opacity="0.95">
            {/* Skull Cranium Dome */}
            <circle cx="50" cy="16.5" r="5.2" strokeWidth="0.5" stroke="#5eead4" />
            <ellipse cx="47.0" cy="17.5" rx="1.6" ry="1.4" fill="rgba(6,182,212,0.2)" strokeWidth="0.4" stroke="#5eead4" />
            <ellipse cx="53.0" cy="17.5" rx="1.6" ry="1.4" fill="rgba(6,182,212,0.2)" strokeWidth="0.4" stroke="#5eead4" />
            <path d="M 49.3 20 L 50.7 20 L 50 18.8 Z" fill="#2dd4bf" />
            <path d="M 46.5 21.5 C 47.5 24.5 52.5 24.5 53.5 21.5" strokeWidth="0.4" stroke="#5eead4" />

            {/* Stacked Vertebral Column (C1 through L5 & Sacrum) */}
            <g id="spine-chain">
              {[26.5, 28.0, 29.5, 31.0].map((y) => (
                <rect key={y} x="48.8" y={y} width="2.4" height="1.1" rx="0.3" fill="rgba(45,212,191,0.3)" strokeWidth="0.3" />
              ))}
              {[33, 35.5, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65].map((y) => (
                <rect key={y} x="48.4" y={y} width="3.2" height="1.8" rx="0.4" fill="rgba(45,212,191,0.35)" strokeWidth="0.35" />
              ))}
              {[68, 72, 76, 80, 84].map((y) => (
                <rect key={y} x="48.0" y={y} width="4.0" height="2.4" rx="0.5" fill="rgba(45,212,191,0.4)" strokeWidth="0.4" />
              ))}
              <polygon points="47.5,87 52.5,87 51,95 49,95" fill="rgba(45,212,191,0.45)" strokeWidth="0.4" />
            </g>

            {/* Clavicles & Scapula Tips */}
            <path d="M 49 32.5 C 43 31 37 32 31.5 34.5" strokeWidth="0.55" stroke="#5eead4" />
            <path d="M 51 32.5 C 57 31 63 32 68.5 34.5" strokeWidth="0.55" stroke="#5eead4" />
            {/* Scapula tips */}
            <path d="M 30 34 L 28.5 36.5 L 31 37" strokeWidth="0.4" stroke="#5eead4" />
            <path d="M 70 34 L 71.5 36.5 L 69 37" strokeWidth="0.4" stroke="#5eead4" />

            {/* Sternum (Manubrium + Body + Xiphoid) */}
            <path d="M 48.6 33 L 51.4 33 L 50.8 50 L 49.2 50 Z" fill="rgba(94,234,212,0.35)" strokeWidth="0.45" stroke="#5eead4" />
            <circle cx="50" cy="51.2" r="0.7" fill="#5eead4" />

            {/* 11 Pairs of Anatomical Curved Ribs */}
            {[
              { y: 34.5, rx: 6.5, ry: 2.0 },
              { y: 37.0, rx: 8.5, ry: 2.6 },
              { y: 39.5, rx: 10.2, ry: 3.0 },
              { y: 42.0, rx: 11.2, ry: 3.4 },
              { y: 45.0, rx: 11.8, ry: 3.6 },
              { y: 48.0, rx: 11.6, ry: 3.7 },
              { y: 51.0, rx: 11.0, ry: 3.6 },
              { y: 54.0, rx: 10.2, ry: 3.5 },
              { y: 57.0, rx: 9.2, ry: 3.2 },
              { y: 60.0, rx: 8.0, ry: 2.8 },
              { y: 63.0, rx: 6.8, ry: 2.4 },
            ].map((rib, idx) => (
              <g key={idx}>
                <path
                  d={`M 48.4 ${rib.y} C ${48.4 - rib.rx} ${rib.y - 0.8} ${48.4 - rib.rx} ${rib.y + rib.ry} 49.2 ${rib.y + rib.ry}`}
                  strokeWidth="0.4"
                  stroke="#5eead4"
                />
                <path
                  d={`M 51.6 ${rib.y} C ${51.6 + rib.rx} ${rib.y - 0.8} ${51.6 + rib.rx} ${rib.y + rib.ry} 50.8 ${rib.y + rib.ry}`}
                  strokeWidth="0.4"
                  stroke="#5eead4"
                />
              </g>
            ))}

            {/* Pelvic Girdle */}
            <g id="pelvis-skeleton">
              <path
                d="M 48 87 C 41 85.5 37 90 38.5 98 C 39.5 102 44 104 48 102"
                strokeWidth="0.5"
                stroke="#5eead4"
                fill="rgba(45,212,191,0.15)"
              />
              <path
                d="M 52 87 C 59 85.5 63 90 61.5 98 C 60.5 102 56 104 52 102"
                strokeWidth="0.5"
                stroke="#5eead4"
                fill="rgba(45,212,191,0.15)"
              />
              <ellipse cx="50" cy="97" rx="4.5" ry="3.0" strokeDasharray="1 1" stroke="#5eead4" strokeWidth="0.35" />
            </g>

            {/* ── COMPLETE SKELETON IN RIGHT ARM (Screen Left) ──────────────── */}
            <g id="arm-bones-right">
              {/* Shoulder Joint Circle */}
              <circle cx="31.0" cy="35.0" r="1.8" stroke="#5eead4" strokeWidth="0.5" fill="rgba(94,234,212,0.25)" />
              {/* Humerus Head & Thick Long Shaft */}
              <circle cx="30.5" cy="36.5" r="1.3" fill="#5eead4" />
              <line x1="30.2" y1="37.5" x2="26.0" y2="67.5" strokeWidth="0.8" stroke="#5eead4" />
              {/* Elbow Joint Circle */}
              <circle cx="26.0" cy="69.0" r="1.6" stroke="#5eead4" strokeWidth="0.5" fill="rgba(94,234,212,0.25)" />
              {/* Radius (lateral) & Ulna (medial) crossing slightly near wrist */}
              <line x1="24.8" y1="70.5" x2="22.5" y2="102.5" strokeWidth="0.5" stroke="#5eead4" />
              <line x1="26.8" y1="70.5" x2="19.5" y2="102.5" strokeWidth="0.5" stroke="#5eead4" />
              {/* Wrist Joint Circle */}
              <circle cx="21.0" cy="104.0" r="1.4" stroke="#5eead4" strokeWidth="0.45" fill="rgba(94,234,212,0.2)" />
              {/* Carpal Cluster (small wrist bones) */}
              <circle cx="20.2" cy="103.5" r="0.45" fill="#5eead4" />
              <circle cx="21.5" cy="103.5" r="0.45" fill="#5eead4" />
              <circle cx="20.0" cy="105.0" r="0.45" fill="#5eead4" />
              <circle cx="21.5" cy="105.0" r="0.45" fill="#5eead4" />

              {/* 5 Metacarpals in Palm */}
              <line x1="22.0" y1="105.5" x2="23.5" y2="110.0" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="21.5" y1="105.5" x2="22.0" y2="113.5" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="21.0" y1="105.5" x2="20.5" y2="114.0" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="20.5" y1="105.5" x2="19.0" y2="113.5" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="20.0" y1="105.5" x2="17.5" y2="113.0" strokeWidth="0.4" stroke="#5eead4" />

              {/* Finger Bones (Phalanges) with Knuckle & Joint Dots */}
              {/* Thumb: 2 segments (inner side angled outward) */}
              <circle cx="23.5" cy="110.0" r="0.4" fill="#5eead4" />
              <line x1="23.5" y1="110.0" x2="24.8" y2="113.5" strokeWidth="0.38" stroke="#5eead4" />
              <circle cx="24.8" cy="113.5" r="0.35" fill="#5eead4" />
              <line x1="24.8" y1="113.5" x2="25.5" y2="116.5" strokeWidth="0.38" stroke="#5eead4" />
              <circle cx="25.5" cy="116.5" r="0.3" fill="#5eead4" />

              {/* Index Finger: 3 segments */}
              <circle cx="22.0" cy="113.5" r="0.4" fill="#5eead4" />
              <line x1="22.0" y1="113.5" x2="22.0" y2="118.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="22.0" cy="118.0" r="0.32" fill="#5eead4" />
              <line x1="22.0" y1="118.0" x2="21.8" y2="122.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="21.8" cy="122.5" r="0.32" fill="#5eead4" />
              <line x1="21.8" y1="122.5" x2="21.5" y2="126.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="21.5" cy="126.5" r="0.3" fill="#5eead4" />

              {/* Middle Finger: 3 segments (longest) */}
              <circle cx="20.5" cy="114.0" r="0.4" fill="#5eead4" />
              <line x1="20.5" y1="114.0" x2="20.5" y2="118.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="20.5" cy="118.5" r="0.32" fill="#5eead4" />
              <line x1="20.5" y1="118.5" x2="20.3" y2="123.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="20.3" cy="123.5" r="0.32" fill="#5eead4" />
              <line x1="20.3" y1="123.5" x2="20.0" y2="127.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="20.0" cy="127.5" r="0.3" fill="#5eead4" />

              {/* Ring Finger: 3 segments */}
              <circle cx="19.0" cy="113.5" r="0.4" fill="#5eead4" />
              <line x1="19.0" y1="113.5" x2="19.0" y2="118.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="19.0" cy="118.0" r="0.32" fill="#5eead4" />
              <line x1="19.0" y1="118.0" x2="18.8" y2="122.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="18.8" cy="122.5" r="0.32" fill="#5eead4" />
              <line x1="18.8" y1="122.5" x2="18.5" y2="126.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="18.5" cy="126.0" r="0.3" fill="#5eead4" />

              {/* Little Finger: 3 segments */}
              <circle cx="17.5" cy="113.0" r="0.4" fill="#5eead4" />
              <line x1="17.5" y1="113.0" x2="17.5" y2="117.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="17.5" cy="117.0" r="0.32" fill="#5eead4" />
              <line x1="17.5" y1="117.0" x2="17.3" y2="121.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="17.3" cy="121.0" r="0.32" fill="#5eead4" />
              <line x1="17.3" y1="121.0" x2="17.0" y2="124.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="17.0" cy="124.0" r="0.3" fill="#5eead4" />
            </g>

            {/* ── COMPLETE SKELETON IN LEFT ARM (Screen Right) ───────────────── */}
            <g id="arm-bones-left">
              {/* Shoulder Joint Circle */}
              <circle cx="69.0" cy="35.0" r="1.8" stroke="#5eead4" strokeWidth="0.5" fill="rgba(94,234,212,0.25)" />
              {/* Humerus Head & Shaft */}
              <circle cx="69.5" cy="36.5" r="1.3" fill="#5eead4" />
              <line x1="69.8" y1="37.5" x2="74.0" y2="67.5" strokeWidth="0.8" stroke="#5eead4" />
              {/* Elbow Joint Circle */}
              <circle cx="74.0" cy="69.0" r="1.6" stroke="#5eead4" strokeWidth="0.5" fill="rgba(94,234,212,0.25)" />
              {/* Radius & Ulna */}
              <line x1="75.2" y1="70.5" x2="77.5" y2="102.5" strokeWidth="0.5" stroke="#5eead4" />
              <line x1="73.2" y1="70.5" x2="80.5" y2="102.5" strokeWidth="0.5" stroke="#5eead4" />
              {/* Wrist Joint Circle */}
              <circle cx="79.0" cy="104.0" r="1.4" stroke="#5eead4" strokeWidth="0.45" fill="rgba(94,234,212,0.2)" />
              {/* Carpal Cluster */}
              <circle cx="79.8" cy="103.5" r="0.45" fill="#5eead4" />
              <circle cx="78.5" cy="103.5" r="0.45" fill="#5eead4" />
              <circle cx="80.0" cy="105.0" r="0.45" fill="#5eead4" />
              <circle cx="78.5" cy="105.0" r="0.45" fill="#5eead4" />

              {/* 5 Metacarpals in Palm */}
              <line x1="78.0" y1="105.5" x2="76.5" y2="110.0" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="78.5" y1="105.5" x2="78.0" y2="113.5" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="79.0" y1="105.5" x2="79.5" y2="114.0" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="79.5" y1="105.5" x2="81.0" y2="113.5" strokeWidth="0.4" stroke="#5eead4" />
              <line x1="80.0" y1="105.5" x2="82.5" y2="113.0" strokeWidth="0.4" stroke="#5eead4" />

              {/* Thumb: 2 segments (inner side angled outward) */}
              <circle cx="76.5" cy="110.0" r="0.4" fill="#5eead4" />
              <line x1="76.5" y1="110.0" x2="75.2" y2="113.5" strokeWidth="0.38" stroke="#5eead4" />
              <circle cx="75.2" cy="113.5" r="0.35" fill="#5eead4" />
              <line x1="75.2" y1="113.5" x2="74.5" y2="116.5" strokeWidth="0.38" stroke="#5eead4" />
              <circle cx="74.5" cy="116.5" r="0.3" fill="#5eead4" />

              {/* Index Finger */}
              <circle cx="78.0" cy="113.5" r="0.4" fill="#5eead4" />
              <line x1="78.0" y1="113.5" x2="78.0" y2="118.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="78.0" cy="118.0" r="0.32" fill="#5eead4" />
              <line x1="78.0" y1="118.0" x2="78.2" y2="122.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="78.2" cy="122.5" r="0.32" fill="#5eead4" />
              <line x1="78.2" y1="122.5" x2="78.5" y2="126.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="78.5" cy="126.5" r="0.3" fill="#5eead4" />

              {/* Middle Finger */}
              <circle cx="79.5" cy="114.0" r="0.4" fill="#5eead4" />
              <line x1="79.5" y1="114.0" x2="79.5" y2="118.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="79.5" cy="118.5" r="0.32" fill="#5eead4" />
              <line x1="79.5" y1="118.5" x2="79.7" y2="123.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="79.7" cy="123.5" r="0.32" fill="#5eead4" />
              <line x1="79.7" y1="123.5" x2="80.0" y2="127.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="80.0" cy="127.5" r="0.3" fill="#5eead4" />

              {/* Ring Finger */}
              <circle cx="81.0" cy="113.5" r="0.4" fill="#5eead4" />
              <line x1="81.0" y1="113.5" x2="81.0" y2="118.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="81.0" cy="118.0" r="0.32" fill="#5eead4" />
              <line x1="81.0" y1="118.0" x2="81.2" y2="122.5" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="81.2" cy="122.5" r="0.32" fill="#5eead4" />
              <line x1="81.2" y1="122.5" x2="81.5" y2="126.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="81.5" cy="126.0" r="0.3" fill="#5eead4" />

              {/* Little Finger */}
              <circle cx="82.5" cy="113.0" r="0.4" fill="#5eead4" />
              <line x1="82.5" y1="113.0" x2="82.5" y2="117.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="82.5" cy="117.0" r="0.32" fill="#5eead4" />
              <line x1="82.5" y1="117.0" x2="82.7" y2="121.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="82.7" cy="121.0" r="0.32" fill="#5eead4" />
              <line x1="82.7" y1="121.0" x2="83.0" y2="124.0" strokeWidth="0.35" stroke="#5eead4" />
              <circle cx="83.0" cy="124.0" r="0.3" fill="#5eead4" />
            </g>

            {/* Leg Bones with Joint Circles (Hip, Knee, Ankle) */}
            <g id="leg-bones-right">
              <circle cx="41.5" cy="103.0" r="1.7" fill="rgba(45,212,191,0.3)" stroke="#5eead4" strokeWidth="0.5" />
              <line x1="41.8" y1="104.5" x2="43.8" y2="145.0" strokeWidth="0.75" stroke="#5eead4" />
              <circle cx="44.0" cy="147.5" r="1.8" fill="#2dd4bf" stroke="#5eead4" strokeWidth="0.5" />
              <line x1="44.0" y1="149.5" x2="43.5" y2="182.0" strokeWidth="0.6" stroke="#5eead4" />
              <line x1="41.8" y1="151.0" x2="41.2" y2="180.0" strokeWidth="0.35" stroke="#2dd4bf" />
              <circle cx="43.5" cy="183.5" r="1.3" stroke="#5eead4" strokeWidth="0.4" />
              <path d="M 43.5 184.5 L 39 191 L 43 191" strokeWidth="0.45" stroke="#5eead4" />
            </g>

            <g id="leg-bones-left">
              <circle cx="58.5" cy="103.0" r="1.7" fill="rgba(45,212,191,0.3)" stroke="#5eead4" strokeWidth="0.5" />
              <line x1="58.2" y1="104.5" x2="56.2" y2="145.0" strokeWidth="0.75" stroke="#5eead4" />
              <circle cx="56.0" cy="147.5" r="1.8" fill="#2dd4bf" stroke="#5eead4" strokeWidth="0.5" />
              <line x1="56.0" y1="149.5" x2="56.5" y2="182.0" strokeWidth="0.6" stroke="#5eead4" />
              <line x1="58.2" y1="151.0" x2="58.8" y2="180.0" strokeWidth="0.35" stroke="#2dd4bf" />
              <circle cx="56.5" cy="183.5" r="1.3" stroke="#5eead4" strokeWidth="0.4" />
              <path d="M 56.5 184.5 L 61 191 L 57 191" strokeWidth="0.45" stroke="#5eead4" />
            </g>
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            LAYER 3: ORGANS (Brain, Lungs, Heart, Liver, Stomach, Kidneys, Intestines)
            ══════════════════════════════════════════════════════════════════════ */}
        {layers.organs && (
          <g id="organs-layer">
            <g id="organ-brain" filter={`url(#holoGlow-${uid})`}>
              <ellipse
                cx="50"
                cy="16.5"
                rx="5.2"
                ry="4.4"
                fill="rgba(6,182,212,0.35)"
                stroke="#38bdf8"
                strokeWidth="0.5"
              />
              <path
                d="M 47.5 14.5 C 49 13.5 51 13.5 52.5 14.5 M 46.5 16.5 C 49 17.5 51 16 53.5 17 M 47 18.5 C 48.5 19.5 51.5 19.5 53 18.5"
                stroke="#a5f3fc"
                strokeWidth="0.35"
                fill="none"
              />
              <line x1="50" y1="13" x2="50" y2="19.5" stroke="#38bdf8" strokeWidth="0.35" strokeDasharray="0.8 0.8" />
            </g>

            <g id="organ-lung-right">
              <path
                d="M 47 38 C 41.5 38 37.5 41 37.0 47 C 36.5 53 38.0 56 46.5 56.5 C 47.5 53 47.5 43 47 38 Z"
                fill="rgba(6,182,212,0.30)"
                stroke="#38bdf8"
                strokeWidth="0.5"
              />
              <path d="M 46 43 L 42 46 M 46 47 L 40 49 M 46 51 L 41 53" stroke="#a5f3fc" strokeWidth="0.3" strokeOpacity="0.7" />
            </g>

            <g id="organ-lung-left">
              <path
                d="M 53 38 C 58.5 38 62.5 41 63.0 47 C 63.5 53 62.0 56 55.5 56.5 C 53.5 54 53.0 47 53 38 Z"
                fill="rgba(6,182,212,0.30)"
                stroke="#38bdf8"
                strokeWidth="0.5"
              />
              <path d="M 54 43 L 58 46 M 54 47 L 60 49 M 54 51 L 59 53" stroke="#a5f3fc" strokeWidth="0.3" strokeOpacity="0.7" />
            </g>

            <g id="organ-heart" filter={`url(#holoGlow-${uid})`}>
              <path
                d="M 51 43 C 53 41 56 41 57.5 44 C 59 47 57 51 54 53 C 52 50.5 50.5 46 51 43 Z"
                fill="rgba(244,63,94,0.40)"
                stroke="#fb7185"
                strokeWidth="0.6"
              />
              <path d="M 52.5 42.5 C 52.5 39.5 54.5 39.5 55 41" fill="none" stroke="#f43f5e" strokeWidth="0.5" />
              <line x1="53.5" y1="39.5" x2="53.5" y2="38" stroke="#fb7185" strokeWidth="0.35" />
              <line x1="54.8" y1="40" x2="55.5" y2="38.5" stroke="#fb7185" strokeWidth="0.35" />
            </g>

            <path
              id="organ-liver"
              d="M 37.0 61 C 44 59.5 48.5 61 48 64 C 47.5 69 41 71.5 36.5 68 C 35.5 65 36.0 62 37.0 61 Z"
              fill="rgba(245,158,11,0.35)"
              stroke="#fbbf24"
              strokeWidth="0.5"
            />

            <path
              id="organ-stomach"
              d="M 52 61 C 56.5 60.5 59.5 63 60 67 C 60 70 56 71 52.5 68 C 53.5 65 52.5 63 52 61 Z"
              fill="rgba(249,115,22,0.35)"
              stroke="#fb923c"
              strokeWidth="0.5"
            />

            <path
              id="organ-kidney-right"
              d="M 40 73 C 43 73 43.5 78 40.5 79.5 C 38.5 79 38 74 40 73 Z"
              fill="rgba(59,130,246,0.35)"
              stroke="#60a5fa"
              strokeWidth="0.5"
            />
            <path
              id="organ-kidney-left"
              d="M 60 73 C 57 73 56.5 78 59.5 79.5 C 61.5 79 62 74 60 73 Z"
              fill="rgba(59,130,246,0.35)"
              stroke="#60a5fa"
              strokeWidth="0.5"
            />

            <g id="organ-intestine" stroke="#22d3ee" strokeWidth="0.5" fill="none">
              <path
                d="M 45 81 C 48 80 52 80 55 81 C 56.5 83 55 86 52 86 C 48 86 46 88 47 90 C 49 92 53 91 55 89 C 56 91 53 94 48 93"
              />
              <path
                d="M 44 84 C 44 88 45 92 48 94 C 52 94 55 92 56 87"
                strokeDasharray="1.2 1.2"
                strokeOpacity="0.7"
              />
            </g>
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            DYNAMIC SCAN LINE SWEEP ANIMATION
            ══════════════════════════════════════════════════════════════════════ */}
        <g id="scanline-sweep" className="holo-scanline pointer-events-none">
          <rect x="8" y="0" width="84" height="1.4" fill={`url(#scanGrad-${uid})`} />
          <line x1="5" y1="0.7" x2="95" y2="0.7" stroke="#a5f3fc" strokeWidth="0.3" strokeOpacity="0.85" />
        </g>

        {/* ══════════════════════════════════════════════════════════════════════
            HUD CALLOUTS (Clickable Data-driven Annotations with Leader Lines)
            ══════════════════════════════════════════════════════════════════════ */}
        {layers.landmarks && (
          <g id="callouts-hud" className="pointer-events-auto select-none">
            {callouts.map((co) => {
              const isTargetActive = selectedId === co.targetPartId || hoveredId === co.targetPartId;
              const isTargetHighlight = highlightId === co.targetPartId;
              const isRight = co.align === 'left';

              const cornerX = isRight ? co.labelX - 4 : co.labelX + 4;
              const cornerY = co.labelY;

              return (
                <g
                  key={co.id}
                  className="cursor-pointer transition-opacity duration-150"
                  opacity={isTargetActive || isTargetHighlight ? 1 : 0.85}
                  onClick={() => onSelectPart(co.targetPartId)}
                  onMouseEnter={() => onHoverPart(co.targetPartId)}
                  onMouseLeave={() => onHoverPart(null)}
                >
                  <circle
                    cx={co.targetX}
                    cy={co.targetY}
                    r={isTargetActive ? 2.0 : 1.2}
                    fill={isTargetActive ? '#22d3ee' : '#0891b2'}
                    stroke="#a5f3fc"
                    strokeWidth="0.35"
                  />
                  {isTargetActive && (
                    <circle
                      cx={co.targetX}
                      cy={co.targetY}
                      r="3.2"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="0.35"
                      className="holo-halo-pulse"
                    />
                  )}

                  <polyline
                    points={`${co.targetX},${co.targetY} ${cornerX},${cornerY} ${co.labelX},${cornerY}`}
                    fill="none"
                    stroke={isTargetActive ? '#22d3ee' : '#0891b2'}
                    strokeWidth={isTargetActive ? '0.5' : '0.3'}
                    strokeDasharray={isTargetActive ? 'none' : '2 1'}
                  />

                  <text
                    x={co.labelX}
                    y={co.labelY - 3.0}
                    fill="#22d3ee"
                    fontSize="2.4"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor={isRight ? 'start' : 'end'}
                  >
                    {co.code}
                  </text>

                  <text
                    x={co.labelX}
                    y={co.labelY - 0.4}
                    fill={isTargetActive ? '#a5f3fc' : '#ffffff'}
                    fontSize="2.8"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor={isRight ? 'start' : 'end'}
                    style={{ textShadow: '0 0 6px rgba(34,211,238,0.5)' }}
                  >
                    {co.title}
                  </text>

                  <text
                    x={co.labelX}
                    y={co.labelY + 2.2}
                    fill="#94a3b8"
                    fontSize="1.9"
                    fontFamily="monospace"
                    textAnchor={isRight ? 'start' : 'end'}
                  >
                    {co.subtitle}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            HOTSPOTS OVERLAY (Strictly pointer-events: none on container,
            pointer-events: auto on individual shapes with outline: none)
            ══════════════════════════════════════════════════════════════════════ */}
        <g id="hotspots-overlay" className="pointer-events-none">

          {/* ── 1. SKIN HOTSPOT (Lowest layer — uses exact body silhouette path with realistic arms & hands) ── */}
          <path
            d={BODY_SILHOUETTE_PATH}
            className="holo-hotspot-elem cursor-pointer pointer-events-auto"
            fill={
              isSkinSelected
                ? 'rgba(6, 182, 212, 0.28)'
                : isSkinHovered || isSkinHighlight
                ? 'rgba(6, 182, 212, 0.16)'
                : 'transparent'
            }
            stroke={
              isSkinSelected || isSkinHighlight
                ? '#22d3ee'
                : isSkinHovered
                ? '#06b6d4'
                : editMode
                ? '#f59e0b'
                : 'transparent'
            }
            strokeWidth={isSkinSelected ? 1.0 : editMode ? 0.5 : 0}
            strokeDasharray={editMode ? '2 2' : 'none'}
            filter={isSkinSelected ? `url(#selectedGlow-${uid})` : 'none'}
            tabIndex={0}
            role="button"
            aria-label={`Skin & Integument — ${skinEval?.statusLabel ?? ''}`}
            aria-pressed={isSkinSelected}
            onClick={() => onSelectPart('skin')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPart('skin');
              }
            }}
            onMouseEnter={() => onHoverPart('skin')}
            onMouseLeave={() => onHoverPart(null)}
          />

          {/* ── 2. INTERNAL ORGAN & BONE HOTSPOTS (Area sorted: largest first, smallest on top) ── */}
          {sortedHotspots.map((hs) => {
            const rp = resolvedParts.find((p) => p.id === hs.id);
            const ev = rp ? evaluations.get(rp.id) : undefined;
            const noIndicators = !ev || ev.contributingIndicators.length === 0;
            const extStatus: ExtendedStatus = noIndicators ? 'NEUTRAL' : (ev?.status ?? 'GREEN');

            const isSelected = selectedId === hs.id;
            const isHovered = hoveredId === hs.id;
            const isHighlight = highlightId === hs.id;

            const fillOpacity = editMode ? 0.35 : isSelected ? 0.38 : isHovered ? 0.25 : 0.0;
            const strokeOpacity = editMode ? 1.0 : isSelected || isHovered || isHighlight ? 1.0 : 0.0;
            const strokeColor = isSelected || isHighlight ? '#22d3ee' : editMode ? '#f59e0b' : getStatusStroke(extStatus);
            const fillColor = getStatusFill(extStatus, fillOpacity);
            const strokeW = isSelected ? 0.9 : isHovered ? 0.6 : editMode ? 0.45 : 0;

            const filterStr = isSelected
              ? `url(#selectedGlow-${uid})`
              : isHovered || isHighlight
              ? `url(#holoGlow-${uid})`
              : 'none';

            // Ellipse hotspots
            if (hs.shape === 'ellipse' && hs.cx != null && hs.cy != null) {
              return (
                <g key={hs.id}>
                  <ellipse
                    cx={hs.cx}
                    cy={hs.cy}
                    rx={hs.rx ?? 4}
                    ry={hs.ry ?? 4}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeOpacity={strokeOpacity}
                    filter={filterStr}
                    className="holo-hotspot-elem cursor-pointer pointer-events-auto"
                    style={{
                      cursor: editMode ? 'move' : 'pointer',
                      transition: editMode ? 'none' : 'fill 0.12s, stroke 0.12s',
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${hs.label}${rp ? ` — ${ev?.statusLabel ?? ''}` : ''}`}
                    aria-pressed={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editMode && rp) onSelectPart(rp.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (rp) onSelectPart(rp.id);
                      }
                    }}
                    onMouseEnter={() => onHoverPart(hs.id)}
                    onMouseLeave={() => onHoverPart(null)}
                    onMouseDown={(e) => {
                      if (onHotspotMouseDown) onHotspotMouseDown(e, hs.id);
                    }}
                  />
                  {editMode && (
                    <circle
                      cx={hs.cx}
                      cy={hs.cy}
                      r="0.8"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="0.2"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              );
            }

            // Polygon hotspots (e.g. Hand covering palm and all fingers)
            if (hs.shape === 'polygon' && hs.points) {
              return (
                <g key={hs.id}>
                  <polygon
                    points={hs.points}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeOpacity={strokeOpacity}
                    filter={filterStr}
                    className="holo-hotspot-elem cursor-pointer pointer-events-auto"
                    style={{
                      cursor: 'pointer',
                      transition: editMode ? 'none' : 'fill 0.12s, stroke 0.12s',
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${hs.label}${rp ? ` — ${ev?.statusLabel ?? ''}` : ''}`}
                    aria-pressed={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editMode && rp) onSelectPart(rp.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (rp) onSelectPart(rp.id);
                      }
                    }}
                    onMouseEnter={() => onHoverPart(hs.id)}
                    onMouseLeave={() => onHoverPart(null)}
                  />
                </g>
              );
            }

            return null;
          })}
        </g>
      </svg>
    </div>
  );
};
