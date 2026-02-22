/**
 * TomTom API Service
 * Integrates: Geocoding, Matrix Routing v2, Notifications, Routing, Traffic, Traffic Flow APIs
 */

// Lazy getter for API key (ensures dotenv is loaded first)
const getApiKey = () => process.env.TOMTOM_API_KEY;
const BASE_URL = 'https://api.tomtom.com';

// ============================================
// GEOCODING API
// ============================================

/**
 * Search for an address/place and get coordinates
 * @param {string} query - Address or place name to search
 * @param {Object} options - Additional options (limit, countrySet, lat, lon for nearby search)
 * @returns {Promise<Array>} - Array of geocoding results
 */
export const geocodeAddress = async (query, options = {}) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      query: query,
      limit: options.limit || 5,
      ...(options.countrySet && { countrySet: options.countrySet }),
      ...(options.lat && { lat: options.lat }),
      ...(options.lon && { lon: options.lon }),
      ...(options.radius && { radius: options.radius })
    });

    const response = await fetch(
      `${BASE_URL}/search/2/geocode/${encodeURIComponent(query)}.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(result => ({
      address: result.address.freeformAddress,
      position: {
        latitude: result.position.lat,
        longitude: result.position.lon
      },
      type: result.type,
      score: result.score,
      country: result.address.country,
      city: result.address.municipality
    }));
  } catch (error) {
    console.error('❌ TomTom Geocoding Error:', error.message);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} - Address information
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey()
    });

    const response = await fetch(
      `${BASE_URL}/search/2/reverseGeocode/${latitude},${longitude}.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.addresses?.[0];
    
    if (!result) return null;

    return {
      address: result.address.freeformAddress,
      street: result.address.streetName,
      city: result.address.municipality,
      state: result.address.countrySubdivision,
      country: result.address.country,
      postalCode: result.address.postalCode
    };
  } catch (error) {
    console.error('❌ TomTom Reverse Geocoding Error:', error.message);
    throw error;
  }
};

// ============================================
// ROUTING API
// ============================================

/**
 * Calculate route between two points
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @param {Object} options - Routing options
 * @returns {Promise<Object>} - Route information
 */
export const calculateRoute = async (origin, destination, options = {}) => {
  try {
    const routeType = options.routeType || 'fastest';
    const traffic = options.traffic !== false; // Default true
    const travelMode = options.travelMode || 'car';

    const waypoints = `${origin.latitude},${origin.longitude}:${destination.latitude},${destination.longitude}`;
    
    const params = new URLSearchParams({
      key: getApiKey(),
      routeType: routeType,
      traffic: traffic,
      travelMode: travelMode,
      computeTravelTimeFor: 'all',
      ...(options.departAt && { departAt: options.departAt }),
      ...(options.arriveAt && { arriveAt: options.arriveAt }),
      ...(options.avoid && { avoid: options.avoid }),
      sectionType: 'traffic'
    });

    const response = await fetch(
      `${BASE_URL}/routing/1/calculateRoute/${waypoints}/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Routing failed: ${response.statusText}`);
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route) return null;

    const summary = route.summary;
    
    return {
      distance: (summary.lengthInMeters / 1000).toFixed(1), // km
      duration: Math.ceil(summary.travelTimeInSeconds / 60), // minutes
      durationWithTraffic: Math.ceil(summary.trafficDelayInSeconds / 60 + summary.travelTimeInSeconds / 60),
      trafficDelay: Math.ceil(summary.trafficDelayInSeconds / 60), // minutes
      departureTime: summary.departureTime,
      arrivalTime: summary.arrivalTime,
      trafficLengthInMeters: summary.trafficLengthInMeters,
      source: 'tomtom'
    };
  } catch (error) {
    console.error('❌ TomTom Routing Error:', error.message);
    // Fallback to Haversine calculation
    return calculateHaversineFallback(origin, destination);
  }
};

/**
 * Calculate emergency route with fastest time
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @returns {Promise<Object>} - Emergency route information
 */
export const calculateEmergencyRoute = async (origin, destination) => {
  return calculateRoute(origin, destination, {
    routeType: 'fastest',
    traffic: true,
    travelMode: 'car'
  });
};

// ============================================
// MATRIX ROUTING v2 API
// ============================================

