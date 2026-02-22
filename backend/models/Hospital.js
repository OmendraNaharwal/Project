import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  contactNumber: {
    type: String
  },
  email: {
    type: String
  },
  type: {
    type: String,
    enum: ['government', 'private', 'charitable'],
    default: 'private'
  },
  
  // Facilities available
  facilities: {
    emergencyServices: { type: Boolean, default: false },
    icu: { type: Boolean, default: false },
    icuBeds: { type: Number, default: 0 },
    generalBeds: { type: Number, default: 0 },
    ventilators: { type: Number, default: 0 },
    operationTheaters: { type: Number, default: 0 },
    ambulanceService: { type: Boolean, default: false },
    bloodBank: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false },
    laboratory: { type: Boolean, default: false },
    radiology: { type: Boolean, default: false },
    mriScanner: { type: Boolean, default: false },
    ctScanner: { type: Boolean, default: false },
    dialysis: { type: Boolean, default: false },
    physiotherapy: { type: Boolean, default: false }
  },

  // Specializations/Departments
  specializations: [{
    type: String,
    enum: [
      'cardiology', 'neurology', 'orthopedics', 'oncology', 
      'pediatrics', 'gynecology', 'urology', 'nephrology',
      'pulmonology', 'gastroenterology', 'dermatology',
      'psychiatry', 'ophthalmology', 'ent', 'general-surgery',
      'plastic-surgery', 'trauma', 'emergency-medicine', 'general-medicine', 'transplant'
    ]
  }],

  // Staff availability
  staff: {
    doctors: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    nurses: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    specialists: [{
      specialization: String,
      name: String,
      available: { type: Boolean, default: true }
    }]
  },

  // Current capacity
  currentStatus: {
    isAcceptingPatients: { type: Boolean, default: true },
    emergencyAvailable: { type: Boolean, default: true },
    waitTime: { type: Number, default: 0 }, // in minutes
    occupancyRate: { type: Number, default: 0 }, // percentage
    lastUpdated: { type: Date, default: Date.now }
  },

  // Location for distance calculation
  location: {
    latitude: Number,
    longitude: Number
  },

  // Rating and reviews
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

// Index for searching
hospitalSchema.index({ 'address.city': 1, specializations: 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
