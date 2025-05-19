import React, { useRef, useEffect, useState } from 'react';
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
  // Update default size to 1650x100
  const [canvasWidth, setCanvasWidth] = useState(1650);
  const [canvasHeight, setCanvasHeight] = useState(100);
  
  const { 
    heartRate, 
    rhythm, 
    prInterval,
    qrsWidth,
    qtInterval,
    amplitudeGain,
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

    // Generate waveform data with all physiological parameters
    const waveformData: WaveformPoint[] = generateWaveform(
      rhythm,
      heartRate, 
      selectedLead,
      prInterval,
      showNoise,
      qrsWidth,
      qtInterval,
      amplitudeGain
    );

    // Set canvas styles
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#333';
    
    // Draw background grid
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Draw waveform
    drawWaveform(ctx, waveformData, canvas.width, canvas.height);

    // Draw labels if enabled
    if (showLabels) {
      drawWaveLabels(ctx, rhythm, waveformData, canvas.width, canvas.height, prInterval, qrsWidth, qtInterval);
    }
  }, [heartRate, rhythm, prInterval, qrsWidth, qtInterval, amplitudeGain, showLabels, showNoise, selectedLead, canvasWidth, canvasHeight]);

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
    
    // Draw vertical grid lines - optimized for wider canvas
    // Each major grid cell represents 200ms
    const msPerPixel = 0.2 / (width / 50); // 200ms per major division
    const pixelsPerMS = 1 / msPerPixel;
    const xStep = pixelsPerMS * 40; // 40ms per small grid (5mm)
    
    for (let x = 0; x <= width; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw darker grid lines every 5 small squares
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.4;
    
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
    
    // Calculate time range of the data
    const timeRange = data[data.length - 1].x - data[0].x;
    
    // Only display the first 2 cardiac cycles for better visibility on wide canvas
    const visibleTimeRange = Math.min(timeRange, 2 * (60 / heartRate));
    const visibleEndTime = data[0].x + visibleTimeRange;
    
    // Filter data to visible range
    const visibleData = data.filter(point => point.x <= visibleEndTime);
    
    // Scale factor to fit the waveform in the canvas
    const scaleX = width / visibleTimeRange;
    
    // Use a more conservative scale factor to prevent extreme amplitude variations
    // and provide more vertical space for labels
    const scaleY = (height * 0.6) / (range || 1); // Prevent division by zero
    
    // Center the waveform vertically with more space at the top for labels
    const offsetY = height * 0.6;
    
    // Draw the waveform
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5; // Slightly thicker line for better visibility
    
    for (let i = 0; i < visibleData.length; i++) {
      const point = visibleData[i];
      const x = (point.x - data[0].x) * scaleX;
      const y = offsetY - point.y * scaleY;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw a horizontal baseline (isoelectric line) for reference
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.moveTo(0, offsetY);
    ctx.lineTo(width, offsetY);
    ctx.stroke();
  };

  // Draw labels for P, QRS, and T waves if enabled
  const drawWaveLabels = (
    ctx: CanvasRenderingContext2D,
    rhythm: string,
    data: WaveformPoint[],
    width: number,
    height: number,
    prInterval: number = 0.16,
    qrsWidth: number = 0.08,
    qtInterval: number = 0.36
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
    
    // Calculate time range of the data
    const timeRange = data[data.length - 1].x - data[0].x;
    
    // Only display the first 2 cardiac cycles for better visibility on wide canvas
    const visibleTimeRange = Math.min(timeRange, 2 * (60 / heartRate));
    const visibleEndTime = data[0].x + visibleTimeRange;
    
    // Scale factor to fit the waveform in the canvas
    const scaleX = width / visibleTimeRange;
    const scaleY = (height * 0.6) / (range || 1);
    
    // Center the waveform vertically with more space for labels
    const offsetY = height * 0.6;
    
    // Calculate timing for one cardiac cycle in seconds
    const cycleLength = 60 / heartRate;
    
    // Set font size based on canvas height, but ensure it's visible
    const fontSize = Math.max(12, Math.floor(height / 12));
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    
    // Calculate x-position scaling from time to pixels
    const timeToX = (time: number) => time * scaleX;
    
    // Common component durations
    const pDuration = 0.08; // 80ms P wave
    const tDuration = 0.16; // 160ms T wave
    
    // Common label vertical positions
    const topLabelY = offsetY - maxY * scaleY - fontSize - 5; // Position above peak
    const bottomLabelY = offsetY - minY * scaleY + fontSize + 5; // Position below nadir
    
    if (rhythm === 'normal') {
      // Normal Sinus Rhythm: label P, QRS, and T waves
      
      // P wave timing calculations
      const pStart = 0.04; // P wave starts at 0.04s
      const pMid = pStart + pDuration / 2;
      
      // QRS timing calculations 
      const qrsStart = prInterval; // QRS starts at PR interval
      const qrsMid = qrsStart + qrsWidth / 2;
      
      // T wave timing calculations
      // Calculate ST segment duration based on QT interval
      const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - tDuration);
      const tStart = qrsStart + qrsWidth + stSegmentDuration;
      const tMid = tStart + tDuration / 2;
      
      // Draw individual QRS component labels (Q, R, S)
      const qPosition = qrsStart + 0.01;
      const rPosition = qrsStart + qrsWidth * 0.3;
      const sPosition = qrsStart + qrsWidth * 0.5;
      
      // Q wave label
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)'; // Red with transparency
      ctx.fillText('Q', timeToX(qPosition), offsetY + 0.2 * scaleY + fontSize);
      
      // R wave label
      ctx.fillStyle = 'rgba(231, 76, 60, 0.9)'; // Brighter red
      ctx.fillText('R', timeToX(rPosition), topLabelY);
      
      // S wave label
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
      ctx.fillText('S', timeToX(sPosition), offsetY + 0.3 * scaleY + fontSize);
      
      // P wave label
      ctx.fillStyle = WAVE_LABELS.P.color;
      const pX = timeToX(pMid);
      const pY = offsetY - 0.2 * scaleY - fontSize;
      ctx.fillText('P', pX, pY);
      
      // T wave label
      ctx.fillStyle = WAVE_LABELS.T.color;
      const tX = timeToX(tMid);
      const tY = offsetY - 0.3 * scaleY - fontSize;
      ctx.fillText('T', tX, tY);
      
      // Draw PR interval marker
      ctx.strokeStyle = 'rgba(0, 136, 204, 0.3)'; // Light blue
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(timeToX(pStart), offsetY + 20);
      ctx.lineTo(timeToX(qrsStart), offsetY + 20);
      ctx.stroke();
      
      // Label PR interval
      ctx.fillStyle = 'rgba(0, 136, 204, 0.7)';
      ctx.font = `${Math.max(10, fontSize - 2)}px Arial`;
      ctx.fillText(`PR: ${prInterval}s`, timeToX(pStart + (qrsStart - pStart)/2), offsetY + 20 + fontSize);
      
      // Draw QT interval marker if space allows
      if (qtInterval > 0.2) {
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)'; // Light green
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(timeToX(qrsStart), offsetY + 35);
        ctx.lineTo(timeToX(tStart + tDuration), offsetY + 35);
        ctx.stroke();
        
        // Label QT interval
        ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
        ctx.fillText(`QT: ${qtInterval}s`, 
                    timeToX(qrsStart + (tStart + tDuration - qrsStart)/2), 
                    offsetY + 35 + fontSize);
      }
      
    } else if (rhythm === 'afib') {
      // Atrial Fibrillation: label fibrillatory waves and QRS
      
      // Fibrillatory waves timing
      const fibrillationStart = 0.05;
      const fibrillationMid = 0.1; 
      
      // QRS timing calculations (arbitrary starting position in AFib)
      const qrsStart = 0.2; 
      const qrsMid = qrsStart + qrsWidth / 2;
      
      // T wave timing calculations
      const stSegmentDuration = Math.max(0.05, qtInterval - qrsWidth - tDuration);
      const tStart = qrsStart + qrsWidth + stSegmentDuration;
      const tMid = tStart + tDuration / 2;
      
      // Draw individual QRS component labels (Q, R, S)
      const qPosition = qrsStart + 0.01;
      const rPosition = qrsStart + qrsWidth * 0.3;
      const sPosition = qrsStart + qrsWidth * 0.5;
      
      // QRS component labels
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
      ctx.fillText('Q', timeToX(qPosition), offsetY + 0.2 * scaleY + fontSize);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
      ctx.fillText('R', timeToX(rPosition), topLabelY);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
      ctx.fillText('S', timeToX(sPosition), offsetY + 0.3 * scaleY + fontSize);
      
      // Fibrillatory waves label
      ctx.fillStyle = WAVE_LABELS.P.color;
      const fX = timeToX(fibrillationMid);
      const fY = offsetY - 0.05 * scaleY - fontSize;
      ctx.fillText('f', fX, fY);
      
      // Add an "irregular" note
      ctx.fillStyle = 'rgba(0, 136, 204, 0.7)';
      ctx.font = `${Math.max(10, fontSize - 2)}px Arial`;
      ctx.fillText('Irregular', timeToX(fibrillationStart + 0.15), offsetY - 0.05 * scaleY - fontSize * 2);
      
      // T wave label
      ctx.fillStyle = WAVE_LABELS.T.color;
      const tX = timeToX(tMid);
      const tY = offsetY - 0.3 * scaleY - fontSize;
      ctx.fillText('T', tX, tY);
      
    } else if (rhythm === 'vtach') {
      // Ventricular Tachycardia: wide QRS complexes only
      
      // VTach has fast rate and wide QRS
      const qrsStart = 0.1;
      const wideQrsWidth = Math.max(0.12, qrsWidth);
      const qrsMid = qrsStart + wideQrsWidth / 2;
      
      // T wave often merged with QRS in VTach
      const stSegmentDuration = Math.max(0.02, qtInterval - wideQrsWidth - tDuration);
      const tStart = qrsStart + wideQrsWidth + stSegmentDuration;
      const tMid = tStart + tDuration / 2;
      
      // Draw individual QRS component labels
      const rPosition = qrsStart + wideQrsWidth * 0.3;
      
      // R wave label
      ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
      ctx.fillText('R', timeToX(rPosition), topLabelY);
      
      // Wide QRS label
      ctx.fillStyle = WAVE_LABELS.QRS.color;
      const qrsX = timeToX(qrsMid);
      const qrsY = topLabelY - fontSize - 5;
      ctx.fillText('Wide QRS', qrsX, qrsY);
      
      // Add a "wide" note with measurement
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
      ctx.font = `${Math.max(10, fontSize - 2)}px Arial`;
      ctx.fillText(`${(wideQrsWidth * 1000).toFixed(0)}ms`, timeToX(qrsMid), qrsY - fontSize - 2);
      
      // Show inverted T wave if visible
      ctx.fillStyle = WAVE_LABELS.T.color;
      const tX = timeToX(tMid);
      const tY = bottomLabelY + 5;
      ctx.fillText('T (inverted)', tX, tY);
    }
    
    // Add heart rate information
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = `${Math.max(10, fontSize - 2)}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Rate: ${heartRate} BPM`, 10, fontSize + 5);
  };

  // Add size controls so you can adjust the size directly
  const handleIncreaseWidth = () => setCanvasWidth(prev => prev + 150);
  const handleDecreaseWidth = () => setCanvasWidth(prev => Math.max(600, prev - 150));
  const handleIncreaseHeight = () => setCanvasHeight(prev => prev + 25);
  const handleDecreaseHeight = () => setCanvasHeight(prev => Math.max(50, prev - 25));

  return (
    <div className="p-2 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-1 text-sm">
        <h2 className="font-semibold">
          {selectedLead} • {rhythm === 'normal' ? 'NSR' : 
            rhythm === 'afib' ? 'AFib' : 'VTach'} 
          • {heartRate} BPM
        </h2>
        <button
          onClick={exportAsPNG}
          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md">
        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={canvasHeight}
          className="w-full h-auto"
        />
      </div>
      {/* Size controls */}
      <div className="mt-2 flex flex-wrap justify-between">
        <div className="text-xs font-medium flex items-center">
          <span>Size: {canvasWidth}×{canvasHeight}</span>
          <span className="ml-2 text-gray-500">• Standard EKG paper: 1625×100 (25mm/s, 10mm/mV)</span>
        </div>
        <div className="flex space-x-2">
          <div className="text-xs">
            Width:
            <button 
              onClick={handleDecreaseWidth}
              className="ml-1 px-1.5 bg-gray-200 rounded"
            >
              -
            </button>
            <button 
              onClick={handleIncreaseWidth}
              className="ml-1 px-1.5 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
          <div className="text-xs">
            Height:
            <button 
              onClick={handleDecreaseHeight}
              className="ml-1 px-1.5 bg-gray-200 rounded"
            >
              -
            </button>
            <button 
              onClick={handleIncreaseHeight}
              className="ml-1 px-1.5 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
          <button
            onClick={() => { setCanvasWidth(1650); setCanvasHeight(100); }}
            className="ml-1 px-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Size
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaveformCanvas; 