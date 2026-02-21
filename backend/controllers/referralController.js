import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import TriageHistory from '../models/TriageHistory.js';
import { findBestHospital } from '../services/groqService.js';
import { calculateDistancesToHospitals } from '../services/hereService.js';

// @desc    Process patient and find best hospital referral
// @route   POST /api/referral
export const processReferral = async (req, res) => {
  try {
    // Handle both { patientData: {...} } and direct patient data
    const patientData = req.body.patientData || req.body;
    const patientLocation = req.body.patientLocation || patientData.location;

    // Step 1: Fetch all available hospitals from database
    const hospitals = await Hospital.find({
      'currentStatus.isAcceptingPatients': true
    });

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available hospitals found in the system'
      });
    }

    // Step 1.5: Calculate distances to all hospitals if location provided
    const hospitalsWithRoutes = await calculateDistancesToHospitals(
      patientLocation,
      hospitals,
      true // isEmergency
    );

    // Step 2: Send patient data + hospitals to Gemini for analysis
    const referralResult = await findBestHospital(patientData, hospitalsWithRoutes);

    // Step 3: Save patient record with referral
    const patient = new Patient({
      ...patientData,
      triageResult: {
        severity: referralResult.triage?.severity,
        recommendation: `Refer to ${referralResult.recommendedHospital?.hospitalName}`,
        reasoning: referralResult.triage?.reasoning,
        estimatedWaitTime: referralResult.recommendedHospital?.estimatedWaitTime,
        requiredSpecializations: referralResult.triage?.requiredSpecializations,
        requiredFacilities: referralResult.triage?.requiredFacilities,
        aiGeneratedAt: new Date()
      },
      referral: {
        hospitalId: referralResult.recommendedHospital?.hospitalId,
        hospitalName: referralResult.recommendedHospital?.hospitalName,
        matchScore: referralResult.recommendedHospital?.matchScore,
        reasons: referralResult.recommendedHospital?.reasons,
        urgentTransfer: referralResult.urgentTransfer,
        referredAt: new Date(),
        status: 'pending'
      }
    });

    await patient.save();

    // Step 4: Get full hospital details for the recommendation
    const recommendedHospital = await Hospital.findById(
      referralResult.recommendedHospital?.hospitalId
    );

    res.status(201).json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          name: patient.name,
          chiefComplaint: patient.chiefComplaint
        },
        triage: referralResult.triage,
        recommendedHospital: {
          ...referralResult.recommendedHospital,
          details: recommendedHospital
        },
        alternativeHospitals: referralResult.alternativeHospitals,
        urgentTransfer: referralResult.urgentTransfer,
        additionalNotes: referralResult.additionalNotes
      }
    });
  } catch (error) {
    console.error('Referral Processing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process referral',
      error: error.message
    });
  }
};

// @desc    Quick referral check (saves to history for learning)
// @route   POST /api/referral/quick
export const quickReferral = async (req, res) => {
  try {
    // Handle both { patientData: {...} } and direct patient data
    const patientData = req.body.patientData || req.body;
    const patientLocation = req.body.patientLocation || patientData.location;

    // Fetch available hospitals
    const hospitals = await Hospital.find({
      'currentStatus.isAcceptingPatients': true
    });

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available hospitals found'
      });
    }

    // Calculate distances if location provided
    const hospitalsWithRoutes = await calculateDistancesToHospitals(
      patientLocation,
      hospitals,
      true // isEmergency
    );

    // Fetch similar historical cases for context
    const complaint = patientData.chiefComplaint || patientData.complaint || '';
    const symptoms = patientData.symptoms || [];
    let historicalCases = [];
    
    try {
      historicalCases = await TriageHistory.findSimilarCases(complaint, symptoms, 5);
    } catch (histErr) {
      console.log('Historical data lookup skipped:', histErr.message);
    }

    // Get referral recommendation (with historical context)
    const referralResult = await findBestHospital(patientData, hospitalsWithRoutes, historicalCases);

    // Save this case to triage history for future learning (async, don't wait)
    saveTriageHistory(patientData, referralResult, patientLocation).catch(err => 
      console.log('Failed to save triage history:', err.message)
    );

    res.json({
      success: true,
      data: {
        ...referralResult,
        historicalCasesUsed: historicalCases.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process quick referral',
      error: error.message
    });
  }
};

// Helper function to save triage history
async function saveTriageHistory(patientData, referralResult, location) {
  const age = patientData.age || 30;
  const ageGroup = TriageHistory.getAgeGroup(age);
  
  const historyEntry = new TriageHistory({
    patientProfile: {
      ageGroup,
      gender: patientData.gender
    },
    chiefComplaint: patientData.chiefComplaint || patientData.complaint || '',
    symptoms: patientData.symptoms || [],
    reportedSeverity: patientData.reportedSeverity,
    vitals: {
      heartRate: patientData.heartRate || patientData.vitals?.heartRate,
      bloodPressure: patientData.bloodPressure || 
        (patientData.vitals?.bloodPressure ? 
          `${patientData.vitals.bloodPressure.systolic}/${patientData.vitals.bloodPressure.diastolic}` : 
          null),
      oxygenSaturation: patientData.spO2 || patientData.vitals?.oxygenSaturation,
      temperature: patientData.vitals?.temperature
    },
    triageResult: {
      severity: referralResult.triage?.severity,
      detectedCondition: referralResult.triage?.detectedCondition,
      recommendation: referralResult.triage?.recommendation,
      reasoning: referralResult.triage?.reasoning,
      requiredSpecializations: referralResult.triage?.requiredSpecializations,
      requiredFacilities: referralResult.triage?.requiredFacilities
    },
    referredHospital: {
      hospitalId: referralResult.recommendedHospital?.hospitalId,
      hospitalName: referralResult.recommendedHospital?.hospitalName,
      matchScore: referralResult.recommendedHospital?.matchScore,
      distance: referralResult.recommendedHospital?.distance,
      eta: referralResult.recommendedHospital?.eta
    },
    location: location ? {
      latitude: location.latitude,
      longitude: location.longitude
    } : undefined
  });

  await historyEntry.save();
  console.log('✓ Triage history saved for learning');
}

// @desc    Get referral history for a patient
// @route   GET /api/referral/patient/:id
export const getPatientReferral = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: {
        patient,
        triageResult: patient.triageResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient referral',
      error: error.message
    });
  }
};
