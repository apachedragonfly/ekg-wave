import { useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';

// Interface for the return value of useEKGSimulator
interface EKGSimulatorResult {
  beatInterval: number;    // Time in ms between beats
  waveformPattern: string; // The pattern to use for rendering
  amplitude: number;       // The amplitude of the waveform
  frequency: number;       // The frequency modifier for the waveform
}

/**
 * Custom hook that provides the logic for syncing the waveform to simulator state
 * 
 * @returns {EKGSimulatorResult} Object containing beat interval and waveform pattern
 */
export function useEKGSimulator(): EKGSimulatorResult {
  // Get simulator state from context
  const { heartRate, rhythm, prInterval } = useSimulator();
  
  // Calculate beat interval (60000ms / BPM)
  const beatInterval = useMemo(() => {
    return 60000 / heartRate;
  }, [heartRate]);
  
  // Determine the waveform pattern based on rhythm
  const { waveformPattern, amplitude, frequency } = useMemo(() => {
    switch (rhythm) {
      case 'AFib':
        return {
          waveformPattern: 'afib',
          amplitude: 40 + Math.random() * 20,  // More irregular
          frequency: 0.06 + Math.random() * 0.02
        };
      case 'VTach':
        return {
          waveformPattern: 'vtach',
          amplitude: 70,  // Higher amplitude
          frequency: 0.08 // Higher frequency
        };
      case 'NSR':
      default:
        return {
          waveformPattern: 'nsr',
          amplitude: 50, // Normal amplitude
          frequency: 0.05 // Normal frequency
        };
    }
  }, [rhythm]);
  
  return {
    beatInterval,
    waveformPattern,
    amplitude,
    frequency
  };
} 