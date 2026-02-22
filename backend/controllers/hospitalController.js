import Hospital from '../models/Hospital.js';
import { calculateDistancesToHospitals } from '../services/tomtomService.js';

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
    // Merge lastUpdated into currentStatus if it exists
    const updateData = { ...req.body };
    if (updateData.currentStatus) {
      updateData.currentStatus.lastUpdated = new Date();
    } else {
      updateData['currentStatus.lastUpdated'] = new Date();
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// @desc    Get logged-in user's hospital
// @route   GET /api/hospitals/my
export const getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.hospital._id);
    
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

// @desc    Update logged-in user's hospital
// @route   PUT /api/hospitals/my
export const updateMyHospital = async (req, res) => {
  try {
    // Merge lastUpdated into currentStatus if it exists
    const updateData = { ...req.body };
    if (updateData.currentStatus) {
      updateData.currentStatus.lastUpdated = new Date();
    } else {
      updateData['currentStatus.lastUpdated'] = new Date();
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.user.hospital._id,
      updateData,
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

// @desc    Get hospitals with real-time distances from user location
// @route   GET /api/hospitals/nearby
export const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLocation = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };

    // Fetch all active hospitals (isActive defaults to true, so also include docs without the field)
    const hospitals = await Hospital.find({ isActive: { $ne: false } });
    
    if (hospitals.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Calculate distances using TomTom API
    const hospitalsWithDistances = await calculateDistancesToHospitals(userLocation, hospitals);
    
    // Format response
    const formattedHospitals = hospitalsWithDistances.map(h => ({
      id: h._id?.toString() || h.id,
      name: h.name,
      city: h.address?.city || '',
      state: h.address?.state || '',
      type: h.type,
      distance: h.routeInfo?.distance ? `${h.routeInfo.distance} km` : 'N/A',
      distanceKm: h.routeInfo?.distance || null,
      eta: h.routeInfo?.durationWithTraffic || h.routeInfo?.emergencyDuration || h.routeInfo?.duration || null,
      etaFormatted: h.routeInfo ? `${Math.round(h.routeInfo.durationWithTraffic || h.routeInfo.emergencyDuration || h.routeInfo.duration)} min` : 'N/A',
      trafficDelay: h.routeInfo?.trafficDelay || 0,
      icuBeds: h.facilities?.icuBeds || 0,
      generalBeds: h.facilities?.generalBeds || 0,
      departments: h.specializations || [],
      status: !h.currentStatus?.isAcceptingPatients ? 'full' 
            : h.facilities?.icuBeds === 0 ? 'limited' 
            : 'available',
      waitTime: h.currentStatus?.waitTime ? `${h.currentStatus.waitTime} min` : 'N/A',
      emergencyAvailable: h.currentStatus?.emergencyAvailable || false,
      occupancyRate: h.currentStatus?.occupancyRate || 0,
      rating: h.rating || 4.0,
      specializations: h.specializations || [],
      coordinates: h.address?.coordinates || null
    }));

    res.json({
      success: true,
      count: formattedHospitals.length,
      userLocation,
      data: formattedHospitals
    });
  } catch (error) {
    console.error('getNearbyHospitals error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby hospitals',
      error: error.message
    });
  }
};
