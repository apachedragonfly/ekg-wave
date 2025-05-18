import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// Define the shape of our context state
interface SimulatorContextState {
  heartRate: number;
  rhythm: string;
  prInterval: number;
  setHeartRate: (rate: number) => void;
  setRhythm: (rhythm: string) => void;
  setPrInterval: (interval: number) => void;
}

// Create context with a default undefined value
const SimulatorContext = createContext<SimulatorContextState | undefined>(undefined);

// Define the rhythm types
export const RHYTHM_TYPES = {
  NSR: 'NSR',
  AFIB: 'AFib',
  VTACH: 'VTach'
} as const;

// Props for our provider component
interface SimulatorProviderProps {
  children: ReactNode;
}

// Provider component that wraps the application
export const SimulatorProvider: React.FC<SimulatorProviderProps> = ({ children }) => {
  // State for EKG simulator parameters
  const [heartRate, setHeartRate] = useState<number>(70); // Default 70 BPM
  const [rhythm, setRhythm] = useState<string>(RHYTHM_TYPES.NSR); // Default Normal Sinus Rhythm
  const [prInterval, setPrInterval] = useState<number>(0.16); // Default 160ms (0.16s)

  // Value object that will be provided to consumers
  const value: SimulatorContextState = {
    heartRate,
    rhythm,
    prInterval,
    setHeartRate,
    setRhythm,
    setPrInterval
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
};

// Custom hook for consuming our context
export const useSimulator = (): SimulatorContextState => {
  const context = useContext(SimulatorContext);
  
  if (context === undefined) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  
  return context;
}; 