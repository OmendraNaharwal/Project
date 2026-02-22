import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nerve-hackathon-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, name, hospitalId, hospitalCode } = req.body;

    // Validate hospital code format if provided
    if (hospitalCode) {
      const codeRegex = /^[A-Z0-9-]{4,20}$/;
      if (!codeRegex.test(hospitalCode.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Hospital ID must be 4-20 characters, containing only letters, numbers, and dashes'
        });
      }
      
      // Check if hospital code already exists
      const existingCode = await User.findOne({ hospitalCode: hospitalCode.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'This Hospital ID is already taken. Please choose a different one.'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID'
      });
    }

    // Check if hospital already has an admin registered
    const existingHospitalAdmin = await User.findOne({ hospital: hospitalId });
    if (existingHospitalAdmin) {
      return res.status(400).json({
        success: false,
        message: 'This hospital already has an admin account. Please contact the existing administrator.'
      });
    }

    // Create user with custom or auto-generated hospital code
    const user = await User.create({
      email,
      password,
      name: name || email.split('@')[0],
      hospital: hospitalId,
      hospitalCode: hospitalCode ? hospitalCode.toUpperCase() : undefined, // Will auto-generate if undefined
      role: 'hospital_admin'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        hospitalCode: user.hospitalCode,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          hospitalId: user.hospital,
          hospitalCode: user.hospitalCode
        }
      },
      message: `Registration successful! Your Hospital ID is: ${user.hospitalCode}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { hospitalCode, password } = req.body;

    // Check if hospitalCode and password are provided
    if (!hospitalCode || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Hospital ID and password'
      });
    }

    // Find user by hospitalCode and include password for comparison
    const user = await User.findOne({ hospitalCode: hospitalCode.toUpperCase().trim() }).select('+password').populate('hospital', 'name');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          hospitalId: user.hospital._id,
          hospitalName: user.hospital.name,
          hospitalCode: user.hospitalCode
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('hospital', 'name');
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospitalId: user.hospital._id,
        hospitalName: user.hospital.name,
        hospitalCode: user.hospitalCode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// @desc    Get hospitals list for registration dropdown (only unregistered)
// @route   GET /api/auth/hospitals
export const getHospitalsForRegistration = async (req, res) => {
  try {
    // Find hospitals that already have admins
    const usersWithHospitals = await User.find({ hospital: { $exists: true } }, 'hospital');
    const registeredHospitalIds = usersWithHospitals.map(u => u.hospital.toString());
    
    // Get hospitals that don't have admins yet
    const hospitals = await Hospital.find({
      _id: { $nin: registeredHospitalIds }
    }, 'name').sort('name');
    
    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals',
      error: error.message
    });
  }
};