/**
 * Calculate distance/time matrix for multiple origins to multiple destinations
 * @param {Array} origins - Array of { latitude, longitude }
 * @param {Array} destinations - Array of { latitude, longitude }
 * @param {Object} options - Matrix options
 * @returns {Promise<Object>} - Matrix of distances and times
 */
export const calculateMatrix = async (origins, destinations, options = {}) => {
  try {
    const body = {
      origins: origins.map(o => ({ point: { latitude: o.latitude, longitude: o.longitude } })),
      destinations: destinations.map(d => ({ point: { latitude: d.latitude, longitude: d.longitude } })),
      options: {
        routeType: options.routeType || 'fastest',
        traffic: options.traffic !== false,
        travelMode: options.travelMode || 'car'
      }
    };

    const params = new URLSearchParams({
      key: getApiKey()
    });

    const response = await fetch(
      `${BASE_URL}/routing/matrix/2?${params}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`Matrix routing failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process matrix results
    const matrix = data.data.map((row, originIdx) => 
      row.map((cell, destIdx) => ({
        originIndex: originIdx,
        destinationIndex: destIdx,
        distance: cell.routeSummary ? (cell.routeSummary.lengthInMeters / 1000).toFixed(1) : null,
        duration: cell.routeSummary ? Math.ceil(cell.routeSummary.travelTimeInSeconds / 60) : null,
        trafficDelay: cell.routeSummary ? Math.ceil(cell.routeSummary.trafficDelayInSeconds / 60) : 0
      }))
    );

    return {
      matrix,
      formatVersion: data.formatVersion,
      source: 'tomtom-matrix'
    };
  } catch (error) {
    console.error('❌ TomTom Matrix Routing Error:', error.message);
    throw error;
  }
};

/**
 * Calculate distances from patient to multiple hospitals
 * @param {Object} patientLocation - { latitude, longitude }
 * @param {Array} hospitals - Array of hospital objects with location
 * @returns {Promise<Array>} - Hospitals sorted by travel time
 */
export const calculateDistancesToHospitals = async (patientLocation, hospitals) => {
  try {
    if (!patientLocation?.latitude || !patientLocation?.longitude) {
      console.log('⚠️ No patient location - skipping TomTom distance calculation');
      return hospitals.map(h => ({
        ...h.toObject ? h.toObject() : h,
        routeInfo: null
      }));
    }

    const validHospitals = hospitals.filter(h => {
      const loc = h.toObject ? h.toObject().location : h.location;
      return loc?.latitude && loc?.longitude;
    });

    if (validHospitals.length === 0) {
      return hospitals.map(h => ({
        ...h.toObject ? h.toObject() : h,
        routeInfo: null
      }));
    }

    // Use individual routing for each hospital (more accurate with traffic)
    const hospitalsWithRoutes = await Promise.all(
      hospitals.map(async (hospital) => {
        const hospitalObj = hospital.toObject ? hospital.toObject() : hospital;
        
        if (!hospitalObj.location?.latitude || !hospitalObj.location?.longitude) {
          return { ...hospitalObj, routeInfo: null };
        }

        const routeInfo = await calculateRoute(patientLocation, hospitalObj.location);
        return { ...hospitalObj, routeInfo };
      })
    );

    // Sort hospitals by travel time (considering traffic)
    hospitalsWithRoutes.sort((a, b) => {
      if (!a.routeInfo && !b.routeInfo) return 0;
      if (!a.routeInfo) return 1;
      if (!b.routeInfo) return -1;
      const timeA = a.routeInfo.durationWithTraffic || a.routeInfo.duration || Infinity;
      const timeB = b.routeInfo.durationWithTraffic || b.routeInfo.duration || Infinity;
      return timeA - timeB;
    });

    console.log(`✓ TomTom: Calculated distances to ${hospitalsWithRoutes.filter(h => h.routeInfo).length} hospitals`);
    
    return hospitalsWithRoutes;
  } catch (error) {
    console.error('❌ TomTom Distances Error:', error.message);
    // Return hospitals without route info on error
    return hospitals.map(h => ({
      ...h.toObject ? h.toObject() : h,
      routeInfo: null
    }));
  }
};

/**
 * Find the nearest hospital from patient location
 * @param {Object} patientLocation - { latitude, longitude }
 * @param {Array} hospitals - Array of hospital objects with location
 * @returns {Promise<Object>} - Nearest hospital with route info
 */
export const findNearestHospital = async (patientLocation, hospitals) => {
  const hospitalsWithRoutes = await calculateDistancesToHospitals(patientLocation, hospitals);
  
  // Already sorted by travel time, return the first one with valid route
  const nearest = hospitalsWithRoutes.find(h => h.routeInfo);
  
  if (!nearest) {
    console.log('⚠️ No hospital with valid route found');
    return hospitalsWithRoutes[0] || null;
  }

  console.log(`✓ Nearest hospital: ${nearest.name} (${nearest.routeInfo.distance} km, ${nearest.routeInfo.durationWithTraffic || nearest.routeInfo.duration} min with traffic)`);
  
  return nearest;
};

// ============================================
// TRAFFIC API
// ============================================

/**
 * Get traffic incidents in an area
 * @param {Object} boundingBox - { minLat, minLon, maxLat, maxLon }
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - Traffic incidents
 */
export const getTrafficIncidents = async (boundingBox, options = {}) => {
  try {
    const { minLat, minLon, maxLat, maxLon } = boundingBox;
    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

    const params = new URLSearchParams({
      key: getApiKey(),
      bbox: bbox,
      fields: '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers}}}',
      language: 'en-US',
      ...(options.categoryFilter && { categoryFilter: options.categoryFilter }),
      ...(options.timeValidityFilter && { timeValidityFilter: options.timeValidityFilter })
    });

    const response = await fetch(
      `${BASE_URL}/traffic/services/5/incidentDetails?${params}`
    );

    if (!response.ok) {
      throw new Error(`Traffic incidents failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.incidents?.map(incident => ({
      type: incident.type,
      category: incident.properties?.iconCategory,
      description: incident.properties?.events?.[0]?.description,
      from: incident.properties?.from,
      to: incident.properties?.to,
      delay: incident.properties?.delay, // seconds
      length: incident.properties?.length, // meters
      roadNumbers: incident.properties?.roadNumbers,
      startTime: incident.properties?.startTime,
      endTime: incident.properties?.endTime,
      coordinates: incident.geometry?.coordinates
    })) || [];
  } catch (error) {
    console.error('❌ TomTom Traffic Incidents Error:', error.message);
    return [];
  }
};

/**
 * Get traffic incidents along a route
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @param {number} corridorWidth - Width in meters around the route to search
 * @returns {Promise<Array>} - Traffic incidents along route
 */
export const getTrafficAlongRoute = async (origin, destination, corridorWidth = 1000) => {
  // Calculate bounding box from origin to destination with padding
  const minLat = Math.min(origin.latitude, destination.latitude) - 0.05;
  const maxLat = Math.max(origin.latitude, destination.latitude) + 0.05;
  const minLon = Math.min(origin.longitude, destination.longitude) - 0.05;
  const maxLon = Math.max(origin.longitude, destination.longitude) + 0.05;

  return getTrafficIncidents({ minLat, minLon, maxLat, maxLon });
};

// ============================================
// TRAFFIC FLOW API
// ============================================

/**
 * Get traffic flow data for a specific road segment
 * @param {Object} location - { latitude, longitude }
 * @param {number} zoom - Zoom level (0-22)
 * @returns {Promise<Object>} - Traffic flow information
 */
export const getTrafficFlow = async (location, zoom = 15) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      point: `${location.latitude},${location.longitude}`,
      unit: 'KMPH',
      thickness: 10,
      openLr: false
    });

    const response = await fetch(
      `${BASE_URL}/traffic/services/4/flowSegmentData/absolute/${zoom}/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Traffic flow failed: ${response.statusText}`);
    }

    const data = await response.json();
    const flow = data.flowSegmentData;

    return {
      currentSpeed: flow.currentSpeed, // km/h
      freeFlowSpeed: flow.freeFlowSpeed, // km/h
      currentTravelTime: flow.currentTravelTime, // seconds
      freeFlowTravelTime: flow.freeFlowTravelTime, // seconds
      confidence: flow.confidence,
      roadClosure: flow.roadClosure,
      congestionLevel: calculateCongestionLevel(flow.currentSpeed, flow.freeFlowSpeed)
    };
  } catch (error) {
    console.error('❌ TomTom Traffic Flow Error:', error.message);
    return null;
  }
};

/**
 * Calculate congestion level based on current vs free flow speed
 */
const calculateCongestionLevel = (currentSpeed, freeFlowSpeed) => {
  if (!currentSpeed || !freeFlowSpeed) return 'unknown';
  const ratio = currentSpeed / freeFlowSpeed;
  if (ratio >= 0.9) return 'free';
  if (ratio >= 0.7) return 'light';
  if (ratio >= 0.5) return 'moderate';
  if (ratio >= 0.3) return 'heavy';
  return 'severe';
};

// ============================================
// NOTIFICATIONS API (Geofencing)
// ============================================

/**
 * Create a geofence notification project
 * @param {string} projectName - Name of the notification project
 * @returns {Promise<Object>} - Project info
 */
export const createNotificationProject = async (projectName) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey()
    });

    const response = await fetch(
      `${BASE_URL}/notifications/1/projects?${params}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Create notification project failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ TomTom Notification Project Error:', error.message);
    throw error;
  }
};

/**
 * Create a geofence for hospital arrival notification
 * @param {string} projectId - Notification project ID
 * @param {Object} hospitalLocation - { latitude, longitude }
 * @param {number} radiusMeters - Geofence radius in meters
 * @param {string} hospitalName - Hospital name for notification
 * @returns {Promise<Object>} - Geofence info
 */
export const createHospitalGeofence = async (projectId, hospitalLocation, radiusMeters = 500, hospitalName) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey()
    });

    const response = await fetch(
      `${BASE_URL}/notifications/1/projects/${projectId}/fences?${params}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Hospital Arrival - ${hospitalName}`,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [hospitalLocation.longitude, hospitalLocation.latitude],
            radius: radiusMeters
          },
          properties: {
            hospitalName: hospitalName,
            alertType: 'hospital_arrival'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Create geofence failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ TomTom Geofence Error:', error.message);
    throw error;
  }
};

