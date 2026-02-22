import express from 'express';
import {
  createTriage,
  getAllPatients,
  getPatient,
  quickTriage,
  analyzeTelemetryData,
  deletePatient
} from '../controllers/triageController.js';

const router = express.Router();

// POST /api/triage/quick - Quick triage without saving
router.post('/quick', quickTriage);

// POST /api/triage/telemetry - Analyze telemetry data
router.post('/telemetry', analyzeTelemetryData);

// POST /api/triage - Create new triage assessment
router.post('/', createTriage);

// GET /api/triage - Get all patients
router.get('/', getAllPatients);

// GET /api/triage/:id - Get single patient
router.get('/:id', getPatient);

// DELETE /api/triage/:id - Delete patient record
router.delete('/:id', deletePatient);

export default router;
