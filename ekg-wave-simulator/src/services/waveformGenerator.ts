import { RHYTHM_PROFILES } from './rhythmProfiles';
import type { RhythmProfile, RhythmPoint } from './rhythmProfiles';

/**
 * Interface for a generated EKG waveform
 */
export interface WaveformData {
  points: number[];      // Array of voltage values
  timeStep: number;      // Time step between points (ms)
  totalDuration: number; // Total duration of the waveform (ms)
}

/**
 * Options for waveform generation
 */
export interface WaveformOptions {
  bpm: number;         // Heart rate in beats per minute
  noise?: number;      // Amount of noise to add (0-1)
  timeScale?: number;  // Time scaling factor (1 = normal)
  amplitude?: number;  // Amplitude scaling factor (1 = normal)
  points?: number;     // Number of points to generate (default: calculated based on duration)
}

/**
 * Generates a waveform from a rhythm profile
 * 
 * @param profile The rhythm profile to use
 * @param options Waveform generation options
 * @returns Generated waveform data
 */
export function generateWaveform(
  profile: RhythmProfile,
  options: WaveformOptions
): WaveformData {
  const {
    bpm,
    noise = 0,
    timeScale = 1,
    amplitude = 1,
    points: requestedPoints
  } = options;
  
  // Calculate beat duration based on BPM
  const beatDuration = 60000 / bpm; // ms
  
  // Scale original profile duration to match the requested BPM
  const scaleFactor = beatDuration / profile.beatDuration;
  
  // Calculate total duration and number of points
  const totalDuration = beatDuration * timeScale;
  const numPoints = requestedPoints || Math.ceil(totalDuration / 5); // 5ms per point by default
  const timeStep = totalDuration / numPoints;
  
  // Generate the points array
  const waveformPoints: number[] = new Array(numPoints).fill(0);
  
  // Fill the points array with interpolated values from the profile
  for (let i = 0; i < numPoints; i++) {
    const time = (i / numPoints) % 1; // Normalized time (0-1)
    
    // Find the surrounding points in the profile
    let lowerPoint: RhythmPoint | null = null;
    let upperPoint: RhythmPoint | null = null;
    
    for (let j = 0; j < profile.points.length - 1; j++) {
      if (profile.points[j].time <= time && profile.points[j + 1].time > time) {
        lowerPoint = profile.points[j];
        upperPoint = profile.points[j + 1];
        break;
      }
    }
    
    // If we couldn't find surrounding points, use the first and last
    if (!lowerPoint || !upperPoint) {
      const lastIndex = profile.points.length - 1;
      lowerPoint = profile.points[lastIndex];
      upperPoint = profile.points[0];
    }
    
    // Linear interpolation between points
    const timeFraction = (time - lowerPoint.time) / (upperPoint.time - lowerPoint.time);
    let value = lowerPoint.voltage + timeFraction * (upperPoint.voltage - lowerPoint.voltage);
    
    // Apply amplitude scaling
    value *= amplitude;
    
    // Add noise if requested
    if (noise > 0) {
      value += (Math.random() * 2 - 1) * noise * 0.1;
    }
    
    waveformPoints[i] = value;
  }
  
  return {
    points: waveformPoints,
    timeStep,
    totalDuration
  };
}

/**
 * Generate a waveform based on rhythm type and options
 * 
 * @param rhythmType The rhythm type (NSR, AFib, VTach)
 * @param options Waveform generation options
 * @returns Generated waveform data
 */
export function generateRhythmWaveform(
  rhythmType: 'NSR' | 'AFib' | 'VTach',
  options: WaveformOptions
): WaveformData {
  // Get the profile based on rhythm type
  const profile = RHYTHM_PROFILES[rhythmType] || RHYTHM_PROFILES.NSR;
  
  // Generate the waveform
  return generateWaveform(profile, options);
} 