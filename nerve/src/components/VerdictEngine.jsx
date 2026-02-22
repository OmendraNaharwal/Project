import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, Brain, Zap, XCircle, CheckCircle2, AlertCircle, Building2, Navigation } from 'lucide-react';

const VerdictEngine = ({ verdict, isProcessing, error }) => {
  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-xl border border-red-500/30 p-8">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/30">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
        <p className="text-red-400 text-center text-sm max-w-xs mb-4">
          {error}
        </p>
        <p className="text-slate-500 text-center text-xs max-w-xs">
          Make sure the backend server is running on port 5000
        </p>
      </div>
    );
  }

  // Idle state
  if (!verdict && !isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-xl border border-slate-700/50 p-8">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
            <Brain className="w-12 h-12 text-slate-500" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-600 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Verdict Engine Standby</h3>
        <p className="text-slate-400 text-center text-sm max-w-xs">
          Enter patient data and dispatch to receive AI-powered referral recommendation
        </p>
      </div>
    );
  }

  // Processing state with neural animation
  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-xl border border-emerald-500/30 p-8">
        <div className="relative mb-6">
          {/* Pulsing brain animation */}
          <motion.div 
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain className="w-12 h-12 text-emerald-400" />
          </motion.div>
          
          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-emerald-500 rounded-full"
              style={{ top: '50%', left: '50%' }}
              animate={{
                x: [0, Math.cos((i * 2 * Math.PI) / 3) * 50, 0],
                y: [0, Math.sin((i * 2 * Math.PI) / 3) * 50, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
          
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">Analyzing Signals...</h3>
        <div className="space-y-1 text-center">
          <motion.p 
            className="text-emerald-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing patient vitals...
          </motion.p>
          <motion.p 
            className="text-cyan-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            Querying hospital telemetry...
          </motion.p>
          <motion.p 
            className="text-blue-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          >
            Evaluating route conditions...
          </motion.p>
        </div>
      </div>
    );
  }

  // Verdict display
  const urgencyBadge = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    MODERATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="h-full flex flex-col bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">NERVE Verdict</h3>
                <p className="text-xs text-slate-400">Generated at {verdict.timestamp}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgencyBadge[verdict.urgency]}`}>
              {verdict.urgency}
            </span>
          </div>
        </div>

        {/* AI Reasoning - Clinical Decision Rationale */}
        <div className="flex-1 mx-4 my-4 overflow-y-auto">
          {/* Clinical Decision Rationale Header */}
          <div className="mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Clinical Decision Rationale</p>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{verdict.hospital}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Navigation className="w-3 h-3" /> Optimal Route
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" /> ETA {verdict.eta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Summary Box */}
          <motion.div 
            className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/50 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Decision Summary</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400 w-28">Severity Level:</span>
                <span className={`text-xs font-semibold ${
                  verdict.urgency === 'CRITICAL' ? 'text-red-400' :
                  verdict.urgency === 'HIGH' ? 'text-amber-400' :
                  verdict.urgency === 'MODERATE' ? 'text-blue-400' : 'text-emerald-400'
                }`}>{verdict.urgency}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 w-28">Required Specialty:</span>
                <span className="text-xs text-white font-medium">{verdict.specialty || 'General Emergency'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400 w-28">Selected Facility:</span>
                <span className="text-xs text-white font-medium">{verdict.hospital}</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400 w-28">Confidence Score:</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold">{verdict.matchScore || 85}%</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${verdict.matchScore || 85}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Facility Comparison */}
          {verdict.alternativeHospitals && verdict.alternativeHospitals.length > 0 && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Facility Comparison <span className="text-slate-500">(Top Candidates)</span>
              </h4>
              <div className="space-y-2">
                {/* Primary recommendation */}
                <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white font-medium">{verdict.hospital}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">{verdict.matchScore || 85}%</span>
                    <span>{verdict.distance || '8 km'}</span>
                    <span className="text-emerald-400">✓ Recommended</span>
                  </div>
                </div>
                {/* Alternatives */}
                {verdict.alternativeHospitals.slice(0, 2).map((alt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-300">{alt.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="text-cyan-400 font-medium">{alt.matchScore || (80 - idx * 5)}%</span>
                      <span>{alt.distance ? `${alt.distance} km` : ((idx + 2) * 8) + ' km'}</span>
                      {alt.reason && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertCircle className="w-3 h-3" /> {alt.reason}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Clinical Guidance */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Guidance</h4>
            <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
              {verdict.guidance ? (
                <ul className="space-y-1.5">
                  {verdict.guidance.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-slate-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {verdict.reasoning}
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerdictEngine;
