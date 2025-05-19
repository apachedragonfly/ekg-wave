import React from 'react';
import type { Lead } from '../types';

interface LeadSelectorProps {
  value: Lead;
  onChange: (lead: Lead) => void;
}

const LEAD_OPTIONS: { value: Lead; label: string }[] = [
  { value: 'I', label: 'I' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'aVR', label: 'aVR' },
  { value: 'aVL', label: 'aVL' },
  { value: 'aVF', label: 'aVF' },
  { value: 'V1', label: 'V1' },
  { value: 'V2', label: 'V2' },
  { value: 'V3', label: 'V3' },
  { value: 'V4', label: 'V4' },
  { value: 'V5', label: 'V5' },
  { value: 'V6', label: 'V6' },
];

const LeadSelector: React.FC<LeadSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-1">
      <label htmlFor="lead-select" className="block text-xs font-medium text-gray-700 mb-0.5">
        Lead
      </label>
      <select
        id="lead-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Lead)}
        className="block w-full rounded-md border border-gray-300 py-0.5 px-2 text-xs bg-white"
      >
        {LEAD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LeadSelector; 