import React from 'react';
import { RHYTHM_TYPES } from '../context/SimulatorContext';

interface RhythmToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const RhythmToggle: React.FC<RhythmToggleProps> = ({ value, onChange }) => {
  // Display names for rhythm types
  const rhythmLabels = {
    [RHYTHM_TYPES.NSR]: 'NSR (Normal Sinus Rhythm)',
    [RHYTHM_TYPES.AFIB]: 'AFib (Atrial Fibrillation)',
    [RHYTHM_TYPES.VTACH]: 'VTach (Ventricular Tachycardia)'
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Rhythm
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {Object.entries(rhythmLabels).map(([rhythmKey, label]) => (
          <option key={rhythmKey} value={rhythmKey}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RhythmToggle; 