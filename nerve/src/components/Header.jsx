import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Settings, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [time, setTime] = useState(new Date());
  const { location, locationLoading, locationError, fetchLocation } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="bg-gradient-to-b from-[#0f141c]/90 to-[#0b1016]/90 border-b border-white/5 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.3} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-emerald-400/30 bg-emerald-500/80" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">NERVE</h1>
            <p className="text-[11px] text-slate-400 tracking-[0.35em] uppercase">
              Medical Referral Command
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 shadow-inner">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              <div className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-40" />
            </div>
            <span className="text-emerald-300 font-medium text-xs tracking-wide">SYSTEM LIVE</span>
          </div>

          {/* Location Button */}
          <div className="flex items-center gap-2">
            {location && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <div className="text-xs">
                  <div>
                    <span className="text-cyan-300 font-medium">{location.city}</span>
                    {location.state && <span className="text-slate-400">, {location.state}</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {location.lat}, {location.lng}
                  </div>
                </div>
              </div>
            )}
            
            {locationError && (
              <span className="text-xs text-red-400">{locationError}</span>
            )}

            <button
              onClick={fetchLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 
                         border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg 
                         text-cyan-400 text-xs font-medium transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Get current location"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {locationLoading ? 'Locating...' : location ? 'Update' : 'Location'}
              </span>
            </button>
          </div>

          <div className="text-right">
            <div className="font-mono text-2xl text-white tracking-widest">
              {formatTime(time)}
            </div>
            <div className="text-[11px] text-slate-500 tracking-wide">
              {formatDate(time)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Link
              to="/hospitals"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Hospital Settings"
            >
              <Settings className="w-5 h-5 hover:text-emerald-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
