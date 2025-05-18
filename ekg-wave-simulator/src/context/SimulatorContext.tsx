import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Rhythm, Lead } from '../types';

// Define the shape of our context state
interface SimulatorContextType {
  heartRate: number;
  rhythm: Rhythm;
  prInterval: number;
  showLabels: boolean;
  showNoise: boolean;
  selectedLead: Lead;
  setHeartRate: (rate: number) => void;
  setRhythm: (rhythm: Rhythm) => void;
  setPrInterval: (interval: number) => void;
  setShowLabels: (show: boolean) => void;
  setShowNoise: (show: boolean) => void;
  setSelectedLead: (lead: Lead) => void;
  resetSettings: () => void;
}

// Create context with a default undefined value
const defaultContextValue: SimulatorContextType = {
  heartRate: 70,
  rhythm: 'normal',
  prInterval: 0.16,
  showLabels: false,
  showNoise: false,
  selectedLead: 'II',
  setHeartRate: () => {},
  setRhythm: () => {},
  setPrInterval: () => {},
  setShowLabels: () => {},
  setShowNoise: () => {},
  setSelectedLead: () => {},
  resetSettings: () => {},
};

const SimulatorContext = createContext<SimulatorContextType>(defaultContextValue);

// Props for our provider component
interface SimulatorProviderProps {
  children: ReactNode;
}

// Provider component that wraps the application
export const SimulatorProvider: React.FC<SimulatorProviderProps> = ({ children }) => {
  // State for EKG simulator parameters
  const [heartRate, setHeartRate] = useState<number>(defaultContextValue.heartRate);
  const [rhythm, setRhythm] = useState<Rhythm>(defaultContextValue.rhythm);
  const [prInterval, setPrInterval] = useState<number>(defaultContextValue.prInterval);
  
  // UI toggle states
  const [showLabels, setShowLabels] = useState<boolean>(defaultContextValue.showLabels);
  const [showNoise, setShowNoise] = useState<boolean>(defaultContextValue.showNoise);
  const [selectedLead, setSelectedLead] = useState<Lead>(defaultContextValue.selectedLead);

  // Function to reset all settings to defaults
  const resetSettings = () => {
    setHeartRate(defaultContextValue.heartRate);
    setRhythm(defaultContextValue.rhythm);
    setPrInterval(defaultContextValue.prInterval);
    setShowLabels(defaultContextValue.showLabels);
    setShowNoise(defaultContextValue.showNoise);
    setSelectedLead(defaultContextValue.selectedLead);
  };

  // Value object that will be provided to consumers
  const value = {
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
    resetSettings,
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
};

// Custom hook for consuming our context
export const useSimulator = () => useContext(SimulatorContext); 