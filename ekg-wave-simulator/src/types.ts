// Define the rhythm types
export type Rhythm = 'normal' | 'afib' | 'vtach';

// Define the lead types
export type Lead = 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6';

// Define waveform point structure
export interface WaveformPoint {
  x: number;
  y: number;
}

// Define rhythm profile structure
export interface RhythmProfile {
  name: string;
  description: string;
  baselineNoise: number;
  pWave: {
    amplitude: number;
    duration: number;
    present: boolean;
  };
  qrsComplex: {
    amplitude: number;
    duration: number;
    morphology: 'normal' | 'wide' | 'irregular';
  };
  tWave: {
    amplitude: number;
    duration: number;
    present: boolean;
  };
  rateVariability: number;
} 