import React from 'react';
import WaveformCanvas from '../components/WaveformCanvas';
import { useSimulator } from '../context/SimulatorContext';

const SimulatorPage: React.FC = () => {
  const { heartRate, rhythm, prInterval, setHeartRate, setRhythm } = useSimulator();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simulator Ready</h1>
      
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Simulator Controls</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heart Rate: {heartRate} BPM
          </label>
          <input 
            type="range" 
            min="40" 
            max="180" 
            value={heartRate} 
            onChange={(e) => setHeartRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rhythm
          </label>
          <select 
            value={rhythm} 
            onChange={(e) => setRhythm(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="NSR">NSR (Normal Sinus Rhythm)</option>
            <option value="AFib">AFib (Atrial Fibrillation)</option>
            <option value="VTach">VTach (Ventricular Tachycardia)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <WaveformCanvas />
      </div>
    </div>
  );
};

export default SimulatorPage; 