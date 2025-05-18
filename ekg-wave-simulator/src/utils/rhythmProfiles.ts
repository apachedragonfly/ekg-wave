import type { Lead, RhythmProfile } from '../types';

/**
 * Returns a profile for Normal Sinus Rhythm
 * @param lead The EKG lead
 * @param prInterval PR interval in seconds
 * @returns Rhythm profile with appropriate parameters
 */
export function getNormalRhythmProfile(lead: Lead, prInterval: number): RhythmProfile {
  // Base profile with standard parameters
  const baseProfile: RhythmProfile = {
    name: 'Normal Sinus Rhythm',
    description: 'Regular rhythm with normal P waves, QRS complexes, and T waves',
    baselineNoise: 0.02,
    pWave: {
      amplitude: 0.2,
      duration: 0.08,
      present: true,
    },
    qrsComplex: {
      amplitude: 1.0,
      duration: 0.08,
      morphology: 'normal',
    },
    tWave: {
      amplitude: 0.3,
      duration: 0.16,
      present: true,
    },
    rateVariability: 0.05,
  };

  // Apply lead-specific modifications
  switch (lead) {
    case 'I':
      baseProfile.qrsComplex.amplitude = 0.8;
      break;
    case 'II':
      // Lead II usually has the most prominent P waves
      baseProfile.pWave.amplitude = 0.25;
      baseProfile.qrsComplex.amplitude = 1.1;
      break;
    case 'III':
      baseProfile.qrsComplex.amplitude = 0.7;
      baseProfile.tWave.amplitude = 0.2;
      break;
    case 'aVR':
      // aVR is often predominantly negative
      baseProfile.pWave.amplitude = -0.15;
      baseProfile.qrsComplex.amplitude = -0.7;
      baseProfile.tWave.amplitude = -0.2;
      break;
    case 'aVL':
      baseProfile.qrsComplex.amplitude = 0.6;
      break;
    case 'aVF':
      baseProfile.qrsComplex.amplitude = 0.8;
      break;
    case 'V1':
      baseProfile.qrsComplex.amplitude = 0.7;
      baseProfile.tWave.amplitude = -0.1; // Inverted T wave in V1 can be normal
      break;
    case 'V2':
      baseProfile.qrsComplex.amplitude = 1.2;
      break;
    case 'V3':
      baseProfile.qrsComplex.amplitude = 1.5;
      break;
    case 'V4':
      baseProfile.qrsComplex.amplitude = 1.8;
      break;
    case 'V5':
      baseProfile.qrsComplex.amplitude = 1.5;
      break;
    case 'V6':
      baseProfile.qrsComplex.amplitude = 1.2;
      break;
  }

  // Apply PR interval adjustment
  // This will affect the timing of the QRS complex relative to the P wave
  return baseProfile;
}

/**
 * Returns a profile for Atrial Fibrillation
 * @param lead The EKG lead
 * @returns Rhythm profile with appropriate parameters
 */
export function getAFibRhythmProfile(lead: Lead): RhythmProfile {
  const baseProfile: RhythmProfile = {
    name: 'Atrial Fibrillation',
    description: 'Irregular rhythm with absence of P waves, replaced by fibrillatory waves',
    baselineNoise: 0.05,
    pWave: {
      amplitude: 0,
      duration: 0,
      present: false,
    },
    qrsComplex: {
      amplitude: 1.0,
      duration: 0.08,
      morphology: 'normal',
    },
    tWave: {
      amplitude: 0.3,
      duration: 0.16,
      present: true,
    },
    rateVariability: 0.4, // High variability in AFib
  };

  // Apply lead-specific modifications
  switch (lead) {
    case 'II':
      baseProfile.qrsComplex.amplitude = 1.1;
      break;
    case 'V1':
      // Fibrillatory waves may be more visible in V1
      baseProfile.baselineNoise = 0.07;
      break;
    // Add other lead-specific modifications as needed
  }

  return baseProfile;
}

/**
 * Returns a profile for Ventricular Tachycardia
 * @param lead The EKG lead
 * @returns Rhythm profile with appropriate parameters
 */
export function getVTachRhythmProfile(lead: Lead): RhythmProfile {
  const baseProfile: RhythmProfile = {
    name: 'Ventricular Tachycardia',
    description: 'Rapid, regular rhythm with wide, bizarre QRS complexes',
    baselineNoise: 0.03,
    pWave: {
      amplitude: 0,
      duration: 0,
      present: false,
    },
    qrsComplex: {
      amplitude: 1.8,
      duration: 0.16, // Wide QRS complex > 120ms
      morphology: 'wide',
    },
    tWave: {
      amplitude: 0.5,
      duration: 0.12,
      present: true,
    },
    rateVariability: 0.1,
  };

  // Apply lead-specific modifications
  switch (lead) {
    case 'V1':
    case 'V2':
      // VTach often most prominent in right precordial leads
      baseProfile.qrsComplex.amplitude = 2.0;
      break;
    case 'V6':
      baseProfile.qrsComplex.amplitude = 1.6;
      break;
    // Add other lead-specific modifications as needed
  }

  return baseProfile;
} 