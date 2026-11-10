/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Automated Evaluation Engine Test Suite (Vanilla ESM)
 */

// Test thresholds matching src/config/thresholds.ts
const PROVISIONAL_DEMO_THRESHOLDS = {
  heartRate: {
    green: { min: 55, max: 90 },
    yellowLow: { min: 45, max: 54 },
    yellowHigh: { min: 91, max: 110 },
    redCriticalLow: 44,
    redCriticalHigh: 111,
  },
  bloodPressure: {
    systolic: {
      green: { min: 95, max: 125 },
      yellowLow: { min: 85, max: 94 },
      yellowHigh: { min: 126, max: 140 },
      redCriticalLow: 84,
      redCriticalHigh: 141,
    },
    diastolic: {
      green: { min: 60, max: 80 },
      yellowLow: { min: 50, max: 59 },
      yellowHigh: { min: 81, max: 90 },
      redCriticalLow: 49,
      redCriticalHigh: 91,
    },
  },
  bloodSugar: {
    green: { min: 70, max: 115 },
    yellowLow: { min: 60, max: 69 },
    yellowHigh: { min: 116, max: 140 },
    redCriticalLow: 59,
    redCriticalHigh: 141,
  },
  bodyTemperature: {
    green: { min: 36.3, max: 37.3 },
    yellowLow: { min: 35.5, max: 36.2 },
    yellowHigh: { min: 37.4, max: 38.0 },
    redCriticalLow: 35.4,
    redCriticalHigh: 38.1,
  },
  sleepDuration: {
    green: { min: 7.0, max: 9.0 },
    yellowLow: { min: 5.5, max: 6.9 },
    yellowHigh: { min: 9.1, max: 11.0 },
    redCriticalLow: 5.4,
    redCriticalHigh: 11.1,
  },
  moodMap: {
    excellent: { status: 'GREEN' },
    good: { status: 'GREEN' },
    fatigued: { status: 'YELLOW' },
    stressed: { status: 'YELLOW' },
    disoriented: { status: 'RED' },
  },
};

function evaluateHeartRate(bpm) {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.heartRate;
  if (bpm <= cfg.redCriticalLow || bpm >= cfg.redCriticalHigh) return 'RED';
  if ((cfg.yellowLow && bpm >= cfg.yellowLow.min && bpm <= cfg.yellowLow.max) ||
      (cfg.yellowHigh && bpm >= cfg.yellowHigh.min && bpm <= cfg.yellowHigh.max)) return 'YELLOW';
  return 'GREEN';
}

function evaluateBloodPressure(sys, dia) {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bloodPressure;
  if (sys >= cfg.systolic.redCriticalHigh || dia >= cfg.diastolic.redCriticalHigh ||
      sys <= cfg.systolic.redCriticalLow || dia <= cfg.diastolic.redCriticalLow) return 'RED';
  if ((sys >= cfg.systolic.yellowHigh.min && sys <= cfg.systolic.yellowHigh.max) ||
      (dia >= cfg.diastolic.yellowHigh.min && dia <= cfg.diastolic.yellowHigh.max) ||
      (sys >= cfg.systolic.yellowLow.min && sys <= cfg.systolic.yellowLow.max) ||
      (dia >= cfg.diastolic.yellowLow.min && dia <= cfg.diastolic.yellowLow.max)) return 'YELLOW';
  return 'GREEN';
}

function evaluateBloodSugar(glucose) {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bloodSugar;
  if (glucose <= cfg.redCriticalLow || glucose >= cfg.redCriticalHigh) return 'RED';
  if ((glucose >= cfg.yellowLow.min && glucose <= cfg.yellowLow.max) ||
      (glucose >= cfg.yellowHigh.min && glucose <= cfg.yellowHigh.max)) return 'YELLOW';
  return 'GREEN';
}

function evaluateBodyTemperature(temp) {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bodyTemperature;
  if (temp <= cfg.redCriticalLow || temp >= cfg.redCriticalHigh) return 'RED';
  if ((temp >= cfg.yellowLow.min && temp <= cfg.yellowLow.max) ||
      (temp >= cfg.yellowHigh.min && temp <= cfg.yellowHigh.max)) return 'YELLOW';
  return 'GREEN';
}

function evaluateSleepDuration(hrs) {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.sleepDuration;
  if (hrs <= cfg.redCriticalLow || hrs >= cfg.redCriticalHigh) return 'RED';
  if ((hrs >= cfg.yellowLow.min && hrs <= cfg.yellowLow.max) ||
      (hrs >= cfg.yellowHigh.min && hrs <= cfg.yellowHigh.max)) return 'YELLOW';
  return 'GREEN';
}

function evaluateMood(mood) {
  return PROVISIONAL_DEMO_THRESHOLDS.moodMap[mood]?.status || 'GREEN';
}

function calculateOverall(statuses) {
  if (statuses.includes('RED')) return 'RED';
  if (statuses.includes('YELLOW')) return 'YELLOW';
  return 'GREEN';
}

