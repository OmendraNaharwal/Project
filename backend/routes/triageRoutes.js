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

// POST /api/triage - Create new patient with triage
router.post('/', createTriage);

// GET /api/triage - Get all patients
router.get('/', getAllPatients);

// POST /api/triage/quick - Quick triage without saving
router.post('/quick', quickTriage);

// POST /api/triage/telemetry - Analyze telemetry data
router.post('/telemetry', analyzeTelemetryData);

// GET /api/triage/:id - Get single patient
router.get('/:id', getPatient);

// DELETE /api/triage/:id - Delete patient
router.delete('/:id', deletePatient);

export default router;
