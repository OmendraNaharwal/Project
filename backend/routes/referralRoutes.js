import express from 'express';
import {
  processReferral,
  quickReferral,
  getPatientReferral
} from '../controllers/referralController.js';

const router = express.Router();

// POST /api/referral - Process patient and find best hospital
router.post('/', processReferral);

// POST /api/referral/quick - Quick referral without saving
router.post('/quick', quickReferral);

// GET /api/referral/patient/:id - Get patient's referral info
router.get('/patient/:id', getPatientReferral);

export default router;
