import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import { findBestHospital } from '../services/groqService.js';

// @desc    Process patient and find best hospital referral
// @route   POST /api/referral
export const processReferral = async (req, res) => {
  try {
    // Handle both { patientData: {...} } and direct patient data
    const patientData = req.body.patientData || req.body;

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

    // Step 2: Send patient data + hospitals to Gemini for analysis
    const referralResult = await findBestHospital(patientData, hospitals);

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

// @desc    Quick referral check (without saving patient)
// @route   POST /api/referral/quick
export const quickReferral = async (req, res) => {
  try {
    // Handle both { patientData: {...} } and direct patient data
    const patientData = req.body.patientData || req.body;

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

    // Get referral recommendation from Gemini
    const referralResult = await findBestHospital(patientData, hospitals);

    res.json({
      success: true,
      data: referralResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process quick referral',
      error: error.message
    });
  }
};

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
