// Distance calculation service using Haversine formula
// Uses hospital coordinates from database to calculate estimated distance and ETA

/**
 * Calculate route between two points using Haversine formula
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @param {boolean} isEmergency - If true, use faster emergency vehicle speed
 * @returns {Object} - { distance (km), duration (minutes) }
 */
export const calculateRoute = async (origin, destination, isEmergency = false) => {
  return calculateHaversineDistance(origin, destination, isEmergency);
};

/**
 * Calculate distances to multiple hospitals
 * @param {Object} patientLocation - { latitude, longitude }
 * @param {Array} hospitals - Array of hospital objects with location
 * @param {boolean} isEmergency - If true, calculate for emergency vehicle
 * @returns {Array} - Hospitals with distance and duration added
 */
export const calculateDistancesToHospitals = async (patientLocation, hospitals, isEmergency = false) => {
  if (!patientLocation?.latitude || !patientLocation?.longitude) {
    console.log('⚠️ No patient location provided - skipping distance calculation');
    return hospitals.map(h => ({
      ...h.toObject ? h.toObject() : h,
      routeInfo: null
    }));
  }
  
  const hospitalsWithRoutes = await Promise.all(
    hospitals.map(async (hospital) => {
      const hospitalObj = hospital.toObject ? hospital.toObject() : hospital;
      
      if (!hospitalObj.location?.latitude || !hospitalObj.location?.longitude) {
        return {
          ...hospitalObj,
          routeInfo: null
        };
      }

      const routeInfo = await calculateRoute(
        patientLocation,
        hospitalObj.location,
        isEmergency
      );

      return {
        ...hospitalObj,
        routeInfo
      };
    })
  );

  return hospitalsWithRoutes;
};

/**
 * Haversine formula for distance calculation using coordinates
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @param {boolean} isEmergency - If true, use faster emergency vehicle speed
 */
const calculateHaversineDistance = (origin, destination, isEmergency = false) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.latitude)) * Math.cos(toRad(destination.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Estimate duration based on vehicle type
  // Normal traffic: ~25-30 km/h in city
  // Emergency vehicle: ~40-50 km/h with sirens
  const normalSpeed = 25; // km/h for normal city traffic
  const emergencySpeed = 45; // km/h for ambulance with sirens
  
  const normalDuration = Math.ceil((distance / normalSpeed) * 60); // minutes
  const emergencyDuration = Math.ceil((distance / emergencySpeed) * 60); // minutes
  
  return {
    distance: distance.toFixed(1),
    duration: normalDuration,
    emergencyDuration: isEmergency ? emergencyDuration : null,
    source: 'coordinates'
  };
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Get emergency-adjusted score based on distance and severity
 */
export const getEmergencyDistanceScore = (routeInfo, severity) => {
  if (!routeInfo) return 0;
  
  const distance = parseFloat(routeInfo.distance);
  const duration = routeInfo.emergencyDuration || routeInfo.duration;
  
  let score = 0;
  
  // Distance scoring (closer is better)
  if (distance <= 2) score += 20;
  else if (distance <= 5) score += 15;
  else if (distance <= 10) score += 10;
  else if (distance <= 20) score += 5;
  else score -= 5;
  
  // Duration scoring for emergencies
  if (severity === 'critical') {
    if (duration <= 5) score += 25;
    else if (duration <= 10) score += 15;
    else if (duration <= 15) score += 5;
    else if (duration > 30) score -= 15;
  } else if (severity === 'urgent') {
    if (duration <= 10) score += 15;
    else if (duration <= 20) score += 10;
    else if (duration > 40) score -= 10;
  } else {
    if (duration <= 15) score += 10;
    else if (duration <= 30) score += 5;
  }
  
  return score;
};

export default {
  calculateRoute,
  calculateDistancesToHospitals,
  getEmergencyDistanceScore
};
