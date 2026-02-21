import { useState, useEffect } from 'react';
import { 
  Brain, 
  MapPin, 
  Clock, 
  Route, 
  Building2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';

const NERVEVerdict = ({ verdict, isProcessing }) => {
  const [displayedReasoning, setDisplayedReasoning] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for AI reasoning
  useEffect(() => {
    if (verdict?.reasoning && !isProcessing) {
      setIsTyping(true);
      setDisplayedReasoning('');
      
      let index = 0;
      const text = verdict.reasoning;
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedReasoning(prev => prev + text.charAt(index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 15);

      return () => clearInterval(typeInterval);
    }
  }, [verdict, isProcessing]);

  // Idle state - no verdict yet
  if (!verdict && !isProcessing) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">NERVE AI Ready</h2>
          <p className="text-slate-400 max-w-md">
            Submit patient vitals to receive an AI-powered referral recommendation 
            with explainable reasoning.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Hospital Data Synced</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Road Status Updated</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/50 p-8 shadow-xl shadow-blue-500/10">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center animate-pulse">
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-blue-500/50 border-t-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Signals...</h2>
          <p className="text-slate-400 max-w-md">
            NERVE is synthesizing hospital telemetry, road conditions, and patient vitals 
            to determine the optimal referral destination.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
              <Activity className="w-4 h-4" />
              <span>Processing patient vitals...</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Building2 className="w-4 h-4" />
              <span>Querying hospital capacity...</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 animate-pulse" style={{ animationDelay: '1s' }}>
              <Route className="w-4 h-4" />
              <span>Checking route conditions...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verdict display state
  const urgencyColors = {
    critical: 'border-red-500/50 shadow-red-500/20',
    high: 'border-amber-500/50 shadow-amber-500/20',
    moderate: 'border-blue-500/50 shadow-blue-500/20',
    low: 'border-emerald-500/50 shadow-emerald-500/20'
  };

  const urgencyBadgeColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    moderate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 p-6 shadow-xl ${urgencyColors[verdict.urgency] || urgencyColors.moderate}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">NERVE Verdict</h2>
            <p className="text-sm text-slate-400">AI-Powered Referral Recommendation</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${urgencyBadgeColors[verdict.urgency] || urgencyBadgeColors.moderate}`}>
          {verdict.urgency?.toUpperCase()} PRIORITY
        </span>
      </div>

      {/* Recommended Destination Alert */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-emerald-400 font-medium mb-1">RECOMMENDED DESTINATION</p>
            <h3 className="text-2xl font-bold text-white mb-2">{verdict.hospital}</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{verdict.distance}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">ETA: {verdict.eta}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{verdict.availableBeds} beds available</span>
              </div>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* Route Info */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Route className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-white">Recommended Route</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300">Current Location</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">
            {verdict.route}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-white font-medium">{verdict.hospital}</span>
        </div>
      </div>

      {/* AI Reasoning Section */}
      <div className="bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-white">AI Reasoning</h4>
          <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">
            Gemini 1.5 Flash
          </span>
        </div>
        <div className="text-slate-300 leading-relaxed">
          {displayedReasoning}
          {isTyping && <span className="typewriter-cursor text-cyan-400">|</span>}
        </div>
      </div>

      {/* Rejected Alternatives */}
      {verdict.alternatives && verdict.alternatives.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-slate-400">Alternatives Considered & Rejected</h4>
          </div>
          <div className="space-y-2">
            {verdict.alternatives.map((alt, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-900/30 rounded">
                <span className="text-slate-400">{alt.hospital}</span>
                <span className="text-red-400">{alt.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NERVEVerdict;
