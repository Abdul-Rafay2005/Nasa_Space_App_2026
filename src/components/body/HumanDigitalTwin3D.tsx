/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: High-Fidelity 3D Holographic Human Digital Twin (Three.js WebGL)
 * Lead Developer: Abdul Rafay
 *
 * LAYOUT FIX v2:
 *  - 3D canvas is LEFT pane — UI cards NEVER overlap the canvas
 *  - Organ detail panel is RIGHT pane — proper side panel
 *  - Subsystem switcher at bottom of right panel
 *  - Controls bar above canvas (top strip)
 *  - Improved 3D figure: smoother anatomy, shoulder joints, ankle joints,
 *    better leg proportions, lung breath animation, selected organ highlight
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import {
  Rotate3d,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HeartPulse,
  Brain,
  Wind,
  Bone,
  Dna,
  ChevronRight,
} from 'lucide-react';

interface HumanDigitalTwin3DProps {
  latestAssessment?: DailyAssessmentRecord;
  onSelectOrgan?: (organId: string) => void;
  selectedOrganId?: string;
  height?: number | string;
}

export interface Organ3DMetadata {
  id: string;
  name: string;
  subsystem: 'cardio' | 'nervous' | 'respiratory' | 'skeletal' | 'metabolic';
  position: [number, number, number];
  color: string;
  status: HealthStatus;
  statusLabel: string;
  telemetryValue: string;
  clinicalSummary: string;
  nasaProtocol: string;
  icon: React.ElementType;
}

const subsystemIcons: Record<string, React.ElementType> = {
  cardio: HeartPulse,
  nervous: Brain,
  respiratory: Wind,
  skeletal: Bone,
  metabolic: Dna,
};

