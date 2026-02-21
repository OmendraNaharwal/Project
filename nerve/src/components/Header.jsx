import { useState, useEffect } from 'react';
import { Activity, UserCircle2, MoreHorizontal } from 'lucide-react';

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

          <div className="text-right">
            <div className="font-mono text-2xl text-white tracking-widest">
              {formatTime(time)}
            </div>
            <div className="text-[11px] text-slate-500 tracking-wide">
              {formatDate(time)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <UserCircle2 className="w-6 h-6" />
            <MoreHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
