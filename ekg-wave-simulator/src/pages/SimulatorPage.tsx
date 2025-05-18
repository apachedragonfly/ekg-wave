import React from 'react';
import WaveformCanvas from '../components/WaveformCanvas';
import SliderControl from '../components/SliderControl';
import RhythmToggle from '../components/RhythmToggle';
import ToggleSwitch from '../components/ToggleSwitch';
import LeadSelector from '../components/LeadSelector';
import { useSimulator } from '../context/SimulatorContext';

const SimulatorPage: React.FC = () => {
  const { 
    heartRate, 
    rhythm, 
    prInterval, 
    showLabels,
    showNoise,
    selectedLead,
    setHeartRate, 
    setRhythm, 
    setPrInterval,
    setShowLabels,
    setShowNoise,
    setSelectedLead,
    resetSettings
  } = useSimulator();

  return (
    <div className="container mx-auto p-1 max-w-3xl">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold">EKG Simulator</h1>
        <button
          onClick={resetSettings}
          className="px-2 py-0.5 text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="md:col-span-2">
          <WaveformCanvas />
        </div>
        
        <div>
          <div className="p-2 bg-white shadow-md rounded-lg mb-2">
            <h2 className="text-xs font-semibold mb-1">Parameters</h2>
            
            <SliderControl
              label="Heart Rate:"
              value={heartRate}
              min={40}
              max={180}
              onChange={setHeartRate}
              unit=" BPM"
            />
            
            <RhythmToggle
              value={rhythm}
              onChange={setRhythm}
            />
            
            <SliderControl
              label="PR Interval:"
              value={prInterval}
              min={0.12}
              max={0.20}
              step={0.01}
              onChange={setPrInterval}
              unit=" s"
            />
          </div>
          
          <div className="p-2 bg-white shadow-md rounded-lg">
            <h2 className="text-xs font-semibold mb-1">Display</h2>
            
            <ToggleSwitch
              label="Show Labels"
              checked={showLabels}
              onChange={setShowLabels}
            />
            
            <ToggleSwitch
              label="Add Noise"
              checked={showNoise}
              onChange={setShowNoise}
            />
            
            <LeadSelector
              value={selectedLead}
              onChange={setSelectedLead}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage; 