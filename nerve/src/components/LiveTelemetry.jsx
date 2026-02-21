import { useState, useEffect } from 'react';
import { Hospital, MapPin, AlertTriangle, CheckCircle, XCircle, Clock, User, Wind } from 'lucide-react';
import { mockHospitals, mockInfrastructure } from '../data/mockData';

const LiveTelemetry = () => {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [infrastructure, setInfrastructure] = useState(mockInfrastructure);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(prev => prev.map(h => ({
        ...h,
        beds: {
          ...h.beds,
          icu: Math.max(0, h.beds.icu + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))
        },
        waitTime: h.status !== 'full' ? Math.floor(Math.random() * 40 + 5) : null
      })));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
      case 'clear':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'limited':
      case 'delayed':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'full':
      case 'blocked':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Hospital Status */}
      <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Hospital className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Hospital Status</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">LIVE</span>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
          {hospitals.map((hospital) => (
            <div 
              key={hospital.id}
              className={`p-3 rounded-lg border transition-all ${getStatusColor(hospital.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm truncate">{hospital.name}</h4>
                  <p className="text-xs text-slate-400">{hospital.distance}</p>
                </div>
                {getStatusIcon(hospital.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">ICU:</span>
                  <span className={hospital.beds.icu > 0 ? 'text-emerald-400 font-medium' : 'text-red-400'}>
                    {hospital.beds.icu} beds
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Wait:</span>
                  <span className="text-white">
                    {hospital.waitTime ? `${hospital.waitTime} min` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {hospital.specialists.slice(0, 2).map((spec, idx) => (
                  <span 
                    key={idx}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-700/50 text-slate-300 rounded"
                  >
                    {spec}
                  </span>
                ))}
                {hospital.specialists.length > 2 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-slate-700/50 text-slate-500 rounded">
                    +{hospital.specialists.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Feed */}
      <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Infrastructure</h3>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100%-3rem)]">
          {infrastructure.map((route) => (
            <div 
              key={route.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${getStatusColor(route.status)}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{route.route}</p>
                  <p className="text-xs text-slate-500 truncate">{route.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {route.eta && (
                  <span className="text-xs text-slate-300 font-mono">{route.eta}</span>
                )}
                {getStatusIcon(route.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTelemetry;
