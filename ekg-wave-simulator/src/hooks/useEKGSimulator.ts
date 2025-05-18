import { useState, useEffect, useCallback } from 'react';
import { generateWaveform } from '../utils/waveformGenerator';
import type { Rhythm, Lead, WaveformPoint } from '../types';

interface UseEKGSimulatorProps {
  initialHeartRate?: number;
  initialRhythm?: Rhythm;
  initialPrInterval?: number;
  initialShowLabels?: boolean;
  initialShowNoise?: boolean;
  initialLead?: Lead;
}

interface UseEKGSimulatorReturn {
  heartRate: number;
  rhythm: Rhythm;
  prInterval: number;
  showLabels: boolean;
  showNoise: boolean;
  selectedLead: Lead;
  waveformData: WaveformPoint[];
  setHeartRate: (rate: number) => void;
  setRhythm: (rhythm: Rhythm) => void;
  setPrInterval: (interval: number) => void;
  setShowLabels: (show: boolean) => void;
  setShowNoise: (show: boolean) => void;
  setSelectedLead: (lead: Lead) => void;
}

export function useEKGSimulator({
  initialHeartRate = 70,
  initialRhythm = 'normal',
  initialPrInterval = 0.16,
  initialShowLabels = false,
  initialShowNoise = false,
  initialLead = 'II'
}: UseEKGSimulatorProps = {}): UseEKGSimulatorReturn {
  // State for EKG parameters
  const [heartRate, setHeartRate] = useState<number>(initialHeartRate);
  const [rhythm, setRhythm] = useState<Rhythm>(initialRhythm);
  const [prInterval, setPrInterval] = useState<number>(initialPrInterval);
  const [showLabels, setShowLabels] = useState<boolean>(initialShowLabels);
  const [showNoise, setShowNoise] = useState<boolean>(initialShowNoise);
  const [selectedLead, setSelectedLead] = useState<Lead>(initialLead);
  
  // State for generated waveform data
  const [waveformData, setWaveformData] = useState<WaveformPoint[]>([]);
  
  // Generate waveform when parameters change
  const generateEKGWaveform = useCallback(() => {
    const data = generateWaveform(
      rhythm,
      heartRate,
      selectedLead,
      prInterval,
      showNoise
    );
    setWaveformData(data);
  }, [rhythm, heartRate, selectedLead, prInterval, showNoise]);
  
  // Update waveform when parameters change
  useEffect(() => {
    generateEKGWaveform();
  }, [generateEKGWaveform]);
  
  return {
    heartRate,
    rhythm,
    prInterval,
    showLabels,
    showNoise,
    selectedLead,
    waveformData,
    setHeartRate,
    setRhythm,
    setPrInterval,
    setShowLabels,
    setShowNoise,
    setSelectedLead
  };
} 