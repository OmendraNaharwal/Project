import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const Header = () => {
  const [time, setTime] = useState(new Date());

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
    <header className="bg-slate-900 border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-white">NERVE</span>
            </h1>
            <p className="text-xs text-slate-400 tracking-wider uppercase">
              AI Medical Referral Command
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-8">
          {/* Live Status */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="relative flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-emerald-400 font-medium text-sm">SYSTEM LIVE</span>
          </div>

          {/* Digital Clock */}
          <div className="text-right">
            <div className="font-mono text-2xl text-white tracking-wider">
              {formatTime(time)}
            </div>
            <div className="text-xs text-slate-500 tracking-wide">
              {formatDate(time)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
