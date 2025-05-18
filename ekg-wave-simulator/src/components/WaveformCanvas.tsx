import React, { useRef, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { generateWaveform } from '../utils/waveformGenerator';
import type { WaveformPoint } from '../types';

// Define colors and sizes for the wave labels
const WAVE_LABELS = {
  P: { color: '#0088cc', size: 10 },
  QRS: { color: '#e74c3c', size: 10 },
  T: { color: '#2ecc71', size: 10 }
};

const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    heartRate, 
    rhythm, 
    prInterval, 
    showLabels,
    showNoise,
    selectedLead
  } = useSimulator();

  // Function to export the canvas as a PNG image
  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create a download link
      const link = document.createElement('a');
      link.download = `ekg-${rhythm}-${heartRate}bpm-${selectedLead}.png`;
      
      // Convert canvas to data URL
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting EKG:', error);
      alert('Failed to export the EKG image.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate waveform data
    const waveformData: WaveformPoint[] = generateWaveform(
      rhythm,
      heartRate, 
      selectedLead,
      prInterval,
      showNoise
    );

    // Set canvas styles
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333';
    
    // Draw background grid
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Draw waveform
    drawWaveform(ctx, waveformData, canvas.width, canvas.height);

    // Draw labels if enabled
    if (showLabels) {
      drawWaveLabels(ctx, rhythm, waveformData, canvas.width, canvas.height);
    }
  }, [heartRate, rhythm, prInterval, showLabels, showNoise, selectedLead]);

  // Draw a grid on the canvas
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw light grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.3;
    
    // Draw horizontal grid lines
    const yStep = height / 10;
    for (let y = 0; y <= height; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    const xStep = width / 20;
    for (let x = 0; x <= width; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw darker grid lines every 5 small squares
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.3;
    
    for (let y = 0; y <= height; y += yStep * 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let x = 0; x <= width; x += xStep * 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  // Draw the waveform on the canvas
  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    data: WaveformPoint[],
    width: number,
    height: number
  ) => {
    if (data.length === 0) return;
    
    // Find min and max y values for scaling
    let minY = data[0].y;
    let maxY = data[0].y;
    
    for (const point of data) {
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    const range = maxY - minY;
    
    // Scale factor to fit the waveform in the canvas
    const scaleX = width / (data[data.length - 1].x - data[0].x);
    const scaleY = (height * 0.8) / range;
    
    // Center the waveform vertically
    const offsetY = height / 2;
    
    // Draw the waveform
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const x = (point.x - data[0].x) * scaleX;
      const y = offsetY - point.y * scaleY;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  // Draw labels for P, QRS, and T waves if enabled
  const drawWaveLabels = (
    ctx: CanvasRenderingContext2D,
    rhythm: string,
    data: WaveformPoint[],
    width: number,
    height: number
  ) => {
    // Skip if there's no data
    if (data.length === 0) return;
    
    // Find min and max y values for scaling
    let minY = data[0].y;
    let maxY = data[0].y;
    
    for (const point of data) {
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    const range = maxY - minY;
    
    // Scale factor to fit the waveform in the canvas
    const scaleX = width / (data[data.length - 1].x - data[0].x);
    const scaleY = (height * 0.8) / range;
    
    // Center the waveform vertically
    const offsetY = height / 2;

    // Calculate positions for labels based on rhythm
    const firstCycleStart = 0.2; // Start a bit into the data to avoid edge effects
    
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    
    if (rhythm === 'normal') {
      // Normal Sinus Rhythm: label P, QRS, and T waves
      const pWavePos = firstCycleStart;
      const qrsPos = firstCycleStart + 0.16; // PR interval
      const tWavePos = qrsPos + 0.1; // After QRS
      
      // P wave label
      ctx.fillStyle = WAVE_LABELS.P.color;
      const pX = pWavePos * scaleX;
      const pY = offsetY - 0.2 * scaleY - 10;
      ctx.fillText('P', pX, pY);
      
      // QRS label
      ctx.fillStyle = WAVE_LABELS.QRS.color;
      const qrsX = qrsPos * scaleX;
      const qrsY = offsetY - 1.0 * scaleY - 10;
      ctx.fillText('QRS', qrsX, qrsY);
      
      // T wave label
      ctx.fillStyle = WAVE_LABELS.T.color;
      const tX = tWavePos * scaleX;
      const tY = offsetY - 0.3 * scaleY - 10;
      ctx.fillText('T', tX, tY);
      
    } else if (rhythm === 'afib') {
      // Atrial Fibrillation: label fibrillatory waves and QRS
      const fibrillationPos = firstCycleStart + 0.1;
      const qrsPos = firstCycleStart + 0.3;
      const tWavePos = qrsPos + 0.1;
      
      // Fibrillatory waves label
      ctx.fillStyle = WAVE_LABELS.P.color;
      const fX = fibrillationPos * scaleX;
      const fY = offsetY - 0.05 * scaleY - 10;
      ctx.fillText('f', fX, fY);
      
      // QRS label
      ctx.fillStyle = WAVE_LABELS.QRS.color;
      const qrsX = qrsPos * scaleX;
      const qrsY = offsetY - 1.0 * scaleY - 10;
      ctx.fillText('QRS', qrsX, qrsY);
      
      // T wave label
      ctx.fillStyle = WAVE_LABELS.T.color;
      const tX = tWavePos * scaleX;
      const tY = offsetY - 0.3 * scaleY - 10;
      ctx.fillText('T', tX, tY);
      
    } else if (rhythm === 'vtach') {
      // Ventricular Tachycardia: wide QRS complexes only
      const qrsPos = firstCycleStart + 0.1;
      
      // Wide QRS label
      ctx.fillStyle = WAVE_LABELS.QRS.color;
      const qrsX = qrsPos * scaleX;
      const qrsY = offsetY - 1.8 * scaleY - 10;
      ctx.fillText('QRS', qrsX, qrsY);
    }
  };

  return (
    <div className="p-2 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-1 text-xs">
        <h2 className="font-semibold">
          {selectedLead} • {rhythm === 'normal' ? 'NSR' : 
            rhythm === 'afib' ? 'AFib' : 'VTach'} 
          • {heartRate} BPM
        </h2>
        <button
          onClick={exportAsPNG}
          className="px-1 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={180}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default WaveformCanvas; 