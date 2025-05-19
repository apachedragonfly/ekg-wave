import type { Rhythm, Lead, WaveformPoint } from '../types';
import { getNormalRhythmProfile, getAFibRhythmProfile, getVTachRhythmProfile } from './rhythmProfiles';

/**
 * Generates a waveform based on the specified parameters
 * @param rhythm The cardiac rhythm to simulate
 * @param heartRate Heart rate in beats per minute
 * @param lead The EKG lead to display
 * @param prInterval PR interval in seconds (time from P wave start to QRS)
 * @param qrsWidth QRS complex width in seconds (ventricular depolarization)
 * @param qtInterval QT interval in seconds (ventricular depolarization + repolarization)
 * @param amplitudeGain Amplitude multiplier for all deflections
 * @param addNoise Whether to add baseline noise/artifact
 * @returns Array of points representing the waveform
 */
export function generateWaveform(
  rhythm: Rhythm, 
  heartRate: number, 
  lead: Lead, 
  prInterval: number,
  addNoise: boolean = false,
  qrsWidth: number = 0.08,
  qtInterval: number = 0.36,
  amplitudeGain: number = 1.0
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
    
    // Add rhythm-specific features with additional physiological parameters
    if (rhythm === 'normal') {
      yValue += generateNormalSinusPoint(cyclePosition, rhythmProfile, prInterval, qrsWidth, qtInterval);
    } else if (rhythm === 'afib') {
      yValue += generateAFibPoint(cyclePosition, cycle, rhythmProfile, qrsWidth, qtInterval);
    } else if (rhythm === 'vtach') {
      yValue += generateVTachPoint(cyclePosition, rhythmProfile, qrsWidth, qtInterval);
    }
    
    // Apply amplitude gain
    yValue *= amplitudeGain;
    
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
 * Generates a point value for Normal Sinus Rhythm with customizable intervals
 */
function generateNormalSinusPoint(
  position: number, 
  profile: any, 
  prInterval: number = 0.16, 
  qrsWidth: number = 0.08, 
  qtInterval: number = 0.36
): number {
  const {
    pWave,
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // Calculate timing parameters
  const pDuration = 0.08; // P wave duration
  const pStart = 0.04; // Start P wave slightly after beginning of cycle
  const qrsStart = prInterval; // QRS starts after PR interval
  const qrsEnd = qrsStart + qrsWidth;
  const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - 0.16); // ST segment duration
  const tStart = qrsEnd + stSegmentDuration; // T wave starts after ST segment
  const tDuration = 0.16; // T wave duration
  
  // P wave
  if (position >= pStart && position < pStart + pDuration) {
    const pPosition = (position - pStart) / pDuration;
    value += pWave.amplitude * Math.sin(Math.PI * pPosition);
  }
  
  // QRS complex
  if (position >= qrsStart && position < qrsEnd) {
    const qrsPosition = (position - qrsStart) / qrsWidth;
    
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
  
  // ST segment - flat with possible slight elevation/depression
  if (position >= qrsEnd && position < tStart) {
    // Small ST elevation or depression based on lead
    value += (profile.stElevation || 0) * 0.05;
  }
  
  // T wave
  if (position >= tStart && position < tStart + tDuration) {
    const tWavePosition = (position - tStart) / tDuration;
    value += tWave.amplitude * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
}

/**
 * Generates a point value for Atrial Fibrillation with customizable QRS and QT
 */
function generateAFibPoint(
  position: number, 
  cycle: number, 
  profile: any,
  qrsWidth: number = 0.08,
  qtInterval: number = 0.36
): number {
  const {
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // In AFib, P waves are replaced with irregular fibrillatory waves
  // Applying small, rapid, irregular oscillations to the baseline
  value += (
    Math.sin(position * 120) + 
    Math.sin(position * 137) + 
    Math.sin(position * 146)
  ) * 0.05;
  
  // Create irregular RR intervals
  const rrVariationFactor = 0.2; // 20% variation in RR intervals
  // Generate a consistent variation based on cycle for reproducible results
  const cycleVariation = Math.sin(cycle * 0.31) * Math.cos(cycle * 0.77) * Math.sin(cycle * 1.23);
  const baseRR = 1.0 / (1 + cycleVariation * rrVariationFactor);
  const adjustedPosition = (position * baseRR) % 1;
  
  // Calculate timing parameters
  const qrsStart = 0.2; // Arbitrary position within the cycle
  const qrsEnd = qrsStart + qrsWidth;
  const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - 0.16);
  const tStart = qrsEnd + stSegmentDuration;
  const tDuration = 0.16;
  
  // QRS complex
  if (adjustedPosition >= qrsStart && adjustedPosition < qrsEnd) {
    const qrsPosition = (adjustedPosition - qrsStart) / qrsWidth;
    
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
  
  // ST segment
  if (adjustedPosition >= qrsEnd && adjustedPosition < tStart) {
    // Small ST elevation or depression based on lead
    value += (profile.stElevation || 0) * 0.05;
  }
  
  // T wave
  if (adjustedPosition >= tStart && adjustedPosition < tStart + tDuration) {
    const tWavePosition = (adjustedPosition - tStart) / tDuration;
    value += tWave.amplitude * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
}

/**
 * Generates a point value for Ventricular Tachycardia with customizable QRS and QT
 */
function generateVTachPoint(
  position: number, 
  profile: any,
  qrsWidth: number = 0.12, // VTach has wide QRS by definition
  qtInterval: number = 0.42 // VTach has longer QT interval
): number {
  const {
    qrsComplex,
    tWave
  } = profile;
  
  let value = 0;
  
  // No P wave in VTach
  
  // Ensure VTach always has wide QRS (pathological)
  const wideQrsWidth = Math.max(0.12, qrsWidth); // minimum 120ms for VTach
  
  // Calculate timing parameters
  const qrsStart = 0.1; // Arbitrary position within the cycle
  const qrsEnd = qrsStart + wideQrsWidth;
  const stSegmentDuration = Math.max(0.02, qtInterval - wideQrsWidth - 0.16);
  const tStart = qrsEnd + stSegmentDuration;
  const tDuration = 0.16;
  
  // Wide, bizarre QRS complexes
  if (position >= qrsStart && position < qrsEnd) {
    const qrsPosition = (position - qrsStart) / wideQrsWidth;
    
    // Create a wide, bizarre QRS - more asymmetric than normal
    if (qrsPosition < 0.4) {
      // First part - rapid upstroke
      value += qrsComplex.amplitude * 1.2 * Math.pow(qrsPosition / 0.4, 1.5);
    } else if (qrsPosition < 0.7) {
      // Middle - bizarre plateau or notching
      const notch = Math.sin(qrsPosition * 20) * 0.1;
      value += qrsComplex.amplitude * (1.0 - (qrsPosition - 0.4) / 0.3) + notch;
    } else {
      // End - slow descent back to baseline
      value += qrsComplex.amplitude * 0.7 * (1.0 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // ST segment - typically shows abnormal pattern in VTach
  if (position >= qrsEnd && position < tStart) {
    value -= 0.1; // ST depression common in VTach
  }
  
  // T wave often merged with QRS or inverted in VTach
  if (position >= tStart && position < tStart + tDuration) {
    const tWavePosition = (position - tStart) / tDuration;
    // Inverted T wave in VTach
    value -= tWave.amplitude * 0.7 * Math.sin(Math.PI * tWavePosition);
  }
  
  return value;
} 