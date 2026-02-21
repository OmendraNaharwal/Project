import mongoose from 'mongoose';

const triageHistorySchema = new mongoose.Schema({
  // Patient details (anonymized for learning)
  patientProfile: {
    ageGroup: {
      type: String,
      enum: ['infant', 'child', 'adolescent', 'adult', 'senior'],
      required: true
    },
    gender: String
  },
  
  // Symptoms and complaint
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: [String],
  reportedSeverity: String,
  
  // Vitals at time of triage
  vitals: {
    heartRate: Number,
    bloodPressure: String,
    oxygenSaturation: Number,
    temperature: Number
  },
  
  // AI Triage Result
  triageResult: {
    severity: {
      type: String,
      enum: ['critical', 'urgent', 'moderate', 'minor'],
      required: true
    },
    detectedCondition: String,
    recommendation: String,
    reasoning: String,
    requiredSpecializations: [String],
    requiredFacilities: [String]
  },
  
  // Hospital referred to
  referredHospital: {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    hospitalName: String,
    matchScore: Number,
    distance: Number,
    eta: Number
  },
  
  // Outcome tracking (can be updated later)
  outcome: {
    wasAccurate: Boolean,  // Was the triage accurate?
    actualSeverity: String,  // What was the actual severity?
    patientOutcome: {
      type: String,
      enum: ['discharged', 'admitted', 'transferred', 'deceased', 'unknown']
    },
    feedbackNotes: String,
    updatedAt: Date
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number,
    city: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
triageHistorySchema.index({ chiefComplaint: 'text', 'symptoms': 'text' });
triageHistorySchema.index({ 'triageResult.severity': 1 });
triageHistorySchema.index({ 'triageResult.detectedCondition': 1 });
triageHistorySchema.index({ createdAt: -1 });

// Static method to get similar past cases
triageHistorySchema.statics.findSimilarCases = async function(complaint, symptoms = [], limit = 5) {
  const searchTerms = [complaint.toLowerCase(), ...symptoms.map(s => s.toLowerCase())].join(' ');
  
  // Try text search first
  let cases = await this.find(
    { $text: { $search: searchTerms } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
  
  // Fallback to regex if text search returns nothing
  if (cases.length === 0) {
    const complaintWords = complaint.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (complaintWords.length > 0) {
      const regexPattern = complaintWords.join('|');
      cases = await this.find({
        chiefComplaint: { $regex: regexPattern, $options: 'i' }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }
  }
  
  return cases;
};

// Static method to get severity distribution for a condition
triageHistorySchema.statics.getSeverityStats = async function(condition) {
  return this.aggregate([
    { $match: { 'triageResult.detectedCondition': condition } },
    { 
      $group: {
        _id: '$triageResult.severity',
        count: { $sum: 1 },
        avgMatchScore: { $avg: '$referredHospital.matchScore' }
      }
    }
  ]);
};

// Helper to convert age to age group
triageHistorySchema.statics.getAgeGroup = function(age) {
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  if (age < 18) return 'adolescent';
  if (age < 65) return 'adult';
  return 'senior';
};

const TriageHistory = mongoose.model('TriageHistory', triageHistorySchema);

export default TriageHistory;
