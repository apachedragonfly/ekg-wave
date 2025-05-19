import React from 'react';
import { useSimulator } from './context/SimulatorContext';
import SimulatorPage from './pages/SimulatorPage';

export default function App() {
  const { heartRate, rhythm, selectedLead } = useSimulator();

  return (
    <div className="app min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-1 shadow-md">
        <div className="container mx-auto max-w-screen-2xl flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold">EKG Simulator</h1>
            <p className="text-xs opacity-80">
              {rhythm === 'normal' ? 'NSR' : 
               rhythm === 'afib' ? 'AFib' : 'VTach'} 
              • {heartRate} BPM • {selectedLead}
            </p>
          </div>
          <div className="hidden md:block">
            <a 
              href="https://github.com/yourusername/ekg-wave-simulator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-white hover:text-blue-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <main className="py-1">
        <SimulatorPage />
      </main>
      <footer className="bg-gray-800 text-white p-1 mt-2">
        <div className="container mx-auto max-w-screen-2xl text-center text-xs">
          <p>EKG Simulator - Educational Use Only • Not for clinical use</p>
        </div>
      </footer>
    </div>
  );
}
