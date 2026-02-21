import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  vitals: {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    temperature: Number,
    oxygenSaturation: Number,
    respiratoryRate: Number
  },
  medicalHistory: {
    type: String
  },
  allergies: [{
    type: String
  }],
  currentMedications: [{
    type: String
  }],
  triageResult: {
    severity: {
      type: String,
      enum: ['critical', 'urgent', 'moderate', 'minor'],
    },
    recommendation: String,
    reasoning: String,
    estimatedWaitTime: Number,
    requiredSpecializations: [String],
    requiredFacilities: [String],
    aiGeneratedAt: Date
  },
  
  // Hospital referral
  referral: {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    hospitalName: String,
    matchScore: Number,
    reasons: [String],
    urgentTransfer: Boolean,
    referredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'transferred', 'completed', 'cancelled'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