const statusColors = {
  GREEN:  { badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  YELLOW: { badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
  RED:    { badge: 'bg-rose-500/15 border-rose-500/30 text-rose-400' },
};

export const HumanDigitalTwin3D: React.FC<HumanDigitalTwin3DProps> = ({
  latestAssessment,
  onSelectOrgan,
  selectedOrganId: propSelectedOrganId,
  height = 580,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState<string>('heart');

  const selectedId = propSelectedOrganId || internalSelectedId;

  const hr       = latestAssessment?.values.heartRate       || 72;
  const sys      = latestAssessment?.values.systolic        || 118;
  const dia      = latestAssessment?.values.diastolic       || 76;
  const glucose  = latestAssessment?.values.bloodSugar      || 92;
  const temp     = latestAssessment?.values.bodyTemperature || 36.6;

  const hrStatus    = latestAssessment?.results.heartRate.status    || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status   || 'GREEN';
  const moodStatus  = latestAssessment?.results.mood.status         || 'GREEN';

  const organList = useMemo<Organ3DMetadata[]>(() => [
    {
      id: 'brain', name: 'Cerebral Cortex & CNS', subsystem: 'nervous',
      position: [0, 4.45, 0.05], color: '#38bdf8', status: moodStatus,
      statusLabel: moodStatus === 'GREEN' ? 'Optimal Cognitive Focus' : 'Fatigue / Adaptation Stress',
      telemetryValue: `${latestAssessment?.results.mood.valueDisplay || 'Good Readiness'} • SAS Grade 0`,
      clinicalSummary: 'Monitors Space Adaptation Syndrome (SAS), vestibular conflict, and prefrontal cognitive bandwidth during mission-critical operations.',
      nasaProtocol: 'NASA Circadian Schedule: Enforce 8.5-hr sleep chamber isolation; 10-min visual tracking calibration before EVA.',
      icon: subsystemIcons.nervous,
    },
    {
      id: 'heart', name: 'Cardiovascular Core', subsystem: 'cardio',
      position: [-0.3, 2.95, 0.38],
      color: hrStatus === 'RED' ? '#ef4444' : hrStatus === 'YELLOW' ? '#f59e0b' : '#10b981',
      status: hrStatus, statusLabel: latestAssessment?.results.heartRate.statusLabel || 'Healthy (Nominal)',
      telemetryValue: `${hr} BPM • ${sys}/${dia} mmHg`,
      clinicalSummary: 'Tracks cephalic fluid translocation (~2.0 L headward shift), left ventricular stroke volume, and microgravity cardiovascular deconditioning.',
      nasaProtocol: 'NASA Flight Rule MED-01: Daily 30-min CEVIS ergometer + 1.2 L isotonic fluid loading before gravitational transition.',
      icon: subsystemIcons.cardio,
    },
    {
      id: 'lungs', name: 'Pulmonary / Respiratory', subsystem: 'respiratory',
      position: [0, 3.15, 0.12], color: '#22d3ee', status: 'GREEN', statusLabel: 'Nominal Ventilation',
      telemetryValue: 'SpO₂ 98.4% • Cabin ppO₂ 21.2 kPa',
      clinicalSummary: 'Monitors alveolar ventilation-perfusion matching without gravity-dependent gradient and habitat CO₂ scrubbing efficacy.',
      nasaProtocol: 'Verify cabin air velocity >0.2 m/s to eliminate expired CO₂ bubble stagnation near crew sleeping quarters.',
      icon: subsystemIcons.respiratory,
    },
    {
      id: 'spine', name: 'Spinal Column & Skeletal', subsystem: 'skeletal',
      position: [0, 2.1, -0.15], color: '#e2e8f0', status: 'GREEN', statusLabel: 'Nominal Bone Density',
      telemetryValue: '+3.4 cm Axial Elongation',
      clinicalSummary: 'Tracks intervertebral disc un-loading and spinal elongation. Monitors lumbar strain and bone mineral density preservation (1-2% monthly risk).',
      nasaProtocol: 'NASA ARED Countermeasure: 600 kg-force deadlift & axial squat protocol; daily 800 IU Vitamin D3 supplementation.',
      icon: subsystemIcons.skeletal,
    },
    {
      id: 'metabolic', name: 'Hepatic & Metabolic Core', subsystem: 'metabolic',
      position: [0.15, 2.05, 0.22],
      color: sugarStatus === 'RED' ? '#ef4444' : sugarStatus === 'YELLOW' ? '#f59e0b' : '#a855f7',
      status: sugarStatus, statusLabel: latestAssessment?.results.bloodSugar.statusLabel || 'Normal Glycemic Balance',
      telemetryValue: `${glucose} mg/dL • Temp ${temp}°C`,
      clinicalSummary: 'Assesses insulin sensitivity shifts, hepatic metabolic clearance, and zero-g convective core hyperthermia ("Space Fever").',
      nasaProtocol: 'Low glycemic index flight nutrition; ensure personal liquid cooling ventilation garment (LCVG) is active during workout.',
      icon: subsystemIcons.metabolic,
    },
  ], [hr, sys, dia, glucose, temp, hrStatus, sugarStatus, moodStatus, latestAssessment]);

  const selectedOrgan = organList.find((o) => o.id === selectedId) || organList[1];

  // Three.js control refs
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRotRef   = useRef<{ x: number; y: number }>({ x: 0.05, y: 0 });
  const currentRotRef  = useRef<{ x: number; y: number }>({ x: 0.05, y: 0 });
  const autoRotateRef  = useRef<boolean>(true);
  autoRotateRef.current = isAutoRotating;

  const setPresetAngle = (view: 'front' | 'side' | 'back' | 'iso' | 'top') => {
    setIsAutoRotating(false);
    switch (view) {
      case 'front': targetRotRef.current = { x: 0,    y: 0 }; break;
      case 'side':  targetRotRef.current = { x: 0,    y: Math.PI / 2 }; break;
      case 'back':  targetRotRef.current = { x: 0,    y: Math.PI }; break;
      case 'iso':   targetRotRef.current = { x: 0.25, y: 0.65 }; break;
      case 'top':   targetRotRef.current = { x: 0.75, y: 0 }; break;
    }
  };

  const handleZoomStep = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(5.0, Math.min(13.0, cameraRef.current.position.z + delta));
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Scene / Camera / Renderer ──────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b1a, 0.030);

    const width   = container.clientWidth;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 580;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.6, 10.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0e2040, 2.2));
    const keyLight = new THREE.DirectionalLight(0x00f0ff, 4.0);
    keyLight.position.set(4, 9, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x3b82f6, 2.5);
    fillLight.position.set(-6, -2, -5);
    scene.add(fillLight);
    const rimPoint = new THREE.PointLight(0x38bdf8, 6, 22);
    rimPoint.position.set(0, 4.5, -5.5);
    scene.add(rimPoint);
    const underLight = new THREE.PointLight(0x0ea5e9, 2.5, 12);
    underLight.position.set(0, -3, 3);
    scene.add(underLight);

    // ── Root pivot ─────────────────────────────────────────────────────
    const twinRoot = new THREE.Group();
    scene.add(twinRoot);

    // ── Holographic base projector ─────────────────────────────────────
    const baseGroup = new THREE.Group();
    baseGroup.position.y = -2.7;

    const ringMatCyan  = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55, wireframe: true });
    const ringMatBlue  = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.38, wireframe: true });
    const diskGlowMat  = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.14 });

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(2.5, 2.68, 72), ringMatCyan);
    outerRing.rotation.x = -Math.PI / 2;
    baseGroup.add(outerRing);

    const midRing = new THREE.Mesh(new THREE.RingGeometry(1.7, 1.86, 56), ringMatBlue);
    midRing.rotation.x = -Math.PI / 2;
    baseGroup.add(midRing);

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 40), ringMatCyan);
    innerRing.rotation.x = -Math.PI / 2;
    baseGroup.add(innerRing);

    const innerDisk = new THREE.Mesh(new THREE.CircleGeometry(2.7, 72), diskGlowMat);
    innerDisk.rotation.x = -Math.PI / 2;
    baseGroup.add(innerDisk);

    const spokeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.26 });
    for (let i = 0; i < 24; i++) {
      const theta = (i * Math.PI) / 12;
      baseGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(theta) * 0.9, 0, Math.sin(theta) * 0.9),
          new THREE.Vector3(Math.cos(theta) * 2.6, 0, Math.sin(theta) * 2.6),
        ]),
        spokeMat
      ));
    }
    scene.add(baseGroup);

    // ── Body materials ─────────────────────────────────────────────────
    const glassBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, emissive: 0x042740, emissiveIntensity: 0.7,
      roughness: 0.18, metalness: 0.88, transparent: true, opacity: 0.38,
    });
    const wireOverlayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.20,
    });

    const seg = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => {
      const g = new THREE.Group();
      g.position.set(...pos);
      if (rot) g.rotation.set(...rot);
      g.add(new THREE.Mesh(geo, glassBodyMat));
      g.add(new THREE.Mesh(geo, wireOverlayMat));
      return g;
    };

    // Head
    const craniumGeo = new THREE.SphereGeometry(0.60, 32, 32);
    craniumGeo.scale(0.90, 1.22, 0.98);
    twinRoot.add(seg(craniumGeo, [0, 4.48, 0]));

    // Jaw
    const jawGeo = new THREE.SphereGeometry(0.36, 20, 16);
    jawGeo.scale(0.85, 0.72, 0.9);
    twinRoot.add(seg(jawGeo, [0, 3.90, 0.10]));

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.22, 0.30, 0.52, 22);
    twinRoot.add(seg(neckGeo, [0, 3.72, 0]));

    // Clavicle yoke
    const clavicleGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.5, 12);
    twinRoot.add(seg(clavicleGeo, [0, 3.47, 0], [0, 0, Math.PI / 2]));

    // Upper chest
    const chestGeo = new THREE.CylinderGeometry(0.92, 0.84, 0.82, 28);
    chestGeo.scale(1.22, 1.0, 0.70);
    twinRoot.add(seg(chestGeo, [0, 3.1, 0]));

    // Mid torso
    const midTorsoGeo = new THREE.CylinderGeometry(0.84, 0.76, 0.82, 26);
    midTorsoGeo.scale(1.14, 1.0, 0.68);
    twinRoot.add(seg(midTorsoGeo, [0, 2.35, 0]));

    // Abdomen
    const abdomenGeo = new THREE.CylinderGeometry(0.72, 0.84, 0.82, 24);
    abdomenGeo.scale(1.08, 1.0, 0.65);
    twinRoot.add(seg(abdomenGeo, [0, 1.62, 0]));

    // Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.90, 0.78, 0.60, 24);
    pelvisGeo.scale(1.12, 1.0, 0.72);
    twinRoot.add(seg(pelvisGeo, [0, 1.05, 0]));

    // Ribcage arcs
    const ribMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.42 });
    for (let r = 0; r < 6; r++) {
      const ribY = 2.78 + r * 0.22;
      const arcCurve = new THREE.EllipseCurve(0, 0, 0.90 - r * 0.04, 0.54 - r * 0.03, 0, Math.PI, false, 0);
      const arcPts = arcCurve.getPoints(28).map((p) => new THREE.Vector3(p.x, ribY, p.y));
      twinRoot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), ribMat));
    }

    // Spine vertebrae
    const vertebraeMat = new THREE.MeshBasicMaterial({ color: 0xdde6f0, transparent: true, opacity: 0.72 });
    for (let v = 0; v < 12; v++) {
      const vY = 1.1 + v * 0.22;
      const vDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 14), vertebraeMat);
      vDisk.position.set(0, vY, -0.18);
      twinRoot.add(vDisk);
    }

    // ── Arms ───────────────────────────────────────────────────────────
    const lShoulderGeo  = new THREE.SphereGeometry(0.28, 20, 20);
    const lUpperArmGeo  = new THREE.CylinderGeometry(0.22, 0.18, 1.18, 18);
    const lElbowGeo     = new THREE.SphereGeometry(0.18, 14, 14);
    const lForearmGeo   = new THREE.CylinderGeometry(0.17, 0.13, 1.08, 16);
    const lHandGeo      = new THREE.BoxGeometry(0.19, 0.30, 0.10);

    // Left
    twinRoot.add(seg(lShoulderGeo,  [-1.18,  3.42, 0]));
    twinRoot.add(seg(lUpperArmGeo,  [-1.38,  2.78, 0], [0, 0,  0.18]));
    twinRoot.add(seg(lElbowGeo,     [-1.56,  2.14, 0]));
    twinRoot.add(seg(lForearmGeo,   [-1.60,  1.56, 0.06], [0, 0,  0.09]));
    twinRoot.add(seg(lHandGeo,      [-1.66,  0.98, 0.06]));
    // Right
    twinRoot.add(seg(lShoulderGeo,  [ 1.18,  3.42, 0]));
    twinRoot.add(seg(lUpperArmGeo,  [ 1.38,  2.78, 0], [0, 0, -0.18]));
    twinRoot.add(seg(lElbowGeo,     [ 1.56,  2.14, 0]));
    twinRoot.add(seg(lForearmGeo,   [ 1.60,  1.56, 0.06], [0, 0, -0.09]));
    twinRoot.add(seg(lHandGeo,      [ 1.66,  0.98, 0.06]));

    // ── Legs ───────────────────────────────────────────────────────────
    const thighGeo  = new THREE.CylinderGeometry(0.40, 0.30, 1.72, 22);
    const kneeGeo   = new THREE.SphereGeometry(0.26, 18, 18);
    kneeGeo.scale(1, 1, 0.84);
    const shinGeo   = new THREE.CylinderGeometry(0.25, 0.18, 1.68, 20);
    const ankleGeo  = new THREE.SphereGeometry(0.16, 14, 14);
    const footGeo   = new THREE.BoxGeometry(0.25, 0.17, 0.72);

    // Left leg
    twinRoot.add(seg(thighGeo, [-0.50,  0.46, 0], [0, 0, -0.03]));
    twinRoot.add(seg(kneeGeo,  [-0.52, -0.38, 0.04]));
    twinRoot.add(seg(shinGeo,  [-0.52, -1.22, 0]));
    twinRoot.add(seg(ankleGeo, [-0.52, -2.08, 0]));
    twinRoot.add(seg(footGeo,  [-0.52, -2.22, 0.20]));
    // Right leg
    twinRoot.add(seg(thighGeo, [ 0.50,  0.46, 0], [0, 0,  0.03]));
    twinRoot.add(seg(kneeGeo,  [ 0.52, -0.38, 0.04]));
    twinRoot.add(seg(shinGeo,  [ 0.52, -1.22, 0]));
    twinRoot.add(seg(ankleGeo, [ 0.52, -2.08, 0]));
    twinRoot.add(seg(footGeo,  [ 0.52, -2.22, 0.20]));

    // ── Vascular pathways ──────────────────────────────────────────────
    const artMat = new THREE.LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.55 });
    const venMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45 });

    const makeVessel = (pts: THREE.Vector3[], mat: THREE.LineBasicMaterial) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)), mat);
    };
    twinRoot.add(makeVessel([
      new THREE.Vector3(-0.3, 2.95, 0.4), new THREE.Vector3(-0.9, 2.65, 0.1),
      new THREE.Vector3(-1.35, 2.1, 0.05), new THREE.Vector3(-1.55, 1.3, 0.05),
    ], artMat));
    twinRoot.add(makeVessel([
      new THREE.Vector3(-0.1, 2.95, 0.4), new THREE.Vector3(0.9, 2.65, 0.1),
      new THREE.Vector3(1.35, 2.1, 0.05), new THREE.Vector3(1.55, 1.3, 0.05),
    ], artMat));
    twinRoot.add(makeVessel([
      new THREE.Vector3(0, 2.6, 0.2), new THREE.Vector3(-0.1, 1.5, 0.15),
      new THREE.Vector3(-0.5, 0.2, 0.1), new THREE.Vector3(-0.5, -1.5, 0.05),
    ], venMat));
    twinRoot.add(makeVessel([
      new THREE.Vector3(0, 2.6, 0.2), new THREE.Vector3(0.1, 1.5, 0.15),
      new THREE.Vector3(0.5, 0.2, 0.1), new THREE.Vector3(0.5, -1.5, 0.05),
    ], venMat));

    // ── Organ nodes ────────────────────────────────────────────────────
    const organNodes = new Map<string, THREE.Group>();
    organList.forEach((organ) => {
      const g = new THREE.Group();
      g.position.set(...organ.position);
      const organColor = new THREE.Color(organ.color);

      let organGeo: THREE.BufferGeometry;
      if (organ.id === 'heart') {
        organGeo = new THREE.SphereGeometry(0.26, 22, 22);
        organGeo.scale(1.0, 1.28, 0.95);
      } else if (organ.id === 'brain') {
        organGeo = new THREE.SphereGeometry(0.38, 24, 24);
        organGeo.scale(1.12, 0.92, 1.08);
      } else if (organ.id === 'lungs') {
        organGeo = new THREE.CylinderGeometry(0.30, 0.36, 0.72, 18);
        organGeo.scale(1.42, 1.0, 0.78);
      } else {
        organGeo = new THREE.SphereGeometry(0.22, 18, 18);
      }

      const organMat = new THREE.MeshStandardMaterial({
        color: organColor, emissive: organColor, emissiveIntensity: 2.5,
        roughness: 0.12, metalness: 0.5,
      });
      const mesh = new THREE.Mesh(organGeo, organMat);
      g.add(mesh);

      const auraMat = new THREE.MeshBasicMaterial({
        color: organColor, side: THREE.DoubleSide, transparent: true, opacity: 0.60,
      });
      g.add(new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 32), auraMat));

      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.52, 0.42, 0.22)
        ]),
        new THREE.LineBasicMaterial({ color: organColor, transparent: true, opacity: 0.72 })
      ));

      g.userData = { organId: organ.id };
      twinRoot.add(g);
      organNodes.set(organ.id, g);
    });

    // ── Laser scanner ──────────────────────────────────────────────────
    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 0.07),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
    );
    scanPlane.rotation.x = Math.PI / 2;
    twinRoot.add(scanPlane);

    // ── Particle cloud ─────────────────────────────────────────────────
    const particleCount = 220;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i]     = (Math.random() - 0.5) * 7.0;
      pPos[i + 1] = Math.random() * 8.0 - 2.5;
      pPos[i + 2] = (Math.random() - 0.5) * 7.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleCloud = new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.042, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    scene.add(particleCloud);

    // ── Mouse / touch controls ─────────────────────────────────────────
    let isDragging = false;
    let prevX = 0, prevY = 0;

    const onMouseDown = (e: MouseEvent) => { isDragging = true; setIsAutoRotating(false); prevX = e.clientX; prevY = e.clientY; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      targetRotRef.current.y += (e.clientX - prevX) * 0.009;
      targetRotRef.current.x  = Math.max(-0.45, Math.min(0.65, targetRotRef.current.x + (e.clientY - prevY) * 0.006));
      prevX = e.clientX; prevY = e.clientY;
    };
    const onMouseUp  = () => { isDragging = false; };
    const onWheel    = (e: WheelEvent) => { e.preventDefault(); camera.position.z = Math.max(5.0, Math.min(13.0, camera.position.z + e.deltaY * 0.005)); };
    const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 1) { isDragging = true; setIsAutoRotating(false); prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; } };
    const onTouchMove  = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      targetRotRef.current.y += (e.touches[0].clientX - prevX) * 0.012;
      targetRotRef.current.x  = Math.max(-0.45, Math.min(0.65, targetRotRef.current.x + (e.touches[0].clientY - prevY) * 0.008));
      prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    };
    const onTouchEnd = () => { isDragging = false; };

    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    const onClick   = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      organNodes.forEach((grp) => { if (grp.children[0]) meshes.push(grp.children[0]); });
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        const id = hits[0].object.parent?.userData.organId as string;
        if (id) { setInternalSelectedId(id); onSelectOrgan?.(id); }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('click', onClick);

    // ── Render loop ────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (autoRotateRef.current) targetRotRef.current.y += 0.005;

      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * 0.09;
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * 0.09;
      twinRoot.rotation.y = currentRotRef.current.y;
      twinRoot.rotation.x = currentRotRef.current.x;

      outerRing.rotation.z = t * 0.18;
      midRing.rotation.z   = -t * 0.30;
      innerRing.rotation.z =  t * 0.52;

      scanPlane.position.y = 1.4 + Math.sin(t * 2.2) * 3.3;

      // Heart pulse sync to BPM
      const heartGrp = organNodes.get('heart');
      if (heartGrp) {
        const bps = hr / 60;
        const bt  = (t * bps * Math.PI * 2) % (Math.PI * 2);
        const beat = 1.0 + Math.sin(bt) * 0.16 + (Math.sin(bt * 2) > 0 ? Math.sin(bt * 2) * 0.09 : 0);
        heartGrp.scale.set(beat, beat, beat);
      }

      // Brain synapse
      const brainGrp = organNodes.get('brain');
      if (brainGrp) { const bp = 1.0 + Math.sin(t * 3.8) * 0.06; brainGrp.scale.set(bp, bp, bp); }

      // Lung breath
      const lungGrp = organNodes.get('lungs');
      if (lungGrp) { const lp = 1.0 + Math.sin(t * 0.4) * 0.08; lungGrp.scale.set(lp, lp * 1.05, lp); }

      // Billboard aura rings
      organNodes.forEach((grp) => {
        if (grp.children[1]) grp.children[1].quaternion.copy(camera.quaternion);
      });

      // Highlight selected organ (brighter emissive)
      organNodes.forEach((grp, id) => {
        const mesh = grp.children[0] as THREE.Mesh;
        if (mesh?.material) {
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = id === selectedId ? 4.2 : 2.5;
        }
      });

      particleCloud.rotation.y = t * 0.032;
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [height, hr, organList, selectedId]);

  // ── ECG / status helpers ───────────────────────────────────────────────
  const ecgStroke = selectedOrgan.status === 'GREEN' ? '#10b981' : selectedOrgan.status === 'RED' ? '#ef4444' : '#f59e0b';
  const sc = statusColors[selectedOrgan.status as keyof typeof statusColors] || statusColors.GREEN;
  const OrganIcon = selectedOrgan.icon || HeartPulse;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#070c1f] via-[#060a1a] to-[#040714] border border-[#1b2752] shadow-2xl overflow-hidden select-none">

      {/* ── Top Controls Bar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#1b2752] bg-[#060a1a]/90 backdrop-blur-md">

        <div className="flex items-center gap-2 bg-[#0a112c]/90 border border-cyan-500/40 px-3 py-1.5 rounded-2xl shadow-md">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '9s' }} />
          <div>
            <span className="text-xs font-black text-white font-mono tracking-wider block">3D DIGITAL TWIN 360°</span>
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYNC: {hr} BPM • NOMINAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0a112c]/90 border border-blue-500/30 p-1 rounded-xl shadow-md">
          {(['front', 'side', 'back', 'iso', 'top'] as const).map((v) => (
            <button key={v} onClick={() => setPresetAngle(v)}
              className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all">
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#0a112c]/90 border border-blue-500/30 p-1 rounded-xl shadow-md">
          <button onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg transition-colors ${isAutoRotating ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
            title={isAutoRotating ? 'Pause orbit' : 'Resume orbit'}>
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => handleZoomStep(-1.0)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleZoomStep(1.0)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setPresetAngle('front'); setIsAutoRotating(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Canvas LEFT | Detail Panel RIGHT ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row">

        {/* ── 3D Canvas — no overlapping cards ────────────────────────── */}
        <div className="relative flex-1 min-w-0">
          <div
            ref={mountRef}
            style={{ height: typeof height === 'number' ? height : 580 }}
            className="w-full cursor-grab active:cursor-grabbing"
            title="Drag to rotate 360°. Scroll to zoom. Click glowing nodes to inspect."
          />
          {/* Drag hint at bottom of canvas — stays inside canvas, NOT over body */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-[#0a112c]/80 border border-cyan-500/25 text-[10px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-2">
              <Rotate3d className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              DRAG TO ROTATE 360° • SCROLL TO ZOOM • CLICK ORGAN TO INSPECT
            </div>
          </div>
        </div>

        {/* ── Right Detail Panel ───────────────────────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-[#1b2752] bg-[#060a1a]/95 backdrop-blur-xl">

          {/* Organ detail — scrollable */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto" style={{ maxHeight: typeof height === 'number' ? height + 46 : 626 }}>

            {/* Header */}
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">
                {selectedOrgan.subsystem.toUpperCase()} SUBSYSTEM — ACTIVE NODE
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
                    <OrganIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white font-sans leading-tight">{selectedOrgan.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border shrink-0 ${sc.badge}`}>
                  {selectedOrgan.statusLabel.split(' ').slice(0, 3).join(' ')}
                </span>
              </div>
            </div>

            {/* Live biometric */}
            <div className="p-3 rounded-2xl bg-[#0a1530]/80 border border-cyan-500/20">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1 font-bold">Live Biometric</span>
              <p className="text-sm font-bold text-white font-mono">{selectedOrgan.telemetryValue}</p>
            </div>

            {/* ECG wave */}
            <div className="h-10 w-full">
              <svg viewBox="0 0 240 32" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <filter id="ecg-glow3d">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <polyline
                  points="0,16 38,16 48,4 58,28 68,8 78,20 88,16 148,16 158,2 168,30 178,5 188,22 200,16 240,16"
                  fill="none" stroke={ecgStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  filter="url(#ecg-glow3d)"
                />
              </svg>
            </div>

            {/* Clinical summary */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Clinical Summary</span>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedOrgan.clinicalSummary}</p>
            </div>

            {/* NASA protocol */}
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/25">
              <strong className="text-[10px] font-mono text-cyan-300 block mb-1.5 uppercase tracking-wider">NASA Countermeasure Protocol</strong>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedOrgan.nasaProtocol}</p>
            </div>

          </div>

          {/* Organ switcher — bottom of panel */}
          <div className="border-t border-[#1b2752] p-4 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
              Anatomical Systems
            </span>
            <div className="flex flex-col gap-1">
              {organList.map((organ) => {
                const isSelected = organ.id === selectedId;
                const OIcon = organ.icon;
                return (
                  <button
                    key={organ.id}
                    onClick={() => { setInternalSelectedId(organ.id); onSelectOrgan?.(organ.id); }}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border border-cyan-500/40 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: organ.color }} />
                      <OIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{organ.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
