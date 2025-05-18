/**
 * EKG Rhythm Profiles
 * 
 * This file contains sample data points for different EKG rhythm patterns.
 * These normalized data points represent the voltage waveform over time.
 */

// Type definitions for rhythm profiles
export interface RhythmPoint {
  time: number;   // Relative time position (0-1)
  voltage: number; // Voltage value (-1 to 1)
}

export interface RhythmProfile {
  name: string;
  description: string;
  points: RhythmPoint[];
  beatDuration: number; // Duration of one complete beat in ms
}

// Normal Sinus Rhythm (NSR)
export const NSR_PROFILE: RhythmProfile = {
  name: "NSR",
  description: "Normal Sinus Rhythm - Regular P waves followed by QRS complexes with PR interval 0.12-0.20s",
  beatDuration: 857, // ~70 BPM
  points: [
    // Baseline (isoelectric line)
    { time: 0.00, voltage: 0.00 },
    // P wave
    { time: 0.05, voltage: 0.10 },
    { time: 0.10, voltage: 0.20 },
    { time: 0.15, voltage: 0.10 },
    // PR interval
    { time: 0.20, voltage: 0.00 },
    // QRS complex
    { time: 0.25, voltage: -0.10 }, // Q wave
    { time: 0.30, voltage: 1.00 },  // R wave
    { time: 0.35, voltage: -0.20 }, // S wave
    // ST segment
    { time: 0.40, voltage: 0.00 },
    // T wave
    { time: 0.50, voltage: 0.15 },
    { time: 0.60, voltage: 0.30 },
    { time: 0.70, voltage: 0.15 },
    // Return to baseline
    { time: 0.80, voltage: 0.00 },
    { time: 1.00, voltage: 0.00 }
  ]
};

// Atrial Fibrillation (AFib)
export const AFIB_PROFILE: RhythmProfile = {
  name: "AFib",
  description: "Atrial Fibrillation - Irregularly irregular rhythm with no P waves",
  beatDuration: 600, // ~100 BPM (variable)
  points: [
    // Chaotic baseline (no P waves)
    { time: 0.00, voltage: 0.00 },
    { time: 0.05, voltage: 0.05 },
    { time: 0.10, voltage: -0.05 },
    { time: 0.15, voltage: 0.07 },
    { time: 0.20, voltage: -0.03 },
    // QRS complex
    { time: 0.25, voltage: -0.10 },
    { time: 0.30, voltage: 0.80 },
    { time: 0.35, voltage: -0.15 },
    // Irregular return to baseline
    { time: 0.40, voltage: 0.00 },
    // T wave
    { time: 0.50, voltage: 0.20 },
    { time: 0.55, voltage: 0.25 },
    { time: 0.60, voltage: 0.10 },
    // More chaotic baseline
    { time: 0.70, voltage: 0.05 },
    { time: 0.80, voltage: -0.08 },
    { time: 0.90, voltage: 0.04 },
    { time: 1.00, voltage: 0.00 }
  ]
};

// Ventricular Tachycardia (VTach)
export const VTACH_PROFILE: RhythmProfile = {
  name: "VTach",
  description: "Ventricular Tachycardia - Rapid, wide QRS complexes, no P waves",
  beatDuration: 375, // ~160 BPM
  points: [
    // No P wave, starts with wide QRS complex
    { time: 0.00, voltage: 0.00 },
    { time: 0.05, voltage: 0.20 },
    { time: 0.15, voltage: 1.00 },
    { time: 0.25, voltage: -0.50 },
    { time: 0.35, voltage: 0.20 },
    // T wave blends with next QRS due to fast rate
    { time: 0.45, voltage: 0.40 },
    { time: 0.55, voltage: 0.10 },
    { time: 0.70, voltage: 0.00 },
    // Short diastole before next beat
    { time: 1.00, voltage: 0.00 }
  ]
};

// All profiles collection
export const RHYTHM_PROFILES = {
  NSR: NSR_PROFILE,
  AFib: AFIB_PROFILE,
  VTach: VTACH_PROFILE
}; 