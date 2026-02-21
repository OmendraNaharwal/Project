import { useState } from 'react';
import { User, Heart, Activity, Gauge, FileText, Zap, AlertCircle, Calendar, AlertTriangle } from 'lucide-react';
import { mockPatient } from '../data/mockData';

const PatientTriageForm = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState({
    name: mockPatient.name,
    age: mockPatient.age,
    heartRate: mockPatient.heartRate,
    spO2: mockPatient.spO2,
    bloodPressure: mockPatient.bloodPressure,
    chiefComplaint: mockPatient.chiefComplaint,
    reportedSeverity: mockPatient.reportedSeverity || 'moderate'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.age || formData.age < 0 || formData.age > 150) {
      newErrors.age = 'Valid age required';
    }
    if (!formData.heartRate || formData.heartRate < 30 || formData.heartRate > 250) {
      newErrors.heartRate = 'Invalid';
    }
    if (!formData.spO2 || formData.spO2 < 50 || formData.spO2 > 100) {
      newErrors.spO2 = 'Invalid';
    }
    if (!formData.bloodPressure.trim()) newErrors.bloodPressure = 'Required';
    if (!formData.chiefComplaint.trim()) newErrors.chiefComplaint = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getVitalColor = (type, value) => {
    if (!value) return 'border-white/10';
    switch (type) {
      case 'heartRate':
        if (value < 50 || value > 120) return 'border-red-500/60 bg-red-500/5';
        if (value < 60 || value > 100) return 'border-amber-500/60 bg-amber-500/5';
        return 'border-emerald-500/50 bg-emerald-500/5';
      case 'spO2':
        if (value < 90) return 'border-red-500/60 bg-red-500/5';
        if (value < 95) return 'border-amber-500/60 bg-amber-500/5';
        return 'border-emerald-500/50 bg-emerald-500/5';
      default:
        return 'border-white/10';
    }
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/20">
            <User className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Patient Intake</h3>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.25em]">Signal Capture</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* Name & Age Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-[0.2em]">
              Patient Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className={`w-full pl-10 pr-3 py-2.5 bg-[#0b111a]/70 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all ${errors.name ? 'border-red-500/70' : 'border-white/10'}`}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-[0.2em]">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                className={`w-full pl-10 pr-2 py-2.5 bg-[#0b111a]/70 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all ${errors.age ? 'border-red-500/70' : 'border-white/10'}`}
              />
            </div>
          </div>
        </div>

        {/* Vitals Grid */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-[0.2em]">
            Vitals
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Heart Rate */}
            <div className={`p-3 rounded-lg border transition-all bg-[#0b111a]/70 ${getVitalColor('heartRate', formData.heartRate)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">HR</span>
              </div>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="72"
                className="w-full bg-transparent text-white text-lg font-mono focus:outline-none"
              />
              <span className="text-xs text-slate-500">bpm</span>
            </div>

            {/* SpO2 */}
            <div className={`p-3 rounded-lg border transition-all bg-[#0b111a]/70 ${getVitalColor('spO2', formData.spO2)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">SpO2</span>
              </div>
              <input
                type="number"
                name="spO2"
                value={formData.spO2}
                onChange={handleChange}
                placeholder="98"
                className="w-full bg-transparent text-white text-lg font-mono focus:outline-none"
              />
              <span className="text-xs text-slate-500">%</span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3 rounded-lg border border-white/10 bg-[#0b111a]/70">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">BP</span>
              </div>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="120/80"
                className="w-full bg-transparent text-white text-lg font-mono focus:outline-none"
              />
              <span className="text-xs text-slate-500">mmHg</span>
            </div>
          </div>
        </div>

        {/* Reported Severity */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Reported Severity
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'mild', label: 'Mild', description: 'Minor discomfort' },
              { value: 'moderate', label: 'Moderate', description: 'Significant pain' },
              { value: 'severe', label: 'Severe', description: 'Intense symptoms' },
              { value: 'critical', label: 'Critical', description: 'Life-threatening' }
            ].map(({ value, label, description }) => {
              const isSelected = formData.reportedSeverity === value;
              const colors = {
                mild: isSelected ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400' : '',
                moderate: isSelected ? 'border-amber-500/60 bg-amber-500/15 text-amber-400' : '',
                severe: isSelected ? 'border-orange-500/60 bg-orange-500/15 text-orange-400' : '',
                critical: isSelected ? 'border-red-500/60 bg-red-500/15 text-red-400' : ''
              };
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reportedSeverity: value }))}
                  className={`p-2.5 rounded-lg border transition-all text-center ${
                    isSelected
                      ? colors[value]
                      : 'border-white/10 bg-[#0b111a]/70 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="flex-1 flex flex-col">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-[0.2em]">
            Chief Complaint
          </label>
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <textarea
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder="Describe presenting symptoms..."
              className={`w-full h-full min-h-[100px] pl-10 pr-3 py-2.5 bg-[#0b111a]/70 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all resize-none ${errors.chiefComplaint ? 'border-red-500/70' : 'border-white/10'}`}
            />
          </div>
          {errors.chiefComplaint && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.chiefComplaint}
            </p>
          )}
        </div>

        {/* Dispatch Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3.5 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all border ${
            isProcessing 
              ? 'bg-white/5 border-white/10 cursor-not-allowed text-slate-400' 
              : 'bg-[#111826] border-white/10 hover:border-emerald-400/40 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-emerald-300" />
              DISPATCH
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientTriageForm;
