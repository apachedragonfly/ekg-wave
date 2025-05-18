import React from 'react';
import { useSimulator } from './context/SimulatorContext';
import SimulatorPage from './pages/SimulatorPage';

export default function App() {
  const { heartRate, rhythm, selectedLead } = useSimulator();

  return (
    <div className="app min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-2 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">EKG Simulator</h1>
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
              className="text-sm text-white hover:text-blue-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <main className="py-2">
        <SimulatorPage />
      </main>
      <footer className="bg-gray-800 text-white p-2 mt-4">
        <div className="container mx-auto text-center text-xs">
          <p>EKG Simulator - For Educational Purposes Only</p>
          <p className="text-gray-400">Not for clinical use</p>
        </div>
      </footer>
    </div>
  );
}
