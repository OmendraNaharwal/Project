import Patient from '../models/Patient.js';
import { analyzePatient, analyzeTelemetry } from '../services/groqService.js';

// @desc    Create new triage assessment
// @route   POST /api/triage
export const createTriage = async (req, res) => {
  try {
    const patientData = req.body;

    // Get AI triage analysis from Groq
    const triageResult = await analyzePatient(patientData);

    // Create patient record with triage result
    const patient = new Patient({
      ...patientData,
      triageResult: {
        ...triageResult,
        aiGeneratedAt: new Date()
      }
    });

    await patient.save();

    res.status(201).json({
      success: true,
      data: {
        patient,
        triage: triageResult
      }
    });
  } catch (error) {
    console.error('Create Triage Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process triage',
      error: error.message
    });
  }
};

// @desc    Get all patients with triage
// @route   GET /api/triage
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

// @desc    Get single patient
// @route   GET /api/triage/:id
export const getPatient = async (req, res) => {
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
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: error.message
    });
  }
};

// @desc    Quick triage (without saving to DB)
// @route   POST /api/triage/quick
export const quickTriage = async (req, res) => {
  try {
    const patientData = req.body;
    const triageResult = await analyzePatient(patientData);

    res.json({
      success: true,
      data: triageResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process quick triage',
      error: error.message
    });
  }
};

// @desc    Analyze telemetry data
// @route   POST /api/triage/telemetry
export const analyzeTelemetryData = async (req, res) => {
  try {
    const telemetryData = req.body;
    const analysis = await analyzeTelemetry(telemetryData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze telemetry',
      error: error.message
    });
  }
};

// @desc    Delete patient record
// @route   DELETE /api/triage/:id
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
};
