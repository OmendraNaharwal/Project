import Groq from 'groq-sdk';
import { getEmergencyDistanceScore } from './hereService.js';

// Lazy initialization - will be set when first API call is made
let groq = null;

const getGroqClient = () => {
  if (!groq && process.env.GROQ_API_KEY) {
    console.log('✓ Initializing Groq AI with API key');
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
};

const MODEL = 'llama-3.3-70b-versatile'; // Fast and capable model

// Condition detection patterns
const CONDITIONS = {
  cardiac: {
    keywords: ['chest pain', 'heart', 'cardiac', 'palpitation', 'angina', 'myocardial'],
    specializations: ['cardiology'],  // Simplified - cardiac hospitals are best
    facilities: ['icu', 'emergencyServices'],
    baseSeverity: 'critical'
  },
  neurological: {
    keywords: ['head', 'headache', 'stroke', 'seizure', 'dizzy', 'vision', 'numbness', 'paralysis', 'confusion', 'migraine'],
    specializations: ['neurology'],  // Simplified
    facilities: ['icu', 'ctScanner', 'mriScanner'],
    baseSeverity: 'urgent'
  },
  trauma: {
    keywords: ['accident', 'injury', 'fall', 'fracture', 'broken', 'bleeding', 'wound', 'cut'],
    specializations: ['trauma', 'orthopedics'],  // Simplified
    facilities: ['operationTheaters', 'emergencyServices'],
    baseSeverity: 'urgent'
  },
  respiratory: {
    keywords: ['breathing', 'breath', 'asthma', 'cough', 'lung', 'pneumonia', 'wheezing'],
    specializations: ['pulmonology', 'emergency-medicine'],
    facilities: ['icu', 'ventilators'],
    baseSeverity: 'urgent'
  },
  gastrointestinal: {
    keywords: ['stomach', 'abdomen', 'abdominal', 'vomit', 'diarrhea', 'nausea', 'appendix'],
    specializations: ['gastroenterology', 'general-surgery'],
    facilities: ['generalBeds', 'operationTheaters'],
    baseSeverity: 'moderate'
  },
  pediatric: {
    keywords: ['child', 'infant', 'baby', 'pediatric'],
    specializations: ['pediatrics'],
    facilities: ['generalBeds'],
    baseSeverity: 'moderate'
  }
};

// Mock response generator for fallback
const generateMockResponse = (patientData, hospitals) => {
  // Extract patient info - check both field names
  const complaint = (patientData.chiefComplaint || patientData.complaint || '').toLowerCase();
  const symptomsText = (patientData.symptoms || []).join(' ').toLowerCase();
  const searchText = `${complaint} ${symptomsText}`;
  const age = patientData.age || 30;
  const hr = patientData.vitals?.heartRate || 80;
  const spo2 = patientData.vitals?.oxygenSaturation || 98;
  const reportedSeverity = patientData.reportedSeverity || 'moderate';
  
  // Detect condition based on keywords in BOTH complaint and symptoms
  let detectedCondition = null;
  for (const [conditionName, config] of Object.entries(CONDITIONS)) {
    if (config.keywords.some(keyword => searchText.includes(keyword))) {
      detectedCondition = { name: conditionName, ...config };
      break;
    }
  }
  
  // Default to general if no specific condition detected
  if (!detectedCondition) {
    detectedCondition = {
      name: 'general',
      specializations: ['general-surgery', 'emergency-medicine'],
      facilities: ['generalBeds'],
      baseSeverity: 'moderate'
    };
  }
  
  // Adjust severity based on vitals AND reported severity
  let severity = detectedCondition.baseSeverity;
  let vitalAlerts = [];
  
  // Factor in patient-reported severity (escalate if patient reports higher)
  const severityLevels = { 'mild': 0, 'minor': 0, 'moderate': 1, 'urgent': 2, 'severe': 2, 'critical': 3 };
  const severityNames = ['minor', 'moderate', 'urgent', 'critical'];
  
  // If patient reports higher severity, consider escalating
  if (severityLevels[reportedSeverity] > severityLevels[severity]) {
    // Patient-reported severity influences final assessment
    // Critical reports always escalate, severe escalates moderate to urgent
    if (reportedSeverity === 'critical') {
      severity = 'critical';
      vitalAlerts.push('Patient reports critical condition');
    } else if (reportedSeverity === 'severe' && severity !== 'critical') {
      severity = 'urgent';
      vitalAlerts.push('Patient reports severe symptoms');
    }
  }
  
  if (hr > 120) {
    severity = 'critical';
    vitalAlerts.push('Tachycardia detected');
  } else if (hr > 100) {
    if (severity === 'moderate') severity = 'urgent';
    vitalAlerts.push('Elevated heart rate');
  } else if (hr < 50) {
    severity = 'critical';
    vitalAlerts.push('Bradycardia detected');
  }
  
  if (spo2 < 90) {
    severity = 'critical';
    vitalAlerts.push('Critical oxygen saturation');
  } else if (spo2 < 95) {
    if (severity === 'moderate') severity = 'urgent';
    vitalAlerts.push('Low oxygen saturation');
  }
  
  if (age > 65 || age < 5) {
    if (severity === 'moderate') severity = 'urgent';
    vitalAlerts.push('Age-related risk factor');
  }
  
  const requiredSpecs = detectedCondition.specializations;
  const primarySpec = requiredSpecs[0]; // Most important specialization

  // Score hospitals based on condition match
  const scoredHospitals = hospitals.map(h => {
    let score = 30;
    
    // Check specialization match
    const specMatches = requiredSpecs.filter(spec => 
      h.specializations?.includes(spec)
    ).length;
    score += specMatches * 12;
    
    // SPECIALIZATION FOCUS BONUS: Prefer specialized hospitals over general ones
    // Hospitals with fewer specializations that match are MORE specialized
    const totalSpecs = h.specializations?.length || 1;
    if (specMatches > 0 && totalSpecs <= 3) {
      // Highly specialized hospital matching our need - big bonus
      score += 25;
    } else if (specMatches > 0 && totalSpecs <= 5) {
      score += 10;
    }
    
    // PRIMARY SPECIALIZATION BONUS: If hospital's first/main spec matches our primary need
    if (h.specializations?.[0] === primarySpec) {
      score += 15;
    }
    
    // NAME-BASED MATCHING: Check if hospital name suggests specialization
    const hospitalNameLower = h.name?.toLowerCase() || '';
    if (detectedCondition.name === 'cardiac' && 
        (hospitalNameLower.includes('heart') || hospitalNameLower.includes('cardiac'))) {
      score += 20;
    }
    if (detectedCondition.name === 'pediatric' && 
        (hospitalNameLower.includes('child') || hospitalNameLower.includes('pediatric'))) {
      score += 20;
    }
    if (detectedCondition.name === 'trauma' && hospitalNameLower.includes('trauma')) {
      score += 20;
    }
    if (detectedCondition.name === 'neurological' && hospitalNameLower.includes('neuro')) {
      score += 20;
    }
    
    // Check facility match
    const facilityMatches = detectedCondition.facilities?.filter(fac => 
      h.facilities?.[fac] === true || h.facilities?.[fac] > 0
    ).length || 0;
    score += facilityMatches * 8;
    
    // Emergency availability bonus for critical cases
    if (h.currentStatus?.emergencyAvailable && severity === 'critical') {
      score += 10;
    }
    
    // Wait time scoring
    const waitTime = h.currentStatus?.waitTime || 30;
    if (waitTime <= 10) {
      score += 10;
    } else if (waitTime <= 20) {
      score += 5;
    } else if (waitTime > 40) {
      score -= 10;
    }
    
    // Staff availability bonus
    const availableDoctors = h.staff?.doctors?.available || 0;
    if (availableDoctors > 30) {
      score += 8;
    } else if (availableDoctors > 15) {
      score += 4;
    }
    
    // ICU availability for critical cases
    if (severity === 'critical' && h.facilities?.icuBeds > 10) {
      score += 10;
    }
    
    // Occupancy penalty
    const occupancy = h.currentStatus?.occupancyRate || 50;
    if (occupancy > 85) {
      score -= 15;
    } else if (occupancy > 70) {
      score -= 5;
    } else if (occupancy < 50) {
      score += 5;
    }
    
    // Rating bonus
    if (h.rating >= 4.5) {
      score += 5;
    }
    
    // Distance scoring - factor in route info if available
    const distanceScore = getEmergencyDistanceScore(h.routeInfo, severity);
    score += distanceScore;
    
    // Store raw score (uncapped) for proper sorting, then cap for display
    const rawScore = score;
    return { hospital: h, score: Math.min(Math.max(rawScore, 15), 100), rawScore, specMatches, totalSpecs, routeInfo: h.routeInfo };
  }).sort((a, b) => {
    // Primary sort: by raw score (higher is better)
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    // Tiebreaker: prefer more specialized (fewer total specializations)
    return a.totalSpecs - b.totalSpecs;
  });

  const best = scoredHospitals[0];
  const alternatives = scoredHospitals.slice(1, 3);
  
  // Use spec matches from scoring
  const bestSpecMatches = best.specMatches;

  // Build detailed reasoning
  const reasoningParts = [
    `Condition Analysis: ${detectedCondition.name.toUpperCase()} presentation identified`,
    `Patient (${patientData.name}, ${age}yo) presents with: "${complaint || symptomsText}"`,
    `Vital Signs Assessment: HR ${hr} bpm, SpO2 ${spo2}%, BP ${patientData.vitals?.bloodPressure?.systolic || 'N/A'}/${patientData.vitals?.bloodPressure?.diastolic || 'N/A'} mmHg`,
  ];
  
  if (vitalAlerts.length > 0) {
    reasoningParts.push(`Vital Alerts: ${vitalAlerts.join(', ')}`);
  }
  
  reasoningParts.push(
    `Required Specializations: ${requiredSpecs.join(', ')}`,
    `Severity Classification: ${severity.toUpperCase()}`,
    `Hospital Match: ${best.hospital.name} selected with ${best.score}% compatibility score based on ${bestSpecMatches} specialization matches and facility availability.`
  );

  // Build distance reason if available
  const distanceReason = best.routeInfo 
    ? `Distance: ${best.routeInfo.distance} km, ETA: ${best.routeInfo.emergencyDuration || best.routeInfo.duration} min`
    : null;

  return {
    triage: {
      severity,
      requiredSpecializations: requiredSpecs,
      requiredFacilities: detectedCondition.facilities,
      reasoning: reasoningParts.join('. ')
    },
    recommendedHospital: {
      hospitalId: best.hospital._id.toString(),
      hospitalName: best.hospital.name,
      matchScore: best.score,
      distance: best.routeInfo?.distance || null,
      eta: best.routeInfo?.emergencyDuration || best.routeInfo?.duration || null,
      routeInfo: best.routeInfo || null,
      reasons: [
        `Has ${requiredSpecs.filter(s => best.hospital.specializations?.includes(s)).join(', ') || 'general'} specialists`,
        `Wait time: ${best.hospital.currentStatus?.waitTime || 15} minutes`,
        `${best.hospital.staff?.doctors?.available || 0} doctors on duty`,
        `${best.hospital.facilities?.icuBeds || 0} ICU beds available`,
        ...(distanceReason ? [distanceReason] : [])
      ],
      estimatedWaitTime: best.hospital.currentStatus?.waitTime || 15
    },
    alternativeHospitals: alternatives.map(alt => ({
      hospitalId: alt.hospital._id.toString(),
      hospitalName: alt.hospital.name,
      matchScore: alt.score,
      distance: alt.routeInfo?.distance || null,
      eta: alt.routeInfo?.emergencyDuration || alt.routeInfo?.duration || null,
      reason: `${alt.hospital.specializations?.filter(s => requiredSpecs.includes(s)).length || 0} matching specializations, ${alt.hospital.facilities?.icuBeds || 0} ICU beds${alt.routeInfo ? `, ${alt.routeInfo.distance} km away` : ''}`
    })),
    urgentTransfer: severity === 'critical',
    additionalNotes: severity === 'critical' 
      ? `CRITICAL: ${vitalAlerts.join('. ')}. Immediate medical attention required.`
      : severity === 'urgent'
      ? `URGENT: Prompt evaluation needed. ${vitalAlerts.join('. ')}`
      : 'Standard evaluation recommended.'
  };
};

const HOSPITAL_REFERRAL_PROMPT = `You are NERVE (Neural Emergency Response & Verdict Engine), an advanced AI medical triage and hospital referral assistant.

Based on the patient's condition and available hospitals, determine the BEST hospital for patient referral.

Consider these factors when ranking hospitals:
1. MEDICAL MATCH: Does the hospital have the required specialization/facilities for this condition?
2. DISTANCE & ETA: For CRITICAL cases, closer hospitals with lower ETA are crucial - a few minutes can save a life. For moderate cases, distance is less critical if the hospital has better specialization.
3. AVAILABILITY: Is the hospital accepting patients? Are doctors/nurses available?
4. CAPACITY: ICU beds, ventilators, operation theaters if needed
5. EMERGENCY: For critical patients, prioritize hospitals with emergency services AND low ETA
6. WAIT TIME: Lower wait time is better, especially for urgent cases
7. OCCUPANCY: Lower occupancy rate means better attention

CRITICAL DECISION LOGIC FOR DISTANCE:
- If severity is CRITICAL and ETA > 15 min, consider closer alternatives even with slightly fewer specialized facilities
- If severity is URGENT and ETA > 20 min, factor distance more heavily
- For MODERATE cases, prioritize specialization over distance

Return ONLY a valid JSON response (no markdown, no code blocks) with this exact structure:
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
  if (!process.env.GROQ_API_KEY) {
    console.log('No GROQ_API_KEY found, using mock mode');
    return generateMockResponse(patientData, hospitals);
  }

  // Create a map of hospital ID to routeInfo for later enrichment
  const routeInfoMap = new Map();
  hospitals.forEach(h => {
    const id = h._id?.toString() || h.id;
    if (h.routeInfo) {
      routeInfoMap.set(id, h.routeInfo);
    }
  });

  try {
    const hospitalsSummary = hospitals.map(h => ({
      id: h._id?.toString() || h.id,
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
      rating: h.rating,
      // Include distance info for AI decision making
      distance: h.routeInfo?.distance ? `${h.routeInfo.distance} km` : null,
      eta: h.routeInfo?.emergencyDuration || h.routeInfo?.duration || null
    }));

    const userPrompt = `
=== PATIENT DATA ===
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Chief Complaint: ${patientData.chiefComplaint}
- Symptoms: ${patientData.symptoms?.join(', ') || 'None reported'}
- PATIENT-REPORTED SEVERITY: ${(patientData.reportedSeverity || 'moderate').toUpperCase()} (consider this as patient's own assessment of urgency)
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

Analyze the patient condition and match with the best available hospital. The patient has self-reported their severity as ${(patientData.reportedSeverity || 'moderate').toUpperCase()} - factor this into your assessment. Each hospital includes distance and ETA (estimated time of arrival) from the patient's location if available. For critical cases, strongly consider travel time - closer hospitals may be better even if slightly less specialized. Respond with JSON only, no markdown.`;

    const client = getGroqClient();
    if (!client) {
      console.log('⚠️ Groq client not available, using mock mode');
      return generateMockResponse(patientData, hospitals);
    }

    console.log('🚀 Calling Groq API...');
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: HOSPITAL_REFERRAL_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (responseText) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // Enrich response with distance/ETA info
        if (result.recommendedHospital?.hospitalId) {
          const routeInfo = routeInfoMap.get(result.recommendedHospital.hospitalId);
          if (routeInfo) {
            result.recommendedHospital.distance = routeInfo.distance;
            result.recommendedHospital.eta = routeInfo.emergencyDuration || routeInfo.duration;
            result.recommendedHospital.routeInfo = routeInfo;
            // Add distance to reasons
            if (routeInfo.distance) {
              result.recommendedHospital.reasons = result.recommendedHospital.reasons || [];
              result.recommendedHospital.reasons.push(`Distance: ${routeInfo.distance} km, ETA: ${routeInfo.emergencyDuration || routeInfo.duration} min`);
            }
          }
        }
        
        // Enrich alternatives with distance info
        if (result.alternativeHospitals) {
          result.alternativeHospitals = result.alternativeHospitals.map(alt => {
            const routeInfo = routeInfoMap.get(alt.hospitalId);
            if (routeInfo) {
              return {
                ...alt,
                distance: routeInfo.distance,
                eta: routeInfo.emergencyDuration || routeInfo.duration
              };
            }
            return alt;
          });
        }
        
        return result;
      }
    }
    
    throw new Error('Failed to parse LLM response');
  } catch (error) {
    console.error('Groq API Error:', error.message);
    console.log('Falling back to mock mode...');
    return generateMockResponse(patientData, hospitals);
  }
};

