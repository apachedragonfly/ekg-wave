import React from 'react';
import { useSimulator } from './context/SimulatorContext';
import SimulatorPage from './pages/SimulatorPage';

export default function App() {
  const { heartRate, rhythm } = useSimulator();

  return (
    <div className="app min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">EKG Simulator v0.1</h1>
        <p className="text-sm">Current: {heartRate} BPM, {rhythm}</p>
      </header>
      <main className="p-4">
        <SimulatorPage />
      </main>
    </div>
  );
}