/**
 * Check if a location is within any registered geofences
 * @param {string} projectId - Notification project ID
 * @param {Object} location - { latitude, longitude }
 * @returns {Promise<Array>} - Triggered geofences
 */
export const checkGeofences = async (projectId, location) => {
  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      point: `${location.latitude},${location.longitude}`
    });

    const response = await fetch(
      `${BASE_URL}/notifications/1/projects/${projectId}/fence/check?${params}`
    );

    if (!response.ok) {
      throw new Error(`Check geofences failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ TomTom Check Geofence Error:', error.message);
    return [];
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Haversine fallback for when TomTom API fails
 */
const calculateHaversineFallback = (origin, destination) => {
  const R = 6371;
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.latitude)) * Math.cos(toRad(destination.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  const normalSpeed = 25;
  const duration = Math.ceil((distance / normalSpeed) * 60);
  
  return {
    distance: distance.toFixed(1),
    duration: duration,
    durationWithTraffic: duration,
    trafficDelay: 0,
    source: 'haversine-fallback'
  };
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Get emergency distance score factoring in traffic
 * @param {Object} routeInfo - Route information from TomTom
 * @param {string} severity - Patient severity level
 * @returns {number} - Score (higher is better)
 */
export const getEmergencyDistanceScore = (routeInfo, severity) => {
  if (!routeInfo) return 0;
  
  const distance = parseFloat(routeInfo.distance);
  const duration = routeInfo.durationWithTraffic || routeInfo.duration;
  
  // Base score inversely proportional to time
  let score = Math.max(0, 100 - (duration * 2));
  
  // Penalize traffic delays for critical patients
  if (severity === 'critical' && routeInfo.trafficDelay > 5) {
    score -= routeInfo.trafficDelay * 2;
  }
  
  // Penalize very long distances
  if (distance > 30) {
    score -= (distance - 30) * 0.5;
  }
  
  return Math.max(0, Math.min(100, score));
};

export default {
  // Geocoding
  geocodeAddress,
  reverseGeocode,
  // Routing
  calculateRoute,
  calculateEmergencyRoute,
  calculateMatrix,
  calculateDistancesToHospitals,
  findNearestHospital,
  // Traffic
  getTrafficIncidents,
  getTrafficAlongRoute,
  getTrafficFlow,
  // Notifications
  createNotificationProject,
  createHospitalGeofence,
  checkGeofences,
  // Helpers
  getEmergencyDistanceScore
};
