import React from 'react';
import type { Rhythm } from '../types';

interface RhythmToggleProps {
  value: Rhythm;
  onChange: (rhythm: Rhythm) => void;
}

const RHYTHM_OPTIONS = [
  { value: 'normal' as Rhythm, label: 'NSR' },
  { value: 'afib' as Rhythm, label: 'AFib' },
  { value: 'vtach' as Rhythm, label: 'VTach' },
];

const RhythmToggle: React.FC<RhythmToggleProps> = ({ value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Rhythm</label>
      <div className="flex flex-wrap gap-1">
        {RHYTHM_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RhythmToggle; 