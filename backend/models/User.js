import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate unique hospital code (e.g., NERVE-A1B2C3)
const generateHospitalCode = () => {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NERVE-${suffix}`;
};

const userSchema = new mongoose.Schema({
  hospitalCode: {
    type: String,
    unique: true,
    sparse: true // Allow null for legacy users
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['hospital_admin', 'super_admin'],
    default: 'hospital_admin'
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: function() {
      return this.role === 'hospital_admin';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Generate hospital code for new users only if not already set
  if (this.isNew && !this.hospitalCode) {
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateHospitalCode();
      const existing = await mongoose.model('User').findOne({ hospitalCode: code });
      if (!existing) isUnique = true;
    }
    this.hospitalCode = code;
  }
  
  // Ensure hospitalCode is uppercase
  if (this.hospitalCode) {
    this.hospitalCode = this.hospitalCode.toUpperCase();
  }
  
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
