/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Automated Health Status Calculation & Verification Engine
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import { evaluateAllIndicators, calculateOverallHealth } from '../src/services/healthStatus.ts';
import { PROVISIONAL_DEMO_THRESHOLDS } from '../src/config/thresholds.ts';
import { SAMPLE_ASTRONAUT_PROFILE } from '../src/data/mockData.ts';
import { ParsedAssessmentValues } from '../src/types/health.ts';

console.log('===============================================================');
console.log('AEGIS HEALTH MONITORING — PHASE 1 AUTOMATED LOGIC VERIFICATION');
console.log('===============================================================');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failCount++;
  }
}

// 1. Nominal Green Test
console.log('\n--- 1. Testing Nominal Green Readings ---');
const nominalValues: ParsedAssessmentValues = {
  heartRate: 65,
  systolic: 118,
  diastolic: 76,
  bloodSugar: 90,
  bodyTemperature: 36.8,
  sleepDuration: 8.0,
  mood: 'good',
  notes: 'Nominal operational test',
};
const evalNominal = evaluateAllIndicators(nominalValues, SAMPLE_ASTRONAUT_PROFILE);
const overallNominal = calculateOverallHealth(evalNominal);

assert(evalNominal.heartRate.status === 'GREEN', 'Heart rate 65 BPM is GREEN');
assert(evalNominal.bloodPressure.status === 'GREEN', 'Blood pressure 118/76 mmHg is GREEN');
assert(evalNominal.bloodSugar.status === 'GREEN', 'Blood sugar 90 mg/dL is GREEN');
assert(evalNominal.bodyTemperature.status === 'GREEN', 'Body temp 36.8 °C is GREEN');
assert(evalNominal.sleepDuration.status === 'GREEN', 'Sleep 8.0 hrs is GREEN');
assert(evalNominal.mood.status === 'GREEN', 'Mood good is GREEN');
assert(overallNominal.status === 'GREEN', 'Overall health status is GREEN when all indicators are nominal');
assert(overallNominal.urgentCount === 0 && overallNominal.warningCount === 0, 'Zero urgent and zero warning counts');

// 2. Warning Yellow Test
console.log('\n--- 2. Testing Warning Yellow Departures ---');
const warningValues: ParsedAssessmentValues = {
  heartRate: 95, // High yellow (91-110)
  systolic: 130, // High yellow (126-140)
  diastolic: 78,
  bloodSugar: 125, // High yellow (116-140)
  bodyTemperature: 37.5, // High yellow (37.4-38.0)
  sleepDuration: 6.0, // Low yellow (5.5-6.9)
  mood: 'fatigued', // Yellow
};
const evalWarning = evaluateAllIndicators(warningValues, SAMPLE_ASTRONAUT_PROFILE);
const overallWarning = calculateOverallHealth(evalWarning);

assert(evalWarning.heartRate.status === 'YELLOW', 'Heart rate 95 BPM is YELLOW');
assert(evalWarning.bloodPressure.status === 'YELLOW', 'Blood pressure 130/78 mmHg is YELLOW');
assert(evalWarning.bloodSugar.status === 'YELLOW', 'Blood sugar 125 mg/dL is YELLOW');
assert(evalWarning.bodyTemperature.status === 'YELLOW', 'Body temp 37.5 °C is YELLOW');
assert(evalWarning.sleepDuration.status === 'YELLOW', 'Sleep duration 6.0 hrs is YELLOW');
assert(evalWarning.mood.status === 'YELLOW', 'Mood fatigued is YELLOW');
assert(overallWarning.status === 'YELLOW', 'Overall health status is YELLOW when warnings present with no critical');

// 3. Urgent Red Critical Test
console.log('\n--- 3. Testing Critical Urgent Red Departures ---');
const redValues: ParsedAssessmentValues = {
  heartRate: 125, // Critical tachycardia (> 111)
  systolic: 155, // Critical hypertension (> 141)
  diastolic: 98,
  bloodSugar: 160, // Critical hyperglycemia (> 141)
  bodyTemperature: 38.6, // Critical pyrexia (> 38.1)
  sleepDuration: 4.0, // Critical sleep restriction (<= 5.4)
  mood: 'disoriented', // Critical RED
};
const evalRed = evaluateAllIndicators(redValues, SAMPLE_ASTRONAUT_PROFILE);
const overallRed = calculateOverallHealth(evalRed);

assert(evalRed.heartRate.status === 'RED', 'Heart rate 125 BPM is RED (Critical Tachycardia)');
assert(evalRed.bloodPressure.status === 'RED', 'Blood pressure 155/98 mmHg is RED (Critical Hypertension)');
assert(evalRed.bloodSugar.status === 'RED', 'Blood sugar 160 mg/dL is RED (Critical Hyperglycemia)');
assert(evalRed.bodyTemperature.status === 'RED', 'Body temp 38.6 °C is RED (Pyrexia)');
assert(evalRed.sleepDuration.status === 'RED', 'Sleep 4.0 hrs is RED (Severe Sleep Restriction)');
assert(evalRed.mood.status === 'RED', 'Mood disoriented is RED (Vestibular/SAS Crisis)');
assert(overallRed.status === 'RED', 'Overall health status is RED when any critical indicator is present');
assert(overallRed.urgentCount === 6, 'All 6 indicators counted as urgent');

// 4. Mixed Triage Test (1 RED + 5 GREEN -> Overall MUST BE RED)
console.log('\n--- 4. Testing Strict Medical Triage Priority (1 RED trumps 5 GREEN) ---');
const mixedValues: ParsedAssessmentValues = {
  heartRate: 40, // RED bradycardia
  systolic: 118, // GREEN
  diastolic: 76,  // GREEN
  bloodSugar: 90, // GREEN
  bodyTemperature: 36.8, // GREEN
  sleepDuration: 8.0, // GREEN
  mood: 'good', // GREEN
};
const evalMixed = evaluateAllIndicators(mixedValues, SAMPLE_ASTRONAUT_PROFILE);
const overallMixed = calculateOverallHealth(evalMixed);

assert(evalMixed.heartRate.status === 'RED', 'Isolated bradycardia 40 BPM is RED');
assert(overallMixed.status === 'RED', 'Overall triage correctly flags RED if even ONE vital is critical');
assert(overallMixed.urgentCount === 1, 'Urgent count is 1');
assert(overallMixed.normalCount === 5, 'Normal count is 5');

// 5. Threshold Configuration Integrity Test
console.log('\n--- 5. Testing Threshold Separation for Eman ---');
assert(PROVISIONAL_DEMO_THRESHOLDS.isDemonstrationPrototype === true, 'Thresholds clearly flag prototype demo status');
assert(typeof PROVISIONAL_DEMO_THRESHOLDS.heartRate.green.min === 'number', 'Heart rate min boundary is numeric');
assert(PROVISIONAL_DEMO_THRESHOLDS.curator.includes('Eman'), 'Curator documentation includes Eman');

console.log('===============================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('===============================================================');

if (failCount > 0) {
  process.exit(1);
}

