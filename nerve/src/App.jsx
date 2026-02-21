import { useState } from 'react';
import Header from './components/Header';
import PatientTriageForm from './components/PatientTriageForm';
import VerdictEngine from './components/VerdictEngine';
import LiveTelemetry from './components/LiveTelemetry';
import { generateAIVerdict } from './data/mockData';

function App() {
  const [verdict, setVerdict] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePatientSubmit = async (patientData) => {
    setIsProcessing(true);
    setVerdict(null);
    
    // Simulate API call delay (2-3 seconds for AI processing)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate mock verdict using the data function
    const aiVerdict = generateAIVerdict(patientData);
    
    setVerdict(aiVerdict);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - 12 Column Grid */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="h-full grid grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column - Signal Input (3 cols on lg) */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3">
            <div className="h-full min-h-[500px] lg:min-h-0">
              <PatientTriageForm 
                onSubmit={handlePatientSubmit}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Middle Column - Verdict Engine (6 cols on lg) */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-6">
            <div className="h-full min-h-[400px]">
              <VerdictEngine 
                verdict={verdict}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Right Column - Live Telemetry (3 cols on lg) */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3">
            <div className="h-full min-h-[500px] lg:min-h-0">
              <LiveTelemetry />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>NERVE v1.0 • Hackathon Build</span>
          <span>Powered by Gemini 1.5 Flash • Explainable AI</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
