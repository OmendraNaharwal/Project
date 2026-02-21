import express from 'express';
import {
  createHospital,
  getAllHospitals,
  getHospital,
  updateHospital,
  updateHospitalStatus,
  getAvailableHospitals,
  deleteHospital
} from '../controllers/hospitalController.js';

const router = express.Router();

// GET /api/hospitals/available - Get available hospitals for referral
router.get('/available', getAvailableHospitals);

// POST /api/hospitals - Create new hospital
router.post('/', createHospital);

// GET /api/hospitals - Get all hospitals
router.get('/', getAllHospitals);

// GET /api/hospitals/:id - Get single hospital
router.get('/:id', getHospital);

// PUT /api/hospitals/:id - Update hospital
router.put('/:id', updateHospital);

// PATCH /api/hospitals/:id/status - Update hospital status
router.patch('/:id/status', updateHospitalStatus);

// DELETE /api/hospitals/:id - Delete hospital
router.delete('/:id', deleteHospital);

export default router;
