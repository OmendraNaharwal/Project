import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Bed, CheckCircle, RefreshCw, Save, AlertCircle, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const HospitalManagerPage = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (token) {
      fetchMyHospital();
    }
  }, [token]);

  const fetchMyHospital = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/hospitals/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setHospital(data.data);
      } else {
        setError(data.message || 'Failed to fetch hospital');
      }
    } catch (err) {
      setError('Failed to fetch hospital data');
    }
    setLoading(false);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditForm({
      icuBeds: hospital.facilities?.icuBeds || 0,
      generalBeds: hospital.facilities?.generalBeds || 0,
      operationTheaters: hospital.facilities?.operationTheaters || 0,
      ventilators: hospital.facilities?.ventilators || 0,
      doctorsAvailable: hospital.staff?.doctors?.available || 0,
      doctorsTotal: hospital.staff?.doctors?.total || 0,
      nursesAvailable: hospital.staff?.nurses?.available || 0,
      nursesTotal: hospital.staff?.nurses?.total || 0,
      isAcceptingPatients: hospital.currentStatus?.isAcceptingPatients ?? true,
      emergencyAvailable: hospital.currentStatus?.emergencyAvailable ?? true,
      waitTime: hospital.currentStatus?.waitTime || 15,
      occupancyRate: hospital.currentStatus?.occupancyRate || 50
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveHospital = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE}/hospitals/my`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facilities: {
            icuBeds: parseInt(editForm.icuBeds) || 0,
            generalBeds: parseInt(editForm.generalBeds) || 0,
            operationTheaters: parseInt(editForm.operationTheaters) || 0,
            ventilators: parseInt(editForm.ventilators) || 0
          },
          staff: {
            doctors: {
              available: parseInt(editForm.doctorsAvailable) || 0,
              total: parseInt(editForm.doctorsTotal) || 0
            },
            nurses: {
              available: parseInt(editForm.nursesAvailable) || 0,
              total: parseInt(editForm.nursesTotal) || 0
            }
          },
          currentStatus: {
            isAcceptingPatients: editForm.isAcceptingPatients,
            emergencyAvailable: editForm.emergencyAvailable,
            waitTime: parseInt(editForm.waitTime) || 15,
            occupancyRate: parseInt(editForm.occupancyRate) || 50
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHospital(data.data);
        setIsEditing(false);
        setEditForm({});
        setSuccess('Hospital data updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update hospital');
      }
    } catch (err) {
      setError('Failed to save changes');
    }
    setSaving(false);
  };

  const quickToggle = async (field) => {
    setSaving(true);
    try {
      const currentValue = hospital.currentStatus?.[field];
      
      const response = await fetch(`${API_BASE}/hospitals/my`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentStatus: {
            [field]: !currentValue
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setHospital(data.data);
      }
    } catch (err) {
      setError('Failed to update status');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center text-slate-400">
        {error || 'Hospital not found'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#0f141c]/90 to-[#0b1016]/90 border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/triage"
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Triage</span>
            </Link>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-lg font-semibold text-white">Hospital Dashboard</h1>
                <p className="text-xs text-slate-400">Welcome, {user?.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchMyHospital}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Hospital Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Hospital Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{hospital.name}</h2>
                <p className="text-slate-400 mt-1">
                  {hospital.specializations?.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => quickToggle('emergencyAvailable')}
                  disabled={saving}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hospital.currentStatus?.emergencyAvailable
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}
                >
                  {hospital.currentStatus?.emergencyAvailable ? 'Emergency Active' : 'Emergency Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            {isEditing ? (
              /* Edit Form */
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">Edit Hospital Data</h3>
                
                {/* Facilities */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Facilities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">ICU Beds</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.icuBeds}
                        onChange={(e) => setEditForm({ ...editForm, icuBeds: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">General Beds</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.generalBeds}
                        onChange={(e) => setEditForm({ ...editForm, generalBeds: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Operation Theaters</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.operationTheaters}
                        onChange={(e) => setEditForm({ ...editForm, operationTheaters: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Ventilators</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.ventilators}
                        onChange={(e) => setEditForm({ ...editForm, ventilators: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Staff */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Staff</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Doctors Available</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.doctorsAvailable}
                        onChange={(e) => setEditForm({ ...editForm, doctorsAvailable: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Doctors Total</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.doctorsTotal}
                        onChange={(e) => setEditForm({ ...editForm, doctorsTotal: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nurses Available</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.nursesAvailable}
                        onChange={(e) => setEditForm({ ...editForm, nursesAvailable: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nurses Total</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.nursesTotal}
                        onChange={(e) => setEditForm({ ...editForm, nursesTotal: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Current Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Wait Time (min)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.waitTime}
                        onChange={(e) => setEditForm({ ...editForm, waitTime: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Occupancy Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.occupancyRate}
                        onChange={(e) => setEditForm({ ...editForm, occupancyRate: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveHospital}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                      <Bed className="w-5 h-5" />
                      <span className="text-sm">ICU Beds</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{hospital.facilities?.icuBeds || 0}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Bed className="w-5 h-5" />
                      <span className="text-sm">General Beds</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{hospital.facilities?.generalBeds || 0}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Doctors</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {hospital.staff?.doctors?.available || 0}
                      <span className="text-sm text-slate-400">/{hospital.staff?.doctors?.total || 0}</span>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">Wait Time</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">{hospital.currentStatus?.waitTime || 15} min</div>
                  </div>
                </div>

                {/* More Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                    <h4 className="text-sm font-medium text-slate-400 mb-4">Facilities</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operation Theaters</span>
                        <span className="text-white font-medium">{hospital.facilities?.operationTheaters || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ventilators</span>
                        <span className="text-white font-medium">{hospital.facilities?.ventilators || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ambulances</span>
                        <span className="text-white font-medium">{hospital.facilities?.ambulances || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                    <h4 className="text-sm font-medium text-slate-400 mb-4">Staff & Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nurses Available</span>
                        <span className="text-white font-medium">
                          {hospital.staff?.nurses?.available || 0}/{hospital.staff?.nurses?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Occupancy Rate</span>
                        <span className="text-white font-medium">{hospital.currentStatus?.occupancyRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hospital Rating</span>
                        <span className="text-amber-400 font-medium">{hospital.rating || 'N/A'} ★</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={startEditing}
                    className="px-5 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
                  >
                    Edit Hospital Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalManagerPage;
