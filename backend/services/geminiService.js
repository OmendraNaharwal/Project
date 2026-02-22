import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const USE_MOCK = process.env.USE_MOCK === 'true';

// Mock response generator for testing without API key
const generateMockResponse = (patientData, hospitals) => {
  const isCardiac = patientData.chiefComplaint?.toLowerCase().includes('chest') ||
                    patientData.chiefComplaint?.toLowerCase().includes('heart') ||
                    patientData.vitals?.heartRate > 100;
  
  const isTrauma = patientData.chiefComplaint?.toLowerCase().includes('accident') ||
                   patientData.chiefComplaint?.toLowerCase().includes('injury');

  let severity = 'moderate';
  let requiredSpecs = ['general-surgery'];
  
  
  if (isCardiac) {
    severity = 'critical';
    requiredSpecs = ['cardiology', 'emergency-medicine'];
  } else if (isTrauma) {
    severity = 'urgent';
    requiredSpecs = ['trauma', 'orthopedics'];
  }

  // Find best matching hospital
  const scoredHospitals = hospitals.map(h => {
    let score = 50;
    if (h.currentStatus?.emergencyAvailable) score += 20;
    if (h.specializations?.some(s => requiredSpecs.includes(s))) score += 25;
    if (h.currentStatus?.waitTime < 20) score += 10;
    if (h.staff?.doctors?.available > 10) score += 5;
    return { hospital: h, score: Math.min(score, 100) };
  }).sort((a, b) => b.score - a.score);

  const best = scoredHospitals[0];
  const alternatives = scoredHospitals.slice(1, 3);

  return {
    triage: {
      severity,
      requiredSpecializations: requiredSpecs,
      requiredFacilities: isCardiac ? ['icu', 'emergencyServices'] : ['generalBeds'],
      reasoning: `Patient presents with ${patientData.chiefComplaint}. Based on vitals (HR: ${patientData.vitals?.heartRate}, SpO2: ${patientData.vitals?.oxygenSaturation}%) and symptom analysis, condition is classified as ${severity.toUpperCase()}. ${isCardiac ? 'Cardiac involvement suspected - immediate cardiology consultation recommended.' : 'Standard evaluation protocol applies.'}`
    },
    recommendedHospital: {
      hospitalId: best.hospital._id.toString(),
      hospitalName: best.hospital.name,
      city: best.hospital.address?.city || '',
      state: best.hospital.address?.state || '',
      matchScore: best.score,
      reasons: [
        `${best.hospital.specializations?.length || 0} relevant specializations available`,
        `Wait time: ${best.hospital.currentStatus?.waitTime || 'N/A'} minutes`,
        `${best.hospital.staff?.doctors?.available || 0} doctors available`
      ],
      estimatedWaitTime: best.hospital.currentStatus?.waitTime || 15,
      specializations: best.hospital.specializations || [],
      rating: best.hospital.rating || 4.0
    },
    alternativeHospitals: alternatives.map(alt => ({
      hospitalId: alt.hospital._id.toString(),
      hospitalName: alt.hospital.name,
      city: alt.hospital.address?.city || '',
      state: alt.hospital.address?.state || '',
      matchScore: alt.score,
      reason: `Alternative facility with ${alt.hospital.facilities?.icuBeds || 0} ICU beds`,
      specializations: alt.hospital.specializations || [],
      rating: alt.hospital.rating || 4.0
    })),
    urgentTransfer: severity === 'critical',
    additionalNotes: severity === 'critical' ? 'Immediate transfer recommended. Alert receiving facility.' : ''
  };
};

const TRIAGE_PROMPT = `You are NERVE (Neural Emergency Response & Verdict Engine), an advanced AI medical triage assistant. 
Analyze the patient data provided and return a JSON response with the following structure:

{
  "severity": "critical" | "urgent" | "moderate" | "minor",
  "recommendation": "Brief action recommendation",
  "reasoning": "Detailed medical reasoning for the triage decision",
  "estimatedWaitTime": number (in minutes),
  "alertFlags": ["array of critical concerns if any"]
}

Severity Guidelines:
- CRITICAL: Life-threatening conditions requiring immediate intervention (cardiac arrest, severe trauma, stroke, etc.)
- URGENT: Serious conditions requiring prompt attention within 15-30 minutes
- MODERATE: Conditions that are stable but need medical evaluation within 1-2 hours
- MINOR: Non-urgent conditions that can wait for standard care

Always prioritize patient safety. If in doubt, err on the side of higher severity.`;

