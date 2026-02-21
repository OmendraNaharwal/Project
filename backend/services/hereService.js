// HERE Maps API Service for distance and route calculation

const HERE_API_KEY = process.env.HERE_API_KEY;

/**
 * Calculate route between two points using HERE Routing API
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @param {string} transportMode - 'car' | 'truck' | 'pedestrian'
 * @returns {Object} - { distance (km), duration (minutes), summary }
 */
export const calculateRoute = async (origin, destination, transportMode = 'car') => {
  if (!HERE_API_KEY) {
    console.log('⚠️ HERE_API_KEY not set - using estimated distance');
    return calculateHaversineDistance(origin, destination);
  }

  try {
    const url = new URL('https://router.hereapi.com/v8/routes');
    url.searchParams.set('transportMode', transportMode);
    url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`);
    url.searchParams.set('destination', `${destination.latitude},${destination.longitude}`);
    url.searchParams.set('return', 'summary,typicalDuration');
    url.searchParams.set('apiKey', HERE_API_KEY);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('HERE API Error:', response.status, await response.text());
      return calculateHaversineDistance(origin, destination);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const section = route.sections[0];
      
      return {
        distance: (section.summary.length / 1000).toFixed(1), // Convert to km
        duration: Math.ceil(section.summary.duration / 60), // Convert to minutes
        typicalDuration: section.summary.typicalDuration 
          ? Math.ceil(section.summary.typicalDuration / 60) 
          : null,
        trafficDelay: section.summary.trafficDelay 
          ? Math.ceil(section.summary.trafficDelay / 60) 
          : 0,
        source: 'here_api'
      };
    }
    
    return calculateHaversineDistance(origin, destination);
  } catch (error) {
    console.error('HERE API Error:', error.message);
    return calculateHaversineDistance(origin, destination);
  }
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

  const transportMode = isEmergency ? 'car' : 'car'; // Could use 'truck' for ambulance
  
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
        transportMode
      );

      // Apply emergency factor (ambulance can be ~30% faster)
      if (isEmergency && routeInfo.duration) {
        routeInfo.emergencyDuration = Math.ceil(routeInfo.duration * 0.7);
      }

      return {
        ...hospitalObj,
        routeInfo
      };
    })
  );

  return hospitalsWithRoutes;
};

/**
 * Haversine formula for fallback distance calculation
 */
const calculateHaversineDistance = (origin, destination) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.latitude)) * Math.cos(toRad(destination.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Estimate duration: ~30 km/h in city traffic, ~50 km/h for emergency
  const avgSpeed = 30; // km/h for normal traffic
  const duration = Math.ceil((distance / avgSpeed) * 60); // minutes
  
  return {
    distance: distance.toFixed(1),
    duration,
    source: 'estimated'
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
