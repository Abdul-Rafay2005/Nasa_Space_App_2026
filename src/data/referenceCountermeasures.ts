/**
 * Aegis Health — Reference Countermeasures & Medication Protocols
 * Prepared for the NASA Space Apps 2026 Team (14 November 2026)
 * Source: NASA Human Research Program (HRP), NASA-STD-3001, and ISS Medical Checklist
 * 
 * DISCLAIMER: Reference countermeasures, not prescriptions. Drug choice and dosing
 * depend on the individual and must be decided by the flight surgeon.
 */

export interface CountermeasureEntry {
  parameter: string;
  normalRange: string;
  condition: string;
  countermeasures: string;
  medications: string[];
  notes: string;
  category: 'cardiovascular' | 'metabolic' | 'thermoregulation' | 'sleep' | 'behavioral' | 'environmental' | 'radiation';
}

export const REFERENCE_COUNTERMEASURES: CountermeasureEntry[] = [
  {
    parameter: 'Blood pressure',
    normalRange: '111–119 / 60–79 mmHg',
    condition: 'High blood pressure (Hypertension)',
    countermeasures: 'ACE inhibitors (e.g. lisinopril), ARBs (e.g. losartan), calcium channel blockers (e.g. amlodipine)',
    medications: ['Lisinopril (ACE inhibitor)', 'Losartan (ARB)', 'Amlodipine (Calcium channel blocker)'],
    notes: 'Treatment depends on direction. High readings are managed with long-term cardiovascular medication under flight surgeon review.',
    category: 'cardiovascular',
  },
  {
    parameter: 'Blood pressure',
    normalRange: '111–119 / 60–79 mmHg',
    condition: 'Low blood pressure (Hypotension / Orthostatic intolerance)',
    countermeasures: 'Oral or IV fluid loading first; midodrine for persistent cases',
    medications: ['Oral electrolyte fluids', 'IV normal saline', 'Midodrine (for refractory orthostatic hypotension)'],
    notes: 'In microgravity, fluid volume contracts ~10-15%. Low readings start with rehydration/salt tablets and move to midodrine only if persistent.',
    category: 'cardiovascular',
  },
  {
    parameter: 'Blood sugar',
    normalRange: '70–99 mg/dL',
    condition: 'Low blood sugar (Hypoglycemia <70 mg/dL)',
    countermeasures: 'Fast-acting glucose tablets or gel; glucagon if the astronaut is unresponsive or cannot swallow safely',
    medications: ['Glucose tablets / oral gel (15-20g fast-acting)', 'Glucagon (IM/autoinjector for unresponsive astronaut)'],
    notes: 'Hypoglycemia is an acute emergency. Administer fast-acting carbohydrates immediately; use glucagon if consciousness is impaired.',
    category: 'metabolic',
  },
  {
    parameter: 'Blood sugar',
    normalRange: '70–99 mg/dL',
    condition: 'High blood sugar (Hyperglycemia >100-125 mg/dL)',
    countermeasures: 'Metformin or insulin, depending on severity and ketosis screening',
    medications: ['Metformin (oral)', 'Subcutaneous Insulin (regular/rapid-acting depending on severity)'],
    notes: 'Hyperglycemia in spaceflight is managed with oral antidiabetics (metformin) or insulin according to severity and hydration status.',
    category: 'metabolic',
  },
  {
    parameter: 'Core body temperature',
    normalRange: '36.1–38.0 °C',
    condition: 'High temperature (Space Fever / Hyperthermia >38.0 °C)',
    countermeasures: 'Acetaminophen or ibuprofen, physical cooling, oral/IV hydration',
    medications: ['Acetaminophen (Paracetamol)', 'Ibuprofen (NSAID antipyretic)', 'Electrolyte hydration'],
    notes: 'Fever in spaceflight is treated with antipyretics plus cabin cooling and hydration. Microgravity impairs radiative convective cooling.',
    category: 'thermoregulation',
  },
  {
    parameter: 'Core body temperature',
    normalRange: '36.1–38.0 °C',
    condition: 'Low temperature (Hypothermia <35.5 °C)',
    countermeasures: 'Passive and active rewarming; no medication treats hypothermia directly',
    medications: ['None — physical thermal management only'],
    notes: 'Hypothermia is treated by passive and active rewarming (insulating blankets, warm oral fluids, thermal cabin adjustment). No drug treats it directly.',
    category: 'thermoregulation',
  },
  {
    parameter: 'Sleep duration',
    normalRange: '7–10 hours',
    condition: 'Poor or short sleep (Insomnia / Circadian disruption <7 hours)',
    countermeasures: 'Melatonin first-line; short-acting sleep aids (e.g. zolpidem, temazepam) for short-term use only',
    medications: ['Melatonin (first-line circadian regulator)', 'Zolpidem (Ambien, short-term only)', 'Temazepam (short-term only)'],
    notes: 'Melatonin is the usual first step. Prescription sleep medications appear in ISS medical kits but are restricted to short-term acute use.',
    category: 'sleep',
  },
  {
    parameter: 'Psychological morale / mood',
    normalRange: 'Optimal, energized, nominal',
    condition: 'Fatigue, high stress, low mood / disorientation',
    countermeasures: 'Counseling and schedule adjustment; anxiolytics or SSRIs for clinical cases under physician oversight',
    medications: ['Anxiolytics (acute clinical use)', 'SSRIs (physician-guided long-term oversight)'],
    notes: 'Support is primarily behavioral: workload reduction, schedule restructuring, Earth family teleconferences. Medications reserved for diagnosed clinical cases.',
    category: 'behavioral',
  },
  {
    parameter: 'Cabin CO₂',
    normalRange: '≤ 3.0 mmHg (NASA-STD-3001)',
    condition: 'Elevated CO₂ (3.1–4.5 mmHg, hypercapnic headaches)',
    countermeasures: 'Environmental fix: CDRA scrubber maintenance and cabin ventilation; acetaminophen or ibuprofen treats only the headache',
    medications: ['Acetaminophen (for headache relief only)', 'Ibuprofen (symptom relief only)'],
    notes: 'This is an environmental life-support problem, not a pharmaceutical problem. Repair CDRA scrubbers and increase airflow. Drugs treat symptoms only as a stopgap.',
    category: 'environmental',
  },
  {
    parameter: 'Career space radiation',
    normalRange: '< 300 mSv',
    condition: '300–599 mSv, approaching lifetime limit / Solar Particle Events',
    countermeasures: 'Shielding and solar storm shelter are the real countermeasures; ondansetron for radiation-related nausea; radioprotectors (e.g. amifostine) are experimental',
    medications: ['Ondansetron (antiemetic for acute radiation sickness / nausea)', 'Amifostine (experimental radioprotector)'],
    notes: 'No drug prevents radiation exposure. Relocate crew to the heavily shielded habitat core / water wall during solar particle events. Ondansetron manages acute radiation sickness nausea.',
    category: 'radiation',
  },
];
