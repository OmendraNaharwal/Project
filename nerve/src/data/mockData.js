// Mock data for NERVE Medical Referral Command Center

export const mockHospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    distance: '12 km',
    beds: { icu: 3, general: 45 },
    specialists: ['Cardiologist', 'Neurologist', 'Trauma Surgeon'],
    status: 'available',
    waitTime: 15
  },
  {
    id: 2,
    name: "St. Mary's Medical",
    distance: '8 km',
    beds: { icu: 0, general: 28 },
    specialists: ['General Physician', 'Pediatrician'],
    status: 'limited',
    waitTime: 45
  },
  {
    id: 3,
    name: 'Regional Trauma Center',
    distance: '25 km',
    beds: { icu: 7, general: 120 },
    specialists: ['Trauma Surgeon', 'Neurosurgeon', 'Burns Specialist', 'Orthopedic'],
    status: 'available',
    waitTime: 8
  },
  {
    id: 4,
    name: 'Valley Community Clinic',
    distance: '3 km',
    beds: { icu: 0, general: 6 },
    specialists: ['General Physician'],
    status: 'full',
    waitTime: null
  }
];

export const mockInfrastructure = [
  {
    id: 1,
    route: 'Highway 101 North',
    status: 'clear',
    details: 'Light traffic, good conditions',
    eta: '12 min'
  },
  {
    id: 2,
    route: 'River Bridge Crossing',
    status: 'blocked',
    details: 'Flooded - Water level critical',
    eta: null
  },
  {
    id: 3,
    route: 'Main Street Downtown',
    status: 'clear',
    details: 'Normal traffic flow',
    eta: '18 min'
  },
  {
    id: 4,
    route: 'Mountain Pass Road',
    status: 'delayed',
    details: 'Construction zone active',
    eta: '35 min'
  },
  {
    id: 5,
    route: 'Interstate 45 Express',
    status: 'clear',
    details: 'Highway clear, moderate traffic',
    eta: '22 min'
  }
];

export const mockPatient = {
  name: 'John Doe',
  age: 58,
  heartRate: 112,
  spO2: 94,
  bloodPressure: '150/95',
  chiefComplaint: 'Severe chest pain radiating to left arm, shortness of breath, sweating',
  reportedSeverity: 'severe'
};

