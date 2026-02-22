import { useState, useEffect } from 'react';
import { Hospital, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Star } from 'lucide-react';
import { getNearbyHospitals } from '../services/api';

const LiveTelemetry = ({ location, recommendedHospitals }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if we have LLM recommendations
  const hasRecommendations = recommendedHospitals && recommendedHospitals.length > 0;

  // Fetch hospitals with TomTom distances
  const fetchHospitals = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getNearbyHospitals(location);
      // Transform API response to match expected format
      const transformedHospitals = data.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city || '',
        state: h.state || '',
        distance: h.distance,
        distanceKm: h.distanceKm,
        status: h.status,
        beds: { icu: h.icuBeds, general: h.generalBeds },
        waitTime: h.eta,
        etaFormatted: h.etaFormatted,
        rating: h.rating,
        specializations: h.specializations || []
      }));
      // Sort by distance and take all (we'll slice when displaying)
      setHospitals(transformedHospitals.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999)));
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      setError('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when location changes
  useEffect(() => {
    fetchHospitals();
  }, [location?.latitude, location?.longitude]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (location?.latitude) {
        fetchHospitals();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
      case 'clear':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'limited':
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'full':
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Hospital className="w-5 h-5 text-emerald-300" />
          <h3 className="font-semibold text-white">
            {hasRecommendations ? 'Recommended Hospitals' : 'Nearest Hospitals'}
          </h3>
          <div className="ml-auto flex items-center gap-2">
            {!hasRecommendations && (
              <button
                onClick={fetchHospitals}
                disabled={loading || !location?.latitude}
                className="p-1 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] ${hasRecommendations ? 'text-cyan-400' : 'text-emerald-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasRecommendations ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              {hasRecommendations ? 'AI Pick' : 'Live'}
            </div>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
          {!location?.latitude && (
            <div className="text-center py-4 text-slate-500 text-sm">
              Enable location for real distances
            </div>
          )}
          
          {loading && hospitals.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          )}
          
          {error && (
            <div className="text-center py-2 text-red-400 text-xs">{error}</div>
          )}
          
          {/* Show recommended hospitals if available, otherwise show top 3 nearest */}
          {(hasRecommendations ? recommendedHospitals : hospitals.slice(0, 3)).map((hospital, index) => (
            <div
              key={hospital.id || hospital.hospitalId || index}
              className={`p-3 rounded-xl border ${hasRecommendations && index === 0 
                ? 'border-emerald-500/30 bg-emerald-500/5' 
                : 'border-white/10 bg-[#0b111a]/70'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {hasRecommendations && index === 0 && (
                      <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    )}
                    <h4 className="font-medium text-white text-sm truncate">
                      {hospital.name || hospital.hospitalName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {hospital.city}{hospital.city && hospital.state ? ', ' : ''}{hospital.state}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-cyan-400">
                      {hospital.distance || (hospital.distanceKm ? `${hospital.distanceKm} km` : 'N/A')}
                    </span>
                    {hasRecommendations && hospital.matchScore && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                        {hospital.matchScore}% match
                      </span>
                    )}
                  </div>
                </div>
                {getStatusIcon(hospital.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>ICU Beds</span>
                  <span className={(hospital.beds?.icu || hospital.icuBeds || hospital.facilities?.icuBeds || 0) > 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {hospital.beds?.icu || hospital.icuBeds || hospital.facilities?.icuBeds || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>ETA</span>
                  <span className="text-slate-200">
                    {hospital.etaFormatted || (hospital.eta ? `${Math.round(hospital.eta)} min` : 'N/A')}
                  </span>
                </div>
              </div>

              {/* Show specializations for recommended hospitals */}
              {hasRecommendations && hospital.specializations?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hospital.specializations.slice(0, 3).map((spec, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded capitalize">
                      {spec.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTelemetry;
