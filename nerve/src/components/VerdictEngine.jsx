import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Route, AlertTriangle, Brain, Zap, XCircle } from 'lucide-react';

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
  const urgencyColors = {
    CRITICAL: 'border-red-500/50 bg-red-500/5',
    HIGH: 'border-amber-500/50 bg-amber-500/5',
    MODERATE: 'border-blue-500/50 bg-blue-500/5',
    LOW: 'border-emerald-500/50 bg-emerald-500/5'
  };

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

        {/* Decision Card */}
        <motion.div 
          className={`mx-4 mt-4 p-5 rounded-xl border-2 ${urgencyColors[verdict.urgency]}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <MapPin className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-1">
                Recommended Destination
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">{verdict.hospital}</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{verdict.route}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">ETA: {verdict.eta}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Reasoning */}
        <div className="flex-1 mx-4 my-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">AI Reasoning (XAI)</h4>
            <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded-full">
              Llama 3.3
            </span>
          </div>
          <motion.div 
            className="h-[calc(100%-2rem)] bg-slate-900/50 rounded-lg p-4 overflow-y-auto border border-slate-700/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {verdict.reasoning}
            </pre>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerdictEngine;
