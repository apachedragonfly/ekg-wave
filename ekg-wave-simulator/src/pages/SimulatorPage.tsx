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
    qrsWidth,
    qtInterval,
    amplitudeGain,
    showLabels,
    showNoise,
    selectedLead,
    setHeartRate, 
    setRhythm, 
    setPrInterval,
    setQrsWidth,
    setQtInterval,
    setAmplitudeGain,
    setShowLabels,
    setShowNoise,
    setSelectedLead,
    resetSettings
  } = useSimulator();

  return (
    <div className="container mx-auto p-2 max-w-screen-2xl">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold">EKG Simulator</h1>
        <button
          onClick={resetSettings}
          className="px-2 py-0.5 text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-11 overflow-x-auto">
          <WaveformCanvas />
        </div>
        
        <div className="lg:col-span-1">
          <div className="p-2 bg-white shadow-md rounded-lg mb-2">
            <h2 className="text-xs font-semibold mb-1">Cardiac Timing</h2>
            
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
              unit=" sec"
            />

            <SliderControl
              label="QRS Width:"
              value={qrsWidth}
              min={0.06}
              max={0.12}
              step={0.01}
              onChange={setQrsWidth}
              unit=" sec"
            />

            <SliderControl
              label="QT Interval:"
              value={qtInterval}
              min={0.30}
              max={0.50}
              step={0.01}
              onChange={setQtInterval}
              unit=" sec"
            />

            <SliderControl
              label="Amplitude:"
              value={amplitudeGain}
              min={0.5}
              max={2.0}
              step={0.1}
              onChange={setAmplitudeGain}
              unit="×"
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