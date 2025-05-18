import { useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';

// Interface for the return value of useEKGSimulator
interface EKGSimulatorResult {
  beatInterval: number;    // Time in ms between beats
  waveformPattern: string; // The pattern to use for rendering
  amplitude: number;       // The amplitude of the waveform
  frequency: number;       // The frequency modifier for the waveform
  // Additional parameters for more realistic waveforms
  pWaveHeight: number;     // Height of P wave
  qrsWidth: number;        // Width of QRS complex
  tWaveHeight: number;     // Height of T wave
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
  
  // Determine the waveform pattern and parameters based on rhythm
  const waveformParams = useMemo(() => {
    switch (rhythm) {
      case 'AFib':
        return {
          waveformPattern: 'afib',
          amplitude: 40 + Math.random() * 20,  // More irregular
          frequency: 0.06 + Math.random() * 0.02,
          pWaveHeight: 0,                     // No P waves in AFib
          qrsWidth: 0.08,                     // Normal QRS width
          tWaveHeight: 15 + Math.random() * 5 // Variable T waves
        };
      case 'VTach':
        return {
          waveformPattern: 'vtach',
          amplitude: 70,  // Higher amplitude
          frequency: 0.08, // Higher frequency
          pWaveHeight: 0,  // No P waves in VTach
          qrsWidth: 0.14,  // Wide QRS complex
          tWaveHeight: 20  // Tall T waves
        };
      case 'NSR':
      default:
        return {
          waveformPattern: 'nsr',
          amplitude: 50, // Normal amplitude
          frequency: 0.05, // Normal frequency
          pWaveHeight: 10, // Normal P wave
          qrsWidth: 0.08,  // Normal QRS width (80ms)
          tWaveHeight: 15  // Normal T wave height
        };
    }
  }, [rhythm]);
  
  return {
    beatInterval,
    ...waveformParams
  };
} 