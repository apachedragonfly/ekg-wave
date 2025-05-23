import type { Rhythm, Lead, WaveformPoint } from '../types';
import { getNormalRhythmProfile, getAFibRhythmProfile, getVTachRhythmProfile } from './rhythmProfiles';

/**
 * Helper function to create a Gaussian curve value
 * @param x Position (0-1)
 * @param mu Center of the peak (0-1)
 * @param sigma Width of the curve
 * @param amplitude Peak amplitude
 */
function gaussian(x: number, mu: number, sigma: number, amplitude: number): number {
  return amplitude * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
}

/**
 * Generates a waveform based on the specified parameters
 * @param rhythm The cardiac rhythm to simulate
 * @param heartRate Heart rate in beats per minute
 * @param lead The EKG lead to display
 * @param prInterval PR interval in seconds (time from P wave start to QRS)
 * @param addNoise Whether to add baseline noise/artifact
 * @param qrsWidth QRS complex width in seconds (ventricular depolarization)
 * @param qtInterval QT interval in seconds (ventricular depolarization + repolarization)
 * @param amplitudeGain Amplitude multiplier for all deflections
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
  const cycleDuration = 60000 / heartRate; // ms per beat
  const cycleLength = cycleDuration / 1000; // Length of one cardiac cycle in seconds
  const sampleRate = 250; // 250 samples per second
  const pointsPerCycle = Math.round(cycleLength * sampleRate);
  
  // Generate multiple cardiac cycles (at least 5 seconds of data)
  const secondsToGenerate = Math.max(5, 3 * cycleLength);
  const totalPoints = Math.round(secondsToGenerate * sampleRate);
  
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
    
    // Apply amplitude gain with normalization to ensure consistent amplitude across leads
    // Use a standardized scaling to maintain a more consistent appearance
    const normalizedGain = amplitudeGain * (lead === 'II' || lead === 'V5' ? 1.0 : 
                            (lead === 'V1' || lead === 'V2' ? 1.2 : 0.9));
    yValue *= normalizedGain;
    
    // Add random noise if enabled
    if (addNoise) {
      // Scale noise based on heart rate and lead
      const dynamicNoiseScale = 0.05 * (1 + (heartRate - 70) / 100);
      yValue += (Math.random() * 2 - 1) * noiseAmplitude * dynamicNoiseScale;
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
 * Uses cardiac timing standards to properly place each component
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
  
  // Calculate timing parameters explicitly based on cardiac timing
  const pDuration = 0.08; // P wave duration (80ms)
  const pStart = 0.04; // Start P wave slightly after beginning of cycle
  const pEnd = pStart + pDuration;
  
  // QRS starts at PR interval
  const qrsStart = prInterval; 
  const qrsEnd = qrsStart + qrsWidth;
  
  // ST segment duration calculated from QT interval
  // QT = QRS + ST + T
  const tDuration = 0.16; // T wave duration (160ms)
  const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - tDuration);
  
  // T wave starts after ST segment
  const tStart = qrsEnd + stSegmentDuration;
  const tEnd = tStart + tDuration;
  
  // ------------------------
  // P wave - use a smooth sine curve for atrial depolarization
  // ------------------------
  if (position >= pStart && position < pEnd) {
    const pPosition = (position - pStart) / pDuration;
    value += pWave.amplitude * Math.sin(Math.PI * pPosition);
  }
  
  // ------------------------
  // QRS complex - use composites for ventricular depolarization
  // ------------------------
  if (position >= qrsStart && position < qrsEnd) {
    const qrsPosition = (position - qrsStart) / qrsWidth;
    
    // Refined QRS morphology with more natural curve
    if (qrsPosition < 0.2) {
      // Q wave (small negative deflection)
      value -= qrsComplex.amplitude * 0.2 * (qrsPosition / 0.2);
    } else if (qrsPosition < 0.4) {
      // R wave (large positive deflection)
      // Use a steeper curve for rapid depolarization
      value += qrsComplex.amplitude * Math.pow((qrsPosition - 0.2) / 0.2, 0.8);
    } else if (qrsPosition < 0.7) {
      // S wave (negative deflection)
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.4) / 0.3) * 1.2);
    } else {
      // Return to baseline
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.7) / 0.3));
      value *= Math.max(0, 1 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // ------------------------
  // ST segment - flat with possible slight elevation/depression
  // ------------------------
  if (position >= qrsEnd && position < tStart) {
    // Small ST elevation or depression based on lead
    value += (profile.stElevation || 0) * 0.05;
  }
  
  // ------------------------
  // T wave - use a Gaussian curve for ventricular repolarization
  // ------------------------
  if (position >= tStart && position < tEnd) {
    const tPosition = (position - tStart) / tDuration;
    // Use a slightly asymmetric shape for T wave
    const center = 0.4; // Peak slightly before the middle
    const width = 0.3;
    value += tWave.amplitude * gaussian(tPosition, center, width, 1);
  }
  
  return value;
}

/**
 * Generates a point value for Atrial Fibrillation with customizable QRS and QT
 * Uses irregular RR intervals and replaces P waves with fibrillatory waves
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
  
  // ------------------------
  // AFib: Replace P waves with fibrillatory waves
  // ------------------------
  // Using multiple sine waves at different frequencies to create chaotic oscillations
  value += (
    Math.sin(position * 120) * 0.03 + 
    Math.sin(position * 137) * 0.02 + 
    Math.sin(position * 146) * 0.025
  );
  
  // ------------------------
  // Create irregular RR intervals
  // ------------------------
  const rrVariationFactor = 0.2; // 20% variation in RR intervals
  // Generate a consistent variation based on cycle for reproducible results
  const cycleVariation = Math.sin(cycle * 0.31) * Math.cos(cycle * 0.77) * Math.sin(cycle * 1.23);
  const baseRR = 1.0 / (1 + cycleVariation * rrVariationFactor);
  const adjustedPosition = (position * baseRR) % 1;
  
  // Calculate timing parameters
  const qrsStart = 0.2; // Arbitrary position within the cycle
  const qrsEnd = qrsStart + qrsWidth;
  
  // ST segment duration calculated from QT interval
  const tDuration = 0.16;
  const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - tDuration);
  
  // T wave starts after ST segment
  const tStart = qrsEnd + stSegmentDuration;
  const tEnd = tStart + tDuration;
  
  // ------------------------
  // QRS complex
  // ------------------------
  if (adjustedPosition >= qrsStart && adjustedPosition < qrsEnd) {
    const qrsPosition = (adjustedPosition - qrsStart) / qrsWidth;
    
    // QRS morphology
    if (qrsPosition < 0.2) {
      value -= qrsComplex.amplitude * 0.2 * (qrsPosition / 0.2);
    } else if (qrsPosition < 0.4) {
      value += qrsComplex.amplitude * Math.pow((qrsPosition - 0.2) / 0.2, 0.8);
    } else if (qrsPosition < 0.7) {
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.4) / 0.3) * 1.2);
    } else {
      value += qrsComplex.amplitude * (1 - ((qrsPosition - 0.7) / 0.3));
      value *= Math.max(0, 1 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // ------------------------
  // ST segment
  // ------------------------
  if (adjustedPosition >= qrsEnd && adjustedPosition < tStart) {
    // Small ST elevation or depression based on lead
    value += (profile.stElevation || 0) * 0.05;
  }
  
  // ------------------------
  // T wave
  // ------------------------
  if (adjustedPosition >= tStart && adjustedPosition < tEnd) {
    const tPosition = (adjustedPosition - tStart) / tDuration;
    // Use a Gaussian curve for T wave in AFib
    const center = 0.4;
    const width = 0.3;
    value += tWave.amplitude * gaussian(tPosition, center, width, 0.9);
  }
  
  return value;
}

/**
 * Generates a point value for Ventricular Tachycardia with customizable QRS and QT
 * Uses wide, bizarre QRS complexes and often abnormal repolarization
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
  
  // ST segment is often very short in VTach
  const tDuration = 0.16;
  const stSegmentDuration = Math.max(0.02, qtInterval - wideQrsWidth - tDuration);
  
  const tStart = qrsEnd + stSegmentDuration;
  const tEnd = tStart + tDuration;
  
  // ------------------------
  // Wide, bizarre QRS complexes
  // ------------------------
  if (position >= qrsStart && position < qrsEnd) {
    const qrsPosition = (position - qrsStart) / wideQrsWidth;
    
    // Create a wide, bizarre QRS - more asymmetric than normal
    if (qrsPosition < 0.4) {
      // First part - rapid upstroke (uses power function for sharper rise)
      value += qrsComplex.amplitude * 1.2 * Math.pow(qrsPosition / 0.4, 1.5);
    } else if (qrsPosition < 0.7) {
      // Middle - bizarre plateau or notching
      // Add sine wave oscillations to create notches (characteristic of VTach)
      const notch = Math.sin(qrsPosition * 20) * 0.1;
      value += qrsComplex.amplitude * (1.0 - (qrsPosition - 0.4) / 0.3) + notch;
    } else {
      // End - slow descent back to baseline
      value += qrsComplex.amplitude * 0.7 * (1.0 - ((qrsPosition - 0.7) / 0.3));
    }
  }
  
  // ------------------------
  // ST segment - typically shows abnormal pattern in VTach
  // ------------------------
  if (position >= qrsEnd && position < tStart) {
    value -= 0.1; // ST depression common in VTach
  }
  
  // ------------------------
  // T wave often merged with QRS or inverted in VTach
  // ------------------------
  if (position >= tStart && position < tEnd) {
    const tPosition = (position - tStart) / tDuration;
    // Inverted T wave in VTach (use negative amplitude)
    // Using asymmetric Gaussian for more pathological appearance
    const center = 0.45;
    const width = 0.35;
    value -= tWave.amplitude * 0.7 * gaussian(tPosition, center, width, 1);
  }
  
  return value;
} 