export const analyzePatient = async (patientData) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      severity: 'moderate',
      recommendation: 'Seek medical evaluation',
      reasoning: 'Mock analysis - configure GROQ_API_KEY for AI analysis',
      estimatedWaitTime: 30,
      alertFlags: []
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are NERVE, an AI medical triage assistant. Analyze patient data and return JSON only:
{
  "severity": "critical" | "urgent" | "moderate" | "minor",
  "recommendation": "Brief action recommendation",
  "reasoning": "Medical reasoning",
  "estimatedWaitTime": number (minutes),
  "alertFlags": ["critical concerns"]
}`
        },
        {
          role: 'user',
          content: `Patient: ${patientData.name}, ${patientData.age}yo
Complaint: ${patientData.chiefComplaint}
Vitals: HR ${patientData.vitals?.heartRate}, SpO2 ${patientData.vitals?.oxygenSaturation}%, BP ${patientData.vitals?.bloodPressure?.systolic}/${patientData.vitals?.bloodPressure?.diastolic}`
        }
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error('No response');
  } catch (error) {
    console.error('Triage Analysis Error:', error.message);
    return {
      severity: 'moderate',
      recommendation: 'Seek medical evaluation',
      reasoning: 'Unable to complete AI analysis',
      estimatedWaitTime: 30,
      alertFlags: []
    };
  }
};

export const analyzeTelemetry = async (telemetryData) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      status: 'stable',
      alerts: [],
      summary: 'Mock telemetry analysis'
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Analyze patient telemetry and return JSON only: { "status": "stable"|"warning"|"critical", "alerts": [], "summary": "" }`
        },
        {
          role: 'user',
          content: JSON.stringify(telemetryData)
        }
      ],
      model: MODEL,
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error('No response');
  } catch (error) {
    console.error('Telemetry Error:', error.message);
    return { status: 'stable', alerts: [], summary: 'Analysis unavailable' };
  }
};

export default { findBestHospital, analyzePatient, analyzeTelemetry };
