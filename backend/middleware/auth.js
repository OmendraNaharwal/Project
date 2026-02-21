import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nerve-hackathon-secret-key-2026';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).populate('hospital', 'name');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token'
    });
  }
};

// Check if user owns the hospital
export const checkHospitalOwnership = (req, res, next) => {
  // Super admins can access any hospital
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if the hospital ID in params matches user's hospital
  const hospitalId = req.params.id || req.params.hospitalId;
  
  if (hospitalId && req.user.hospital._id.toString() !== hospitalId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this hospital'
    });
  }

  next();
};
