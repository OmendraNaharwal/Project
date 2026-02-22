import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nerve_token'));
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Fetch user's current location using browser geolocation
  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return null;
    }

    setLocationLoading(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address using TomTom (or fallback to Nominatim)
            const tomtomKey = import.meta.env.VITE_TOMTOM_API_KEY;
            let locationData;
            
            if (tomtomKey) {
              const response = await fetch(
                `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${tomtomKey}`
              );
              const data = await response.json();
              const address = data.addresses?.[0]?.address || {};
              
              locationData = {
                lat: latitude.toFixed(4),
                lng: longitude.toFixed(4),
                latitude: latitude,
                longitude: longitude,
                city: address.municipality || address.localName || 'Unknown',
                state: address.countrySubdivision || '',
                address: address.freeformAddress || '',
                source: 'tomtom'
              };
            } else {
              // Fallback to Nominatim
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              
              locationData = {
                lat: latitude.toFixed(4),
                lng: longitude.toFixed(4),
                latitude: latitude,
                longitude: longitude,
                city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
                state: data.address?.state || '',
                address: data.display_name || '',
                source: 'nominatim'
              };
            }
            
            setLocation(locationData);
            setLocationLoading(false);
            console.log('📍 Location captured:', locationData.city, locationData.state);
            resolve(locationData);
          } catch (err) {
            // Even if reverse geocoding fails, we have coordinates
            const locationData = {
              lat: latitude.toFixed(4),
              lng: longitude.toFixed(4),
              latitude: latitude,
              longitude: longitude,
              city: 'Location found',
              state: '',
              source: 'coordinates-only'
            };
            setLocation(locationData);
            setLocationLoading(false);
            console.log('📍 Location captured (coordinates only):', latitude, longitude);
            resolve(locationData);
          }
        },
        (err) => {
          console.warn('❌ Location access denied:', err.message);
          setLocationError('Location access denied');
          setLocationLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  useEffect(() => {
    // Check if we have a token and validate it
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        // Automatically fetch location when user is authenticated
        fetchLocation();
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
    setLoading(false);
  };

  const login = async (hospitalCode, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalCode, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('nerve_token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    
    // Automatically fetch location after successful login
    fetchLocation();
    
    return data.data;
  };

  const register = async (email, password, hospitalId, customHospitalCode) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, hospitalId, hospitalCode: customHospitalCode })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Don't auto-login after registration - user needs to see their hospital code first
    // Return the registration response so LoginPage can show the hospitalCode
    return {
      hospitalCode: data.data.hospitalCode,
      message: data.message
    };
  };

  const logout = () => {
    localStorage.removeItem('nerve_token');
    setToken(null);
    setUser(null);
    setLocation(null);
    setLocationError(null);
  };

  // Update location manually (e.g., from Header refresh button)
  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    // Location related
    location,
    locationLoading,
    locationError,
    fetchLocation,
    updateLocation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
