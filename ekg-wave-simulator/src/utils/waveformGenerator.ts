import type { Rhythm, Lead, WaveformPoint } from '../types';
import { getNormalRhythmProfile, getAFibRhythmProfile, getVTachRhythmProfile } from './rhythmProfiles';

/**
 * Generates a waveform based on the specified parameters
 * @param rhythm The cardiac rhythm to simulate
 * @param heartRate Heart rate in beats per minute
 * @param lead The EKG lead to display
 * @param prInterval PR interval in seconds (applies to NSR)
 * @param addNoise Whether to add baseline noise/artifact
 * @returns Array of points representing the waveform
 */
export function generateWaveform(
  rhythm: Rhythm, 
  heartRate: number, 
  lead: Lead, 
  prInterval: number,
  addNoise: boolean = false
): WaveformPoint[] {
  // Calculate basic timing parameters
  const cycleLength = 60 / heartRate; // Length of one cardiac cycle in seconds
  const sampleRate = 250; // 250 samples per second
  const pointsPerCycle = Math.round(cycleLength * sampleRate);
  const totalPoints = 5 * pointsPerCycle; // Generate 5 cardiac cycles
  
  // Initialize the waveform array
  const waveform: WaveformPoint[] = [];
  
  // Get the appropriate rhythm profile
  let rhythmProfile;
  switch (rhythm) {
    case 'normal':
      rhythmProfile = getNormalRhythmProfile(lead, prInterval);
      break;
    case 'afib':
      rhythmProfile = getAFibRhythmProfile(lead);
      break;
    case 'vtach':
      rhythmProfile = getVTachRhythmProfile(lead);
      break;
    default:
      rhythmProfile = getNormalRhythmProfile(lead, prInterval);
  }
  
  // Establish baseline measurements
  const baselineMv = 0; // Baseline in millivolts
  const noiseAmplitude = addNoise ? rhythmProfile.baselineNoise : 0;
  
  // Generate the waveform points
  for (let i = 0; i < totalPoints; i++) {
    const timeInSeconds = i / sampleRate;
    const cycle = Math.floor(i / pointsPerCycle);
    const cyclePosition = (i % pointsPerCycle) / pointsPerCycle;
    
    // Calculate basic point values
    let yValue = baselineMv;
    
    // Add rhythm-specific features
    if (rhythm === 'normal') {
      yValue += generateNormalSinusPoint(cyclePosition, rhythmProfile);
    } else if (rhythm === 'afib') {
      yValue += generateAFibPoint(cyclePosition, cycle, rhythmProfile);
    } else if (rhythm === 'vtach') {
      yValue += generateVTachPoint(cyclePosition, rhythmProfile);
    }
    
    // Add random noise if enabled
    if (addNoise) {
      yValue += (Math.random() * 2 - 1) * noiseAmplitude;
    }
    
    // Add point to waveform array
    waveform.push({
      x: timeInSeconds,
      y: yValue
    });
  }
  
  return waveform;
}

/**
 * Generates a point value for Normal Sinus Rhythm
 */
function generateNormalSinusPoint(position: number, profile: any): number {
  const {
    pWave,
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // P wave (occurs at the beginning of the cycle)
  if (position < pWave.duration) {
    const pPosition = position / pWave.duration;
    value += pWave.amplitude * Math.sin(Math.PI * pPosition);
  }
  
  // QRS complex (occurs after PR interval)
  const prPosition = 0.16; // Standard PR interval position
  if (position >= prPosition && position < prPosition + qrsComplex.duration) {
    const qrsPosition = (position - prPosition) / qrsComplex.duration;
    
    // Simplified QRS morphology
    if (qrsPosition < 0.2) {
      // Q wave (small negative deflection)
      value -= qrsComplex.amplitude * 0.2 * (qrsPosition / 0.2);
    } else if (qrsPosition < 0.4) {
      // R wave (large positive deflection)
      value += qrsComplex.amplitude * ((qrsPosition - 0.2) / 0.2);
    } else if (qrsPosition < 0.7) {
      // S wave (negative deflection)
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.4) / 0.3) * 1.2);
    } else {
      // Return to baseline
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.7) / 0.3));
      value *= Math.max(0, 1 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // T wave (occurs after QRS)
  const tPosition = prPosition + qrsComplex.duration + 0.08; // Start T wave after QRS + small delay
  if (position >= tPosition && position < tPosition + tWave.duration) {
    const tWavePosition = (position - tPosition) / tWave.duration;
    value += tWave.amplitude * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
}

/**
 * Generates a point value for Atrial Fibrillation
 */
function generateAFibPoint(position: number, cycle: number, profile: any): number {
  const {
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // In AFib, P waves are replaced with irregular fibrillatory waves
  // Applying small, rapid, irregular oscillations to the baseline
  value += (Math.sin(position * 120) + Math.sin(position * 125)) * 0.05;
  
  // Create irregular RR intervals
  const rrVariationFactor = 0.2; // 20% variation in RR intervals
  const baseRR = 1.0 / (1 + (Math.random() - 0.5) * rrVariationFactor);
  const adjustedPosition = (position * baseRR) % 1;
  
  // QRS complex
  const qrsStart = 0.2; // Arbitrary position within the cycle
  if (adjustedPosition >= qrsStart && adjustedPosition < qrsStart + qrsComplex.duration) {
    const qrsPosition = (adjustedPosition - qrsStart) / qrsComplex.duration;
    
    // QRS morphology
    if (qrsPosition < 0.2) {
      value -= qrsComplex.amplitude * 0.2 * (qrsPosition / 0.2);
    } else if (qrsPosition < 0.4) {
      value += qrsComplex.amplitude * ((qrsPosition - 0.2) / 0.2);
    } else if (qrsPosition < 0.7) {
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.4) / 0.3) * 1.2);
    } else {
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.7) / 0.3));
      value *= Math.max(0, 1 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // T wave
  const tPosition = qrsStart + qrsComplex.duration + 0.08;
  if (adjustedPosition >= tPosition && adjustedPosition < tPosition + tWave.duration) {
    const tWavePosition = (adjustedPosition - tPosition) / tWave.duration;
    value += tWave.amplitude * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
}

/**
 * Generates a point value for Ventricular Tachycardia
 */
function generateVTachPoint(position: number, profile: any): number {
  const {
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // No P wave in VTach
  
  // Wide, bizarre QRS complexes
  const qrsStart = 0.1; // Arbitrary position within the cycle
  if (position >= qrsStart && position < qrsStart + qrsComplex.duration) {
    const qrsPosition = (position - qrsStart) / qrsComplex.duration;
    
    // Create a wide, bizarre QRS
    if (qrsPosition < 0.5) {
      value += qrsComplex.amplitude * Math.sin(Math.PI * qrsPosition);
    } else {
      value -= qrsComplex.amplitude * 0.5 * Math.sin(Math.PI * qrsPosition);
    }
  }
  
  // T wave often merged with QRS in VTach
  const tPosition = qrsStart + qrsComplex.duration;
  if (position >= tPosition && position < tPosition + tWave.duration) {
    const tWavePosition = (position - tPosition) / tWave.duration;
    value += tWave.amplitude * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
} 