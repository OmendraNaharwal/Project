import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Building2, AlertCircle, Loader2, Mail, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalId: '',
    hospitalCode: ''
  });

  useEffect(() => {
    // Only redirect if authenticated AND not showing registration success
    if (isAuthenticated && !registrationSuccess) {
      navigate('/triage');
    }
  }, [isAuthenticated, navigate, registrationSuccess]);

  useEffect(() => {
    // Fetch hospitals for registration dropdown
    if (!isLogin) {
      fetchHospitals();
    }
  }, [isLogin]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/hospitals`);
      const data = await response.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registrationSuccess.hospitalCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        if (!formData.hospitalCode.trim()) {
          throw new Error('Please enter your Hospital ID');
        }
        await login(formData.hospitalCode, formData.password);
        navigate('/triage');
      } else {
        if (!formData.hospitalId) {
          throw new Error('Please select your hospital');
        }
        const result = await register(formData.email, formData.password, formData.hospitalId);
        // Show success with hospital code
        setRegistrationSuccess({
          hospitalCode: result.hospitalCode,
          message: result.message || 'Registration successful!'
        });
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Show registration success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                <Activity className="w-6 h-6 text-white" strokeWidth={2.3} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">NERVE</h1>
                <p className="text-[10px] text-slate-400 tracking-[0.3em] uppercase">Hospital Portal</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">Registration Successful!</h2>
            <p className="text-slate-400 mb-6">Save your Hospital ID - you'll need it to sign in.</p>
            
            <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-400 mb-2">Your Hospital ID</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                  {registrationSuccess.hospitalCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6 text-left">
              <p className="text-amber-400 text-sm">
                <strong>Important:</strong> Write down your Hospital ID. You won't be able to recover it if lost.
              </p>
            </div>
            
            <button
              onClick={() => {
                setRegistrationSuccess(null);
                setIsLogin(true);
                setFormData({ ...formData, hospitalCode: registrationSuccess.hospitalCode, password: '' });
              }}
              className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium transition-colors"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">NERVE</h1>
              <p className="text-[10px] text-slate-400 tracking-[0.3em] uppercase">Hospital Portal</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {isLogin ? 'Hospital Sign In' : 'Register Your Hospital'}
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {isLogin ? (
              // LOGIN VIEW - Hospital Code text input
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Hospital ID</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.hospitalCode}
                    onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                    placeholder="NERVE-XXXXXX"
                    required
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Enter the Hospital ID provided during registration</p>
              </div>
            ) : (
              // REGISTRATION VIEW - Hospital dropdown + other fields
              <>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Select Hospital</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={formData.hospitalId}
                      onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select hospital...</option>
                      {hospitals.map((h) => (
                        <option key={h._id} value={h._id} className="bg-[#0f141c]">
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      placeholder="Enter your email"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password - always shown */}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Register & Get Hospital ID'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isLogin ? "Need to register your hospital? " : "Already have a Hospital ID? "}
              <span className="text-emerald-400">{isLogin ? 'Sign Up' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
