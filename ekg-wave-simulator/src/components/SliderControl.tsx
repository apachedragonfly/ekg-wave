import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: boolean;
  unit?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue = true,
  unit = ''
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {displayValue && `${value}${unit}`}
      </label>
      <div className="flex items-center space-x-2">
        <span className="text-xs">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs">{max}</span>
      </div>
    </div>
  );
};

export default SliderControl; 