// API Service for NERVE Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Process patient data and get hospital referral
export const processReferral = async (patientData) => {
  const response = await fetch(`${API_BASE_URL}/referral`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformPatientData(patientData)),
  });

  if (!response.ok) {
    throw new Error('Failed to process referral');
  }

  const result = await response.json();
  return transformVerdictResponse(result.data, patientData);
};

// Quick referral without saving to database
export const quickReferral = async (patientData) => {
  const response = await fetch(`${API_BASE_URL}/referral/quick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformPatientData(patientData)),
  });

  if (!response.ok) {
    throw new Error('Failed to process quick referral');
  }

  const result = await response.json();
  return transformVerdictResponse(result.data, patientData);
};

// Get all hospitals
export const getHospitals = async () => {
  const response = await fetch(`${API_BASE_URL}/hospitals`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch hospitals');
  }

  const result = await response.json();
  return result.data;
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};

// Transform frontend patient data to backend format
const transformPatientData = (frontendData) => {
  // Parse blood pressure (e.g., "150/95" -> { systolic: 150, diastolic: 95 })
  const bpParts = frontendData.bloodPressure?.split('/') || [];
  
  return {
    name: frontendData.name,
    age: parseInt(frontendData.age),
    gender: frontendData.gender || 'other',
    chiefComplaint: frontendData.chiefComplaint,
    symptoms: frontendData.symptoms || extractSymptoms(frontendData.chiefComplaint),
    vitals: {
      heartRate: parseInt(frontendData.heartRate),
      bloodPressure: {
        systolic: parseInt(bpParts[0]) || 120,
        diastolic: parseInt(bpParts[1]) || 80
      },
      temperature: frontendData.temperature || 98.6,
      oxygenSaturation: parseInt(frontendData.spO2),
      respiratoryRate: frontendData.respiratoryRate || 16
    },
    medicalHistory: frontendData.medicalHistory || '',
    allergies: frontendData.allergies || [],
    currentMedications: frontendData.currentMedications || []
  };
};

// Extract symptoms from chief complaint
const extractSymptoms = (complaint) => {
  if (!complaint) return [];
  return complaint.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// Transform backend response to frontend verdict format
const transformVerdictResponse = (backendData, originalPatient) => {
  const triage = backendData.triage || {};
  const hospital = backendData.recommendedHospital || {};
  const alternatives = backendData.alternativeHospitals || [];

  // Map severity to urgency
  const severityToUrgency = {
    'critical': 'CRITICAL',
    'urgent': 'HIGH',
    'moderate': 'MODERATE',
    'minor': 'LOW'
  };

  const urgency = severityToUrgency[triage.severity?.toLowerCase()] || 'MODERATE';

  // Build reasoning text in the expected format
  const reasoning = buildReasoningText(originalPatient, triage, hospital, alternatives, backendData);

  return {
    hospital: hospital.hospitalName || 'Unknown Hospital',
    hospitalId: hospital.hospitalId,
    route: 'Optimal Route', // Can be enhanced with routing API
    urgency,
    reasoning,
    eta: `${hospital.estimatedWaitTime || 15} min`,
    timestamp: new Date().toLocaleTimeString(),
    matchScore: hospital.matchScore,
    urgentTransfer: backendData.urgentTransfer,
    additionalNotes: backendData.additionalNotes,
    alternativeHospitals: alternatives
  };
};

// Build formatted reasoning text
const buildReasoningText = (patient, triage, hospital, alternatives, fullData) => {
  const hospitalReasons = hospital.reasons?.join('\n│  ├─ ') || 'Best match for patient condition';
  const altList = alternatives.slice(0, 2).map(alt => 
    `│  └─ ${alt.hospitalName}: Score ${alt.matchScore}% - ${alt.reason}`
  ).join('\n');

  return `ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT: ${patient.name}, ${patient.age}y/o
VITALS: HR ${patient.heartRate} bpm | SpO2 ${patient.spO2}% | BP ${patient.bloodPressure}
PRESENTATION: ${patient.chiefComplaint}

DECISION LOGIC:
├─ Severity Assessment: ${triage.severity?.toUpperCase() || 'EVALUATING'}
├─ Required Specializations: ${triage.requiredSpecializations?.join(', ') || 'General Care'}
│
├─ HOSPITAL SELECTION:
│  ├─ ${hospital.hospitalName}: ✓ RECOMMENDED
│  ├─ ${hospitalReasons}
│  ├─ Match Score: ${hospital.matchScore || 'N/A'}%
${altList ? altList + '\n' : ''}│
├─ AI REASONING:
│  └─ ${triage.reasoning || 'Analysis complete'}
│
└─ VERDICT: Route to ${hospital.hospitalName}

${fullData.additionalNotes ? `NOTE: ${fullData.additionalNotes}` : ''}${fullData.urgentTransfer ? '\n⚠️ URGENT TRANSFER REQUIRED' : ''}`;
};

export default {
  processReferral,
  quickReferral,
  getHospitals,
  healthCheck
};
