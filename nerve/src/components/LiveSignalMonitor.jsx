import { useState, useEffect } from 'react';
import { 
  Building2, 
  Route, 
  Bed, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  CloudRain,
  Construction,
  Car
} from 'lucide-react';

// Mock data for hospitals
const mockHospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    distance: '12 km',
    icuBeds: 2,
    totalBeds: 45,
    departments: ['Cardiac', 'Trauma', 'Neurology'],
    status: 'available',
    waitTime: '15 min'
  },
  {
    id: 2,
    name: 'St. Mary\'s Medical Center',
    distance: '8 km',
    icuBeds: 0,
    totalBeds: 32,
    departments: ['General', 'Pediatrics'],
    status: 'limited',
    waitTime: '45 min'
  },
  {
    id: 3,
    name: 'Regional Trauma Center',
    distance: '25 km',
    icuBeds: 5,
    totalBeds: 120,
    departments: ['Trauma', 'Burns', 'Cardiac', 'Neurosurgery'],
    status: 'available',
    waitTime: '10 min'
  },
  {
    id: 4,
    name: 'Community Health Clinic',
    distance: '3 km',
    icuBeds: 0,
    totalBeds: 8,
    departments: ['General'],
    status: 'full',
    waitTime: 'N/A'
  }
];

// Mock data for roads/infrastructure
const mockInfrastructure = [
  {
    id: 1,
    name: 'Highway 101 - North Route',
    status: 'clear',
    condition: 'Good conditions, light traffic',
    eta: '12 min',
    icon: 'route'
  },
  {
    id: 2,
    name: 'Highlands Road',
    status: 'blocked',
    condition: 'Flooded - Water level 2ft',
    eta: 'N/A',
    icon: 'flood'
  },
  {
    id: 3,
    name: 'Interstate 45',
    status: 'delayed',
    condition: 'Construction zone, expect delays',
    eta: '35 min',
    icon: 'construction'
  },
  {
    id: 4,
    name: 'County Road 7',
    status: 'clear',
    condition: 'Clear, moderate traffic',
    eta: '18 min',
    icon: 'route'
  }
];

const LiveSignalMonitor = () => {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [infrastructure, setInfrastructure] = useState(mockInfrastructure);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update some values to simulate real-time data
      setHospitals(prev => prev.map(hospital => ({
        ...hospital,
        icuBeds: Math.max(0, hospital.icuBeds + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
        waitTime: hospital.status !== 'full' ? `${Math.floor(Math.random() * 45 + 5)} min` : 'N/A'
      })));
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
      case 'clear':
        return 'text-emerald-400';
      case 'limited':
      case 'delayed':
        return 'text-amber-400';
      case 'full':
      case 'blocked':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'available':
      case 'clear':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'limited':
      case 'delayed':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'full':
      case 'blocked':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
      case 'clear':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'limited':
      case 'delayed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'full':
      case 'blocked':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getInfraIcon = (iconType) => {
    switch (iconType) {
      case 'flood':
        return <CloudRain className="w-5 h-5" />;
      case 'construction':
        return <Construction className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Signal Monitor</h2>
            <p className="text-sm text-slate-400">Real-time hospital & infrastructure status</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Hospital Status Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Hospital Telemetry</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {hospitals.map((hospital) => (
            <div 
              key={hospital.id}
              className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getStatusBg(hospital.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-white">{hospital.name}</h4>
                  <p className="text-xs text-slate-400">{hospital.distance} away</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hospital.status)} ${getStatusBg(hospital.status)}`}>
                  {getStatusIcon(hospital.status)}
                  {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">
                    <span className={hospital.icuBeds > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {hospital.icuBeds}
                    </span>
                    <span className="text-slate-400"> ICU</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-300">{hospital.waitTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">{hospital.departments.length} depts</span>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {hospital.departments.slice(0, 3).map((dept, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">
                    {dept}
                  </span>
                ))}
                {hospital.departments.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded">
                    +{hospital.departments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Status Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Road Infrastructure</h3>
        </div>
        
        <div className="space-y-2">
          {infrastructure.map((route) => (
            <div 
              key={route.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.01] ${getStatusBg(route.status)}`}
            >
              <div className="flex items-center gap-3">
                <div className={getStatusColor(route.status)}>
                  {getInfraIcon(route.icon)}
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">{route.name}</h4>
                  <p className="text-xs text-slate-400">{route.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">ETA</p>
                  <p className={`text-sm font-medium ${route.eta !== 'N/A' ? 'text-white' : 'text-red-400'}`}>
                    {route.eta}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                  {getStatusIcon(route.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveSignalMonitor;