export const analyzePatient = async (patientData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${TRIAGE_PROMPT}

Patient Data:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Chief Complaint: ${patientData.chiefComplaint}
- Symptoms: ${patientData.symptoms?.join(', ') || 'None reported'}
- Vitals:
  * Heart Rate: ${patientData.vitals?.heartRate || 'N/A'} bpm
  * Blood Pressure: ${patientData.vitals?.bloodPressure?.systolic || 'N/A'}/${patientData.vitals?.bloodPressure?.diastolic || 'N/A'} mmHg
  * Temperature: ${patientData.vitals?.temperature || 'N/A'}°F
  * Oxygen Saturation: ${patientData.vitals?.oxygenSaturation || 'N/A'}%
  * Respiratory Rate: ${patientData.vitals?.respiratoryRate || 'N/A'} breaths/min
- Medical History: ${patientData.medicalHistory || 'None reported'}
- Allergies: ${patientData.allergies?.join(', ') || 'None reported'}
- Current Medications: ${patientData.currentMedications?.join(', ') || 'None reported'}

Analyze this patient and provide your triage assessment in JSON format only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const analyzeTelemetry = async (telemetryData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are NERVE analyzing real-time patient telemetry data. 
Provide a brief status assessment in JSON format:

{
  "status": "stable" | "warning" | "critical",
  "alerts": ["array of any concerning trends"],
  "summary": "Brief one-line status summary"
}

Telemetry Data:
${JSON.stringify(telemetryData, null, 2)}

Respond with JSON only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse telemetry analysis');
  } catch (error) {
    console.error('Telemetry Analysis Error:', error);
    throw error;
  }
};

// Hospital Referral Prompt
const HOSPITAL_REFERRAL_PROMPT = `You are NERVE (Neural Emergency Response & Verdict Engine), an advanced AI medical triage and hospital referral assistant.

Based on the patient's condition and available hospitals, determine the BEST hospital for patient referral.

Consider these factors when ranking hospitals:
1. MEDICAL MATCH: Does the hospital have the required specialization/facilities for this condition?
2. AVAILABILITY: Is the hospital accepting patients? Are doctors/nurses available?
3. CAPACITY: ICU beds, ventilators, operation theaters if needed
4. EMERGENCY: For critical patients, prioritize hospitals with emergency services
5. WAIT TIME: Lower wait time is better, especially for urgent cases
6. OCCUPANCY: Lower occupancy rate means better attention

Return a JSON response with this structure:
{
  "triage": {
    "severity": "critical" | "urgent" | "moderate" | "minor",
    "requiredSpecializations": ["list of needed specializations"],
    "requiredFacilities": ["list of required facilities"],
    "reasoning": "Medical reasoning for triage decision"
  },
  "recommendedHospital": {
    "hospitalId": "ID of the best hospital",
    "hospitalName": "Name of hospital",
    "matchScore": number (0-100),
    "reasons": ["why this hospital is best"],
    "estimatedWaitTime": number (in minutes)
  },
  "alternativeHospitals": [
    {
      "hospitalId": "ID",
      "hospitalName": "Name",
      "matchScore": number,
      "reason": "Why it's an alternative"
    }
  ],
  "urgentTransfer": boolean,
  "additionalNotes": "Any critical notes for transfer/care"
}`;

export const findBestHospital = async (patientData, hospitals) => {
  // Use mock mode if enabled or API key issues
  if (USE_MOCK) {
    console.log('Using mock mode for hospital referral');
    return generateMockResponse(patientData, hospitals);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format hospital data for the prompt
    const hospitalsSummary = hospitals.map(h => ({
      id: h._id.toString(),
      name: h.name,
      type: h.type,
      address: `${h.address?.city || 'Unknown'}, ${h.address?.state || ''}`,
      specializations: h.specializations,
      facilities: h.facilities,
      staff: {
        doctorsAvailable: h.staff?.doctors?.available || 0,
        nursesAvailable: h.staff?.nurses?.available || 0,
        specialists: h.staff?.specialists?.filter(s => s.available).map(s => s.specialization) || []
      },
      status: {
        accepting: h.currentStatus?.isAcceptingPatients,
        emergencyAvailable: h.currentStatus?.emergencyAvailable,
        waitTime: h.currentStatus?.waitTime || 0,
        occupancyRate: h.currentStatus?.occupancyRate || 0
      },
      rating: h.rating
    }));

    const prompt = `${HOSPITAL_REFERRAL_PROMPT}

=== PATIENT DATA ===
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Chief Complaint: ${patientData.chiefComplaint}
- Symptoms: ${patientData.symptoms?.join(', ') || 'None reported'}
- Vitals:
  * Heart Rate: ${patientData.vitals?.heartRate || 'N/A'} bpm
  * Blood Pressure: ${patientData.vitals?.bloodPressure?.systolic || 'N/A'}/${patientData.vitals?.bloodPressure?.diastolic || 'N/A'} mmHg
  * Temperature: ${patientData.vitals?.temperature || 'N/A'}°F
  * Oxygen Saturation: ${patientData.vitals?.oxygenSaturation || 'N/A'}%
  * Respiratory Rate: ${patientData.vitals?.respiratoryRate || 'N/A'} breaths/min
- Medical History: ${patientData.medicalHistory || 'None reported'}
- Allergies: ${patientData.allergies?.join(', ') || 'None reported'}
- Current Medications: ${patientData.currentMedications?.join(', ') || 'None reported'}

=== AVAILABLE HOSPITALS ===
${JSON.stringify(hospitalsSummary, null, 2)}

Analyze the patient condition and match with the best available hospital. Respond with JSON only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse hospital referral response');
  } catch (error) {
    console.error('Hospital Referral Error:', error.message);
    console.log('Falling back to mock mode...');
    return generateMockResponse(patientData, hospitals);
  }
};
