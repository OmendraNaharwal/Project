import Hospital from '../models/Hospital.js';

// @desc    Create new hospital
// @route   POST /api/hospitals
export const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();

    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create hospital',
      error: error.message
    });
  }
};

// @desc    Get all hospitals
// @route   GET /api/hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({
      success: true,
      count: hospitals.length,
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

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
export const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital',
      error: error.message
    });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { ...req.body, 'currentStatus.lastUpdated': new Date() },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update hospital',
      error: error.message
    });
  }
};

// @desc    Update hospital availability status
// @route   PATCH /api/hospitals/:id/status
export const updateHospitalStatus = async (req, res) => {
  try {
    const { isAcceptingPatients, emergencyAvailable, waitTime, occupancyRate } = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        currentStatus: {
          isAcceptingPatients,
          emergencyAvailable,
          waitTime,
          occupancyRate,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update hospital status',
      error: error.message
    });
  }
};

// @desc    Get available hospitals (for referral)
// @route   GET /api/hospitals/available
export const getAvailableHospitals = async (req, res) => {
  try {
    const { specialization, emergency } = req.query;
    
    let query = {
      'currentStatus.isAcceptingPatients': true
    };

    if (emergency === 'true') {
      query['currentStatus.emergencyAvailable'] = true;
      query['facilities.emergencyServices'] = true;
    }

    if (specialization) {
      query.specializations = specialization;
    }

    const hospitals = await Hospital.find(query)
      .sort({ 'currentStatus.waitTime': 1, rating: -1 });

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available hospitals',
      error: error.message
    });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      message: 'Hospital deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete hospital',
      error: error.message
    });
  }
};
