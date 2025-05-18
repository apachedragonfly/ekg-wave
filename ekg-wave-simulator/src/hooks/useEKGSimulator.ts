import { useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { generateRhythmWaveform } from '../services/waveformGenerator';
import type { WaveformData } from '../services/waveformGenerator';

// Interface for the return value of useEKGSimulator
interface EKGSimulatorResult {
  beatInterval: number;     // Time in ms between beats
  waveformPattern: string;  // The pattern to use for rendering
  waveformData: WaveformData; // Generated waveform data
  amplitude: number;       // The amplitude of the waveform
  frequency: number;       // The frequency modifier for the waveform
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
  
  // Determine waveform parameters based on rhythm
  const waveformParams = useMemo(() => {
    let noiseLevel = 0;
    
    switch (rhythm) {
      case 'AFib':
        noiseLevel = 0.3; // More noise for AFib
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
  
  // Generate waveform data using the waveform generator
  const waveformData = useMemo(() => {
    // Convert rhythm to a type that the generator accepts
    const rhythmType = rhythm === 'AFib' ? 'AFib' : 
                       rhythm === 'VTach' ? 'VTach' : 'NSR';
    
    // Calculate noise level based on rhythm
    const noise = rhythm === 'AFib' ? 0.3 : 
                  rhythm === 'VTach' ? 0.1 : 0.05;
    
    return generateRhythmWaveform(rhythmType, {
      bpm: heartRate,
      noise,
      amplitude: 1.0,
      points: 500 // Generate 500 points for smooth rendering
    });
  }, [rhythm, heartRate]);
  
  return {
    beatInterval,
    waveformData,
    ...waveformParams
  };
} 