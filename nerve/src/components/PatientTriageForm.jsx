import { useState } from 'react';
import { User, Heart, Activity, Gauge, FileText, Zap, AlertCircle, Calendar } from 'lucide-react';
import { mockPatient } from '../data/mockData';

const PatientTriageForm = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState({
    name: mockPatient.name,
    age: mockPatient.age,
    heartRate: mockPatient.heartRate,
    spO2: mockPatient.spO2,
    bloodPressure: mockPatient.bloodPressure,
    chiefComplaint: mockPatient.chiefComplaint
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
    if (!value) return 'border-slate-600';
    switch (type) {
      case 'heartRate':
        if (value < 50 || value > 120) return 'border-red-500 bg-red-500/5';
        if (value < 60 || value > 100) return 'border-amber-500 bg-amber-500/5';
        return 'border-emerald-500 bg-emerald-500/5';
      case 'spO2':
        if (value < 90) return 'border-red-500 bg-red-500/5';
        if (value < 95) return 'border-amber-500 bg-amber-500/5';
        return 'border-emerald-500 bg-emerald-500/5';
      default:
        return 'border-slate-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Signal Input</h3>
            <p className="text-xs text-slate-400">Patient Triage Data</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* Name & Age Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
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
                className={`w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${errors.name ? 'border-red-500' : 'border-slate-600'}`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
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
                className={`w-full pl-10 pr-2 py-2.5 bg-slate-900/50 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${errors.age ? 'border-red-500' : 'border-slate-600'}`}
              />
            </div>
          </div>
        </div>

        {/* Vitals Grid */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Vitals Grid
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Heart Rate */}
            <div className={`p-3 rounded-lg border transition-all ${getVitalColor('heartRate', formData.heartRate)}`}>
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
            <div className={`p-3 rounded-lg border transition-all ${getVitalColor('spO2', formData.spO2)}`}>
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
            <div className="p-3 rounded-lg border border-slate-600 bg-slate-900/30">
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

        {/* Chief Complaint */}
        <div className="flex-1 flex flex-col">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Chief Complaint
          </label>
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <textarea
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder="Describe presenting symptoms..."
              className={`w-full h-full min-h-[100px] pl-10 pr-3 py-2.5 bg-slate-900/50 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none ${errors.chiefComplaint ? 'border-red-500' : 'border-slate-600'}`}
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
          className={`w-full py-3.5 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
            isProcessing 
              ? 'bg-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              DISPATCH
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientTriageForm;
