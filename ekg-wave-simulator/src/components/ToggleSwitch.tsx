import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-1 mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-5 w-9 items-center rounded-full ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } transition-colors duration-200 focus:outline-none`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`${
            checked ? 'translate-x-5' : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch; 