export const generateAIVerdict = (patient) => {
  const isCardiac = patient.chiefComplaint.toLowerCase().includes('chest') ||
                    patient.chiefComplaint.toLowerCase().includes('heart') ||
                    patient.heartRate > 100;
  
  const isTrauma = patient.chiefComplaint.toLowerCase().includes('accident') ||
                   patient.chiefComplaint.toLowerCase().includes('injury') ||
                   patient.chiefComplaint.toLowerCase().includes('trauma');

  const isNeuro = patient.chiefComplaint.toLowerCase().includes('stroke') ||
                  patient.chiefComplaint.toLowerCase().includes('headache') ||
                  patient.chiefComplaint.toLowerCase().includes('seizure');

  let hospital, reasoning, route, urgency;

  if (isCardiac) {
    hospital = 'City General Hospital';
    route = 'Highway 101 North';
    urgency = 'CRITICAL';
    reasoning = `ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${patient.name}, ${patient.age}y/o
VITALS: HR ${patient.heartRate} bpm | SpO2 ${patient.spO2}% | BP ${patient.bloodPressure}
PRESENTATION: ${patient.chiefComplaint}

DECISION LOGIC:
├─ Symptom pattern matches: CARDIAC EVENT (high confidence)
├─ Elevated HR (${patient.heartRate} bpm) supports cardiac distress
├─ SpO2 at ${patient.spO2}% indicates respiratory compromise
│
├─ HOSPITAL SELECTION:
│  ├─ City General: ✓ Active Cardiologist on-call
│  ├─ City General: ✓ Cath lab available
│  ├─ City General: ✓ 3 ICU beds free
│  └─ St. Mary's: ✗ No ICU capacity
│
├─ ROUTE ANALYSIS:
│  ├─ River Bridge: ✗ BLOCKED (flooding)
│  ├─ Highway 101: ✓ CLEAR - ETA 12 min
│  └─ Selected: Highway 101 North
│
└─ VERDICT: Route to City General via Highway 101

NOTE: River Bridge route rejected due to active flood warning.
Door-to-balloon time critical for suspected STEMI.`;
  } else if (isTrauma) {
    hospital = 'Regional Trauma Center';
    route = 'Interstate 45 Express';
    urgency = 'CRITICAL';
    reasoning = `ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${patient.name}, ${patient.age}y/o
VITALS: HR ${patient.heartRate} bpm | SpO2 ${patient.spO2}% | BP ${patient.bloodPressure}
PRESENTATION: ${patient.chiefComplaint}

DECISION LOGIC:
├─ Symptom pattern matches: TRAUMA CASE
├─ Requires Level I trauma center capabilities
│
├─ HOSPITAL SELECTION:
│  ├─ Regional Trauma: ✓ Level I Trauma Center
│  ├─ Regional Trauma: ✓ Trauma Surgeon on-call
│  ├─ Regional Trauma: ✓ 7 ICU beds available
│  ├─ City General: ✗ Not a designated trauma center
│  └─ St. Mary's: ✗ No surgical capabilities
│
├─ ROUTE ANALYSIS:
│  ├─ River Bridge: ✗ BLOCKED (flooding)
│  ├─ Interstate 45: ✓ CLEAR - ETA 22 min
│  └─ Selected: Interstate 45 Express
│
└─ VERDICT: Route to Regional Trauma via I-45

NOTE: Distance justified by specialized trauma capabilities.`;
  } else if (isNeuro) {
    hospital = 'City General Hospital';
    route = 'Main Street Downtown';
    urgency = 'HIGH';
    reasoning = `ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${patient.name}, ${patient.age}y/o
VITALS: HR ${patient.heartRate} bpm | SpO2 ${patient.spO2}% | BP ${patient.bloodPressure}
PRESENTATION: ${patient.chiefComplaint}

DECISION LOGIC:
├─ Symptom pattern matches: NEUROLOGICAL EVENT
├─ Time-sensitive: potential stroke protocol required
│
├─ HOSPITAL SELECTION:
│  ├─ City General: ✓ Active Neurologist on-call
│  ├─ City General: ✓ CT/MRI available 24/7
│  ├─ City General: ✓ Stroke unit certified
│  └─ Regional: ✗ Longer transport, no time advantage
│
├─ ROUTE ANALYSIS:
│  ├─ River Bridge: ✗ BLOCKED (flooding)
│  ├─ Main Street: ✓ CLEAR - ETA 18 min
│  └─ Selected: Main Street Downtown
│
└─ VERDICT: Route to City General via Main Street

NOTE: Stroke window critical - selected fastest clear route.`;
  } else {
    hospital = "St. Mary's Medical";
    route = 'Main Street Downtown';
    urgency = 'MODERATE';
    reasoning = `ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${patient.name}, ${patient.age}y/o
VITALS: HR ${patient.heartRate} bpm | SpO2 ${patient.spO2}% | BP ${patient.bloodPressure}
PRESENTATION: ${patient.chiefComplaint}

DECISION LOGIC:
├─ Symptom pattern: GENERAL ASSESSMENT REQUIRED
├─ Vitals within acceptable transport range
│
├─ HOSPITAL SELECTION:
│  ├─ St. Mary's: ✓ Closest facility with capacity
│  ├─ St. Mary's: ✓ General physician available
│  ├─ St. Mary's: ✓ 28 beds available
│  └─ Valley Clinic: ✗ At full capacity
│
├─ ROUTE ANALYSIS:
│  ├─ River Bridge: ✗ BLOCKED (flooding)
│  ├─ Main Street: ✓ CLEAR - ETA 18 min
│  └─ Selected: Main Street Downtown
│
└─ VERDICT: Route to St. Mary's via Main Street

NOTE: Standard referral - no critical specialization required.`;
  }

  return {
    hospital,
    route,
    urgency,
    reasoning,
    eta: route === 'Highway 101 North' ? '12 min' : route === 'Interstate 45 Express' ? '22 min' : '18 min',
    timestamp: new Date().toLocaleTimeString()
  };
};
