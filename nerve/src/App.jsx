import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PatientTriageForm from './components/PatientTriageForm';
import VerdictEngine from './components/VerdictEngine';
import LiveTelemetry from './components/LiveTelemetry';
import HospitalManagerPage from './pages/HospitalManagerPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { processReferral } from './services/api';

// Protected Route component - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function MainApp() {
  const [verdict, setVerdict] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);

  const handlePatientSubmit = async (patientData) => {
    setIsProcessing(true);
    setVerdict(null);
    setError(null);
    
    try {
      // Call backend API for AI-powered referral (include location if available)
      const aiVerdict = await processReferral(patientData, patientLocation);
      setVerdict(aiVerdict);
    } catch (err) {
      console.error('Referral processing error:', err);
      setError('Failed to process referral. Please check if the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 app-shell">
      <Header onLocationChange={setPatientLocation} />

      <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6">
        <div className="h-full grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="h-full min-h-[520px] lg:min-h-0">
              <PatientTriageForm 
                onSubmit={handlePatientSubmit}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="h-full min-h-[520px]">
              <VerdictEngine 
                verdict={verdict}
                isProcessing={isProcessing}
                error={error}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="h-full min-h-[520px] lg:min-h-0">
              <LiveTelemetry />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>NERVE v1.0 • Hackathon Build</span>
          <span>Powered by Groq (Llama 3.3) • Explainable AI</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/triage" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute><HospitalManagerPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
