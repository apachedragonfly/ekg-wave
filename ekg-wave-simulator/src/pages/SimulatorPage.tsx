import React from 'react';
import WaveformCanvas from '../components/WaveformCanvas';
import SliderControl from '../components/SliderControl';
import RhythmToggle from '../components/RhythmToggle';
import { useSimulator } from '../context/SimulatorContext';

const SimulatorPage: React.FC = () => {
  const { heartRate, rhythm, prInterval, setHeartRate, setRhythm, setPrInterval } = useSimulator();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">EKG Simulator</h1>
      
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Simulator Controls</h2>
        
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
      
      <div className="mt-4">
        <WaveformCanvas />
      </div>
    </div>
  );
};

export default SimulatorPage; 