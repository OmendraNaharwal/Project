import { useState, useEffect } from 'react';
import { Hospital, MapPin, AlertTriangle, CheckCircle, XCircle, Clock, Wind } from 'lucide-react';
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

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Hospital className="w-5 h-5 text-emerald-300" />
          <h3 className="font-semibold text-white">Hospital Status</h3>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Live
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="p-3 rounded-xl border border-white/10 bg-[#0b111a]/70"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm truncate">{hospital.name}</h4>
                  <p className="text-[11px] text-slate-500">{hospital.distance}</p>
                </div>
                {getStatusIcon(hospital.status)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>ICU Beds available</span>
                <span className={hospital.beds.icu > 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {hospital.beds.icu}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>ETA</span>
                <span className="text-slate-200">
                  {hospital.waitTime ? `${hospital.waitTime} min` : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="w-5 h-5 text-amber-300" />
          <h3 className="font-semibold text-white">Infrastructure</h3>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100%-3rem)]">
          {infrastructure.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#0b111a]/70"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{route.route}</p>
                  <p className="text-[11px] text-slate-500 truncate">{route.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {route.eta && (
                  <span className="text-[11px] text-slate-300 font-mono">{route.eta}</span>
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
