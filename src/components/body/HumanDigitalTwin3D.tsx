/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: 3D Holographic Human Digital Twin (Three.js WebGL)
 * Features:
 *  - 360° Free Mouse/Touch Drag Rotation with Momentum Damping
 *  - Real-time Anatomical Subsystem Layers (Cardiovascular, Respiratory, Nervous, Musculoskeletal, Digestive)
 *  - Dynamic 3D Organ Nodes with Pulsing Heart Rate Sync
 *  - Sci-Fi Rotating Hologram Projector Pedestal & Scanning Laser Grid
 *  - Interactive Camera Presets (Front, Back, Side, Reset)
 *  - Auto-Orbit Toggle & Zoom Controls
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import {
  Rotate3d,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface HumanDigitalTwin3DProps {
  latestAssessment?: DailyAssessmentRecord;
  onSelectOrgan?: (organId: string) => void;
  selectedOrganId?: string;
  height?: number | string;
}

export interface OrganNodeData {
  id: string;
  name: string;
  system: string;
  position: [number, number, number];
  color: string;
  status: HealthStatus;
  statusLabel: string;
  valueDisplay: string;
  description: string;
  countermeasure: string;
}

export const HumanDigitalTwin3D: React.FC<HumanDigitalTwin3DProps> = ({
  latestAssessment,
  onSelectOrgan,
  selectedOrganId: propSelectedOrganId,
  height = 560,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState<string>('heart');

  const selectedId = propSelectedOrganId || internalSelectedId;

  // Organ data derived from live telemetry
  const hrStatus = latestAssessment?.results.heartRate.status || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status || 'GREEN';
  const tempStatus = latestAssessment?.results.bodyTemperature.status || 'GREEN';
  const moodStatus = latestAssessment?.results.mood.status || 'GREEN';

  const organDataList: OrganNodeData[] = [
    {
      id: 'brain',
      name: 'Central Nervous System',
      system: 'Neurological / Psychological',
      position: [0, 4.4, 0],
      color: '#38bdf8',
      status: moodStatus,
      statusLabel: moodStatus === 'GREEN' ? 'Nominal' : 'Stress / Fatigue',
      valueDisplay: latestAssessment?.results.mood.valueDisplay || 'Good Readiness',
      description: 'Space Adaptation Syndrome (SAS) & cognitive workload surveillance. Frontal lobe executive performance nominal.',
      countermeasure: 'Follow 8-hour circadian dark cycle; perform 10-minute mindfulness breathing in cupola.',
    },
    {
      id: 'lungs',
      name: 'Pulmonary / Lungs',
      system: 'Respiratory',
      position: [0, 3.1, 0.1],
      color: '#22d3ee',
      status: 'GREEN',
      statusLabel: 'Nominal',
      valueDisplay: 'SpO₂ 98% • Cabin O₂ 21.3%',
      description: 'CO₂ scrubbing and microgravity pulmonary perfusion balance within strict NASA-STD-3001 limits.',
      countermeasure: 'Verify crew quarters ventilation flow rate exceeds 0.2 m/s to prevent localized CO₂ pocket accumulation.',
    },
    {
      id: 'heart',
      name: 'Cardiovascular Core',
      system: 'Circulatory',
      position: [-0.35, 2.9, 0.35],
      color: hrStatus === 'RED' ? '#ef4444' : hrStatus === 'YELLOW' ? '#f59e0b' : '#10b981',
      status: hrStatus,
      statusLabel: latestAssessment?.results.heartRate.statusLabel || 'Healthy (Nominal)',
      valueDisplay: `${latestAssessment?.values.heartRate || 72} BPM • ${latestAssessment?.values.systolic || 118}/${latestAssessment?.values.diastolic || 76} mmHg`,
      description: 'Monitors cephalic fluid shift, stroke volume alteration, and resting cardiovascular drift in zero-gravity.',
      countermeasure: 'Complete 30-min interval cycle ergometer (CEVIS) protocol and consume 1.0 L electrolyte fluid pre-EVA.',
    },
    {
      id: 'metabolic',
      name: 'Hepatic / Digestive',
      system: 'Metabolic',
      position: [0.1, 2.0, 0.2],
      color: sugarStatus === 'RED' ? '#ef4444' : sugarStatus === 'YELLOW' ? '#f59e0b' : '#a855f7',
      status: sugarStatus,
      statusLabel: latestAssessment?.results.bloodSugar.statusLabel || 'Nominal',
      valueDisplay: `${latestAssessment?.values.bloodSugar || 92} mg/dL`,
      description: 'Capillary glucose and nutritional metabolic utilization under altered spaceflight gastrointestinal motility.',
      countermeasure: 'Spaceflight menu adherence; maintain adequate potassium and dietary fiber intake.',
    },
    {
      id: 'spine',
      name: 'Spinal Column & Skeletal',
      system: 'Musculoskeletal',
      position: [0, 1.8, -0.15],
      color: '#cbd5e1',
      status: 'GREEN',
      statusLabel: 'Nominal',
      valueDisplay: '+3.2 cm height elongation',
      description: 'Spinal intervertebral disc decompression (spaceflight height expansion). Monitored for lumbar disc herniation risk.',
      countermeasure: 'Perform daily ARED deadlifts and axial loading exercises (600 kg-force resistance equivalent).',
    },
    {
      id: 'thermo',
      name: 'Thermoregulatory Core',
      system: 'Immune & Temperature',
      position: [0, 2.5, 0],
      color: tempStatus === 'RED' ? '#ef4444' : tempStatus === 'YELLOW' ? '#f59e0b' : '#f97316',
      status: tempStatus,
      statusLabel: latestAssessment?.results.bodyTemperature.statusLabel || 'Normal',
      valueDisplay: `${latestAssessment?.values.bodyTemperature || 36.6} °C`,
      description: 'Zero-g convective heat dissipation impairment surveillance (Space Fever risk monitoring).',
      countermeasure: 'Ensure active liquid cooling ventilation garment (LCVG) is operational during physical countermeasures.',
    },
  ];

  const selectedOrgan = organDataList.find((o) => o.id === selectedId) || organDataList[2];

  // Ref holders for Three.js control outside useEffect
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoRotateRef = useRef<boolean>(true);
  const organMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  autoRotateRef.current = isAutoRotating;

  // View preset handlers
  const setViewPreset = (angle: 'front' | 'back' | 'left' | 'right' | 'top') => {
    setIsAutoRotating(false);
    if (!targetRotationRef.current) return;
    switch (angle) {
      case 'front':
        targetRotationRef.current = { x: 0, y: 0 };
        break;
      case 'back':
        targetRotationRef.current = { x: 0, y: Math.PI };
        break;
      case 'left':
        targetRotationRef.current = { x: 0, y: -Math.PI / 2 };
        break;
      case 'right':
        targetRotationRef.current = { x: 0, y: Math.PI / 2 };
        break;
      case 'top':
        targetRotationRef.current = { x: 0.6, y: 0 };
        break;
    }
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(5.5, Math.min(13, cameraRef.current.position.z + delta));
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b1a, 0.04);

    const width = container.clientWidth;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.8, 9.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a2540, 1.5);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x00f0ff, 3.0);
    cyanKeyLight.position.set(5, 8, 6);
    scene.add(cyanKeyLight);

    const blueFillLight = new THREE.DirectionalLight(0x3b82f6, 2.0);
    blueFillLight.position.set(-6, -2, -4);
    scene.add(blueFillLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 4, 15);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // 3. Digital Twin Root Pivot Group (for 360° rotation)
    const twinGroup = new THREE.Group();
    scene.add(twinGroup);

    // 4. Sci-Fi Hologram Base Pedestal (Rotating Rings & Grid)
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -2.6;

    // Base Rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.45 });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.4, 48), ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    pedestalGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.6, 36), ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    pedestalGroup.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.15 });
    const ring3 = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), ringMat3);
    ring3.rotation.x = -Math.PI / 2;
    pedestalGroup.add(ring3);

    // Radial spokes
    const spokeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const points = [
        new THREE.Vector3(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5),
        new THREE.Vector3(Math.cos(angle) * 2.3, 0, Math.sin(angle) * 2.3),
      ];
      const spokeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const spoke = new THREE.Line(spokeGeo, spokeMat);
      pedestalGroup.add(spoke);
    }

    scene.add(pedestalGroup);

    // 5. Build High-Fidelity 3D Anatomical Human Mesh
    // Materials
    const holographicBodyMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x04384d,
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: 0.42,
      wireframe: false,
    });

    const holographicWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const createLimb = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => {
      const g = new THREE.Group();
      g.position.set(...pos);
      if (rot) g.rotation.set(...rot);
      const solid = new THREE.Mesh(geo, holographicBodyMat);
      const wire = new THREE.Mesh(geo, holographicWireMat);
      g.add(solid);
      g.add(wire);
      return g;
    };

    // Head
    const headGeo = new THREE.SphereGeometry(0.55, 24, 24);
    headGeo.scale(0.85, 1.15, 0.95);
    twinGroup.add(createLimb(headGeo, [0, 4.4, 0]));

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.45, 16);
    twinGroup.add(createLimb(neckGeo, [0, 3.7, 0]));

    // Torso / Chest
    const chestGeo = new THREE.CylinderGeometry(0.9, 0.75, 1.3, 20);
    chestGeo.scale(1.15, 1, 0.7);
    twinGroup.add(createLimb(chestGeo, [0, 3.0, 0]));

    // Abdomen & Pelvis
    const abdomenGeo = new THREE.CylinderGeometry(0.72, 0.82, 1.2, 20);
    abdomenGeo.scale(1.05, 1, 0.65);
    twinGroup.add(createLimb(abdomenGeo, [0, 1.85, 0]));

    // Left Arm (Shoulder, Upper Arm, Forearm, Hand)
    const upperArmGeo = new THREE.CylinderGeometry(0.24, 0.2, 1.1, 14);
    twinGroup.add(createLimb(upperArmGeo, [-1.25, 2.9, 0], [0, 0, 0.15]));
    const forearmGeo = new THREE.CylinderGeometry(0.19, 0.16, 1.05, 14);
    twinGroup.add(createLimb(forearmGeo, [-1.45, 1.9, 0.05], [0, 0, 0.1]));
    const handGeo = new THREE.BoxGeometry(0.18, 0.28, 0.12);
    twinGroup.add(createLimb(handGeo, [-1.55, 1.3, 0.05]));

    // Right Arm
    twinGroup.add(createLimb(upperArmGeo, [1.25, 2.9, 0], [0, 0, -0.15]));
    twinGroup.add(createLimb(forearmGeo, [1.45, 1.9, 0.05], [0, 0, -0.1]));
    twinGroup.add(createLimb(handGeo, [1.55, 1.3, 0.05]));

    // Left Leg (Thigh, Shin, Foot)
    const thighGeo = new THREE.CylinderGeometry(0.38, 0.28, 1.6, 16);
    twinGroup.add(createLimb(thighGeo, [-0.5, 0.6, 0], [0, 0, -0.04]));
    const shinGeo = new THREE.CylinderGeometry(0.26, 0.2, 1.6, 16);
    twinGroup.add(createLimb(shinGeo, [-0.52, -0.9, 0], [0, 0, 0]));
    const footGeo = new THREE.BoxGeometry(0.25, 0.2, 0.65);
    twinGroup.add(createLimb(footGeo, [-0.52, -1.8, 0.18]));

    // Right Leg
    twinGroup.add(createLimb(thighGeo, [0.5, 0.6, 0], [0, 0, 0.04]));
    twinGroup.add(createLimb(shinGeo, [0.52, -0.9, 0], [0, 0, 0]));
    twinGroup.add(createLimb(footGeo, [0.52, -1.8, 0.18]));

    // 6. Interactive 3D Glowing Organ Spheres
    const organMap = new Map<string, THREE.Mesh>();
    organDataList.forEach((organ) => {
      const nodeColor = new THREE.Color(organ.color);

      // Core sphere
      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 1.8,
        roughness: 0.1,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(...organ.position);

      // Pulsing outer aura ring
      const auraGeo = new THREE.RingGeometry(0.24, 0.32, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      nodeMesh.add(auraMesh);

      nodeMesh.userData = { organId: organ.id };
      twinGroup.add(nodeMesh);
      organMap.set(organ.id, nodeMesh);
    });
    organMeshesRef.current = organMap;

    // 7. Ambient Particle Cloud (Telemetry Nano-Dust)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = Math.random() * 7 - 2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Vertical Laser Scan Plane
    const scanPlaneGeo = new THREE.PlaneGeometry(3.6, 0.06);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    twinGroup.add(scanPlane);

    // 9. Interactive Drag & Click Rotation Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsAutoRotating(false);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationRef.current.y += deltaX * 0.009;
      targetRotationRef.current.x = Math.max(-0.4, Math.min(0.5, targetRotationRef.current.x + deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        setIsAutoRotating(false);
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetRotationRef.current.y += deltaX * 0.012;
      targetRotationRef.current.x = Math.max(-0.4, Math.min(0.5, targetRotationRef.current.x + deltaY * 0.008));
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    // Raycaster for Clicking 3D Organs
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(organMap.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const clickedOrganId = intersects[0].object.userData.organId as string;
        if (clickedOrganId) {
          setInternalSelectedId(clickedOrganId);
          onSelectOrgan?.(clickedOrganId);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('click', onClick);

    // 10. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto-orbit
      if (autoRotateRef.current) {
        targetRotationRef.current.y += 0.006;
      }

      // Smooth inertia rotation interpolation
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      twinGroup.rotation.y = currentRotationRef.current.y;
      twinGroup.rotation.x = currentRotationRef.current.x;

      // Base Pedestal subtle counter-rotation
      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.z = -elapsedTime * 0.35;

      // Scanning Laser Vertical Loop (-1.8 to 4.8)
      const scanY = 1.5 + Math.sin(elapsedTime * 2.2) * 3.1;
      scanPlane.position.y = scanY;

      // Pulsing heart organ effect based on heart rate
      const heartMesh = organMap.get('heart');
      if (heartMesh) {
        const hrRate = (latestAssessment?.values.heartRate || 72) / 60;
        const pulse = 1 + Math.sin(elapsedTime * hrRate * Math.PI * 2) * 0.18;
        heartMesh.scale.set(pulse, pulse, pulse);
      }

      // Billboarding organ auras so they face camera
      organMap.forEach((mesh) => {
        const aura = mesh.children[0];
        if (aura) {
          aura.quaternion.copy(camera.quaternion);
        }
      });

      // Slowly float particles
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 560;
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
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [height, latestAssessment]);

  return (
    <div className="relative w-full rounded-3xl bg-[#070b1a] border border-[#1b2752] overflow-hidden shadow-2xl backdrop-blur-xl">

      {/* Top Hologram HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Title & Status */}
        <div className="flex items-center gap-2.5 bg-[#0b132e]/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-lg pointer-events-auto">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-black text-white font-mono tracking-wider">
            HUMAN DIGITAL TWIN 360°
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* 360° Preset Angle Buttons */}
        <div className="flex items-center gap-1 bg-[#0b132e]/90 border border-blue-500/30 p-1 rounded-xl shadow-lg pointer-events-auto">
          <button
            onClick={() => setViewPreset('front')}
            className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-colors"
          >
            FRONT
          </button>
          <button
            onClick={() => setViewPreset('left')}
            className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-colors"
          >
            SIDE
          </button>
          <button
            onClick={() => setViewPreset('back')}
            className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-colors"
          >
            BACK
          </button>
          <button
            onClick={() => setViewPreset('top')}
            className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-colors"
          >
            TOP
          </button>
        </div>

        {/* Auto Orbit & Zoom Floating Controls */}
        <div className="flex items-center gap-1 bg-[#0b132e]/90 border border-blue-500/30 p-1 rounded-xl shadow-lg pointer-events-auto">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              isAutoRotating ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title={isAutoRotating ? 'Pause 360° auto-orbit' : 'Resume 360° auto-orbit'}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleZoom(-1.0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewPreset('front')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Orientation"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing"
        title="Click and drag to rotate 360°. Click any glowing node to inspect."
      />

      {/* Drag Instruction Overlay at Bottom-Center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300/80 backdrop-blur-md flex items-center gap-1.5">
          <Rotate3d className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>DRAG MOUSE OR TOUCH TO ROTATE 360° • CLICK ORGAN TO INSPECT</span>
        </div>
      </div>

      {/* Floating Organ Quick Inspector Card (Bottom-Right) */}
      {selectedOrgan && (
        <div className="absolute bottom-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] p-4 rounded-2xl bg-[#0c142b]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl animate-fade-in font-sans">
          <div className="flex items-start justify-between gap-2 border-b border-[#1b2752] pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                {selectedOrgan.system}
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedOrgan.color }}
                />
                {selectedOrgan.name}
              </h4>
            </div>

            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                selectedOrgan.status === 'GREEN'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : selectedOrgan.status === 'RED'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              {selectedOrgan.statusLabel}
            </div>
          </div>

          <p className="text-xs font-bold text-white font-mono mb-1.5">
            Active Reading: <span className="text-cyan-300">{selectedOrgan.valueDisplay}</span>
          </p>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            {selectedOrgan.description}
          </p>

          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px]">
            <strong className="text-blue-300 block mb-0.5 font-mono">NASA COUNTERMEASURE:</strong>
            <p className="text-slate-300 leading-tight">{selectedOrgan.countermeasure}</p>
          </div>
        </div>
      )}

      {/* Floating Anatomical Systems Pill Selector (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          Select Subsystem
        </span>
        <div className="flex flex-wrap gap-1 bg-[#0b132e]/90 border border-[#1b2752] p-1.5 rounded-2xl shadow-lg backdrop-blur-md">
          {organDataList.map((organ) => {
            const isSelected = organ.id === selectedId;
            return (
              <button
                key={organ.id}
                onClick={() => {
                  setInternalSelectedId(organ.id);
                  onSelectOrgan?.(organ.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: organ.color }}
                />
                <span>{organ.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