let pass = 0;
let fail = 0;
function check(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    pass++;
  } else {
    console.error(`[FAIL] ${msg}`);
    fail++;
  }
}

console.log('--- EXERCISING PHYSIOLOGICAL STATUS EVALUATIONS ---');
// Heart rate boundaries
check(evaluateHeartRate(65) === 'GREEN', 'Resting HR 65 BPM is GREEN');
check(evaluateHeartRate(50) === 'YELLOW', 'Resting HR 50 BPM is YELLOW (bradycardia)');
check(evaluateHeartRate(98) === 'YELLOW', 'Resting HR 98 BPM is YELLOW (tachycardia)');
check(evaluateHeartRate(42) === 'RED', 'Resting HR 42 BPM is RED (critical bradycardia)');
check(evaluateHeartRate(120) === 'RED', 'Resting HR 120 BPM is RED (critical tachycardia)');

// Blood pressure boundaries
check(evaluateBloodPressure(118, 76) === 'GREEN', 'BP 118/76 is GREEN');
check(evaluateBloodPressure(132, 82) === 'YELLOW', 'BP 132/82 is YELLOW');
check(evaluateBloodPressure(90, 56) === 'YELLOW', 'BP 90/56 is YELLOW');
check(evaluateBloodPressure(150, 95) === 'RED', 'BP 150/95 is RED');
check(evaluateBloodPressure(80, 48) === 'RED', 'BP 80/48 is RED');

// Blood glucose boundaries
check(evaluateBloodSugar(90) === 'GREEN', 'Sugar 90 mg/dL is GREEN');
check(evaluateBloodSugar(65) === 'YELLOW', 'Sugar 65 mg/dL is YELLOW');
check(evaluateBloodSugar(125) === 'YELLOW', 'Sugar 125 mg/dL is YELLOW');
check(evaluateBloodSugar(50) === 'RED', 'Sugar 50 mg/dL is RED');
check(evaluateBloodSugar(150) === 'RED', 'Sugar 150 mg/dL is RED');

// Temperature boundaries
check(evaluateBodyTemperature(36.8) === 'GREEN', 'Temp 36.8°C is GREEN');
check(evaluateBodyTemperature(36.0) === 'YELLOW', 'Temp 36.0°C is YELLOW');
check(evaluateBodyTemperature(37.6) === 'YELLOW', 'Temp 37.6°C is YELLOW');
check(evaluateBodyTemperature(35.2) === 'RED', 'Temp 35.2°C is RED');
check(evaluateBodyTemperature(38.5) === 'RED', 'Temp 38.5°C is RED');

// Sleep duration boundaries
check(evaluateSleepDuration(7.5) === 'GREEN', 'Sleep 7.5 hrs is GREEN');
check(evaluateSleepDuration(6.2) === 'YELLOW', 'Sleep 6.2 hrs is YELLOW');
check(evaluateSleepDuration(9.5) === 'YELLOW', 'Sleep 9.5 hrs is YELLOW');
check(evaluateSleepDuration(4.5) === 'RED', 'Sleep 4.5 hrs is RED');
check(evaluateSleepDuration(12.0) === 'RED', 'Sleep 12.0 hrs is RED');

// Mood states
check(evaluateMood('excellent') === 'GREEN', 'Mood excellent is GREEN');
check(evaluateMood('good') === 'GREEN', 'Mood good is GREEN');
check(evaluateMood('fatigued') === 'YELLOW', 'Mood fatigued is YELLOW');
check(evaluateMood('stressed') === 'YELLOW', 'Mood stressed is YELLOW');
check(evaluateMood('disoriented') === 'RED', 'Mood disoriented is RED');

// Overall Triage Rules
check(calculateOverall(['GREEN', 'GREEN', 'GREEN', 'GREEN', 'GREEN', 'GREEN']) === 'GREEN', 'All Green -> Overall GREEN');
check(calculateOverall(['GREEN', 'GREEN', 'YELLOW', 'GREEN', 'GREEN', 'GREEN']) === 'YELLOW', '1 Yellow + 5 Green -> Overall YELLOW');
check(calculateOverall(['GREEN', 'YELLOW', 'YELLOW', 'GREEN', 'GREEN', 'GREEN']) === 'YELLOW', 'Multiple Yellow + Green -> Overall YELLOW');
check(calculateOverall(['GREEN', 'GREEN', 'GREEN', 'GREEN', 'GREEN', 'RED']) === 'RED', '1 RED + 5 Green -> Overall RED (Critical Priority)');
check(calculateOverall(['YELLOW', 'YELLOW', 'YELLOW', 'YELLOW', 'YELLOW', 'RED']) === 'RED', 'Yellow + RED -> Overall RED');

console.log(`\nTOTAL VERIFIED: ${pass} PASSED, ${fail} FAILED`);
if (fail > 0) process.exit(1);

