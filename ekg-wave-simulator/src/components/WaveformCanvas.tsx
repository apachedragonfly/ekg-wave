import React, { useRef, useEffect } from 'react';
import { useEKGSimulator } from '../hooks/useEKGSimulator';

const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Get waveform parameters from our custom hook
  const {
    beatInterval,
    waveformPattern,
    amplitude,
    frequency,
    pWaveHeight,
    qrsWidth,
    tWaveHeight
  } = useEKGSimulator();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    
    // Calculate speed based on heart rate (higher HR = faster scrolling)
    // Adjust for smoother animation
    const scrollSpeed = Math.max(1, 30 / (beatInterval / 1000)); // Pixels per frame
    
    // Define segment width for all patterns
    const segment = 20; // Width of each segment

    // Draw grid lines (like an EKG paper)
    const drawGrid = () => {
      ctx.beginPath();
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5;
      
      // Draw horizontal grid lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      // Draw vertical grid lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      ctx.stroke();
    };

    // Draw a normal PQRST complex
    const drawNormalComplex = (x: number, baseY: number) => {
      // Baseline
      ctx.moveTo(x, baseY);
      
      // P wave (small rounded bump)
      if (pWaveHeight > 0) {
        const pWidth = segment * 1.5;
        // Draw P wave as a small bump
        for (let i = 0; i <= pWidth; i++) {
          const pY = baseY - Math.sin((i / pWidth) * Math.PI) * pWaveHeight;
          ctx.lineTo(x + i, pY);
        }
        
        // PR segment (return to baseline)
        ctx.lineTo(x + pWidth + segment, baseY);
      }
      
      // QRS complex
      const qrsStart = pWaveHeight > 0 ? x + segment * 2.5 : x + segment;
      
      // Q wave (small dip)
      ctx.lineTo(qrsStart, baseY + 10);
      
      // R wave (tall upward spike)
      ctx.lineTo(qrsStart + segment * 0.5, baseY - amplitude);
      
      // S wave (downward deflection)
      ctx.lineTo(qrsStart + segment, baseY + 20);
      
      // Return to baseline
      ctx.lineTo(qrsStart + segment * 1.5, baseY);
      
      // T wave (rounded bump)
      const tStart = qrsStart + segment * 2;
      for (let i = 0; i <= segment * 1.5; i++) {
        const tY = baseY - Math.sin((i / (segment * 1.5)) * Math.PI) * tWaveHeight;
        ctx.lineTo(tStart + i, tY);
      }
      
      // Return to baseline
      ctx.lineTo(tStart + segment * 2, baseY);
    };

    // Draw AFib pattern
    const drawAfibComplex = (x: number, baseY: number) => {
      // Irregular baseline with small, chaotic oscillations
      for (let i = 0; i < segment * 6; i++) {
        const irregularity = Math.random() * 10 - 5;
        const qrsSpike = (i % segment === 0 && Math.random() > 0.7) ? -amplitude : 0;
        ctx.lineTo(x + i, baseY + irregularity + qrsSpike);
      }
    };

    // Draw VTach pattern
    const drawVTachComplex = (x: number, baseY: number) => {
      const vtachSegment = 15; // Narrower segments for faster rhythm
      
      // Rapid, wide QRS complexes without P waves
      for (let i = 0; i < 3; i++) { // Draw multiple complexes
        const complexStart = x + i * vtachSegment * 4;
        
        // Baseline
        ctx.lineTo(complexStart, baseY);
        
        // Wide QRS (no Q wave)
        ctx.lineTo(complexStart + vtachSegment * 0.5, baseY - amplitude);
        ctx.lineTo(complexStart + vtachSegment * 1.5, baseY + 20);
        ctx.lineTo(complexStart + vtachSegment * 2.5, baseY);
        
        // Small T wave
        if (i < 2) { // Only draw T wave if not the last complex
          ctx.lineTo(complexStart + vtachSegment * 3, baseY - tWaveHeight);
          ctx.lineTo(complexStart + vtachSegment * 4, baseY);
        }
      }
    };

    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid();
      
      // Set line style for EKG trace
      ctx.strokeStyle = '#00ff00'; // Green color
      ctx.lineWidth = 2;
      
      // Draw EKG waveform
      ctx.beginPath();
      
      // Baseline Y position
      const baseY = canvas.height / 2;
      
      // Start at the left edge
      ctx.moveTo(-offset % 100, baseY);
      
      // Draw the wave with scrolling effect
      let x = -offset % 100;
      const beatWidth = 100; // Width of each complete heartbeat on screen
      
      while (x < canvas.width) {
        // Different wave patterns based on the rhythm
        if (waveformPattern === 'afib') {
          // AFib: irregular rhythm with no distinct P waves
          drawAfibComplex(x, baseY);
        } else if (waveformPattern === 'vtach') {
          // VTach: rapid, wide QRS complexes
          drawVTachComplex(x, baseY);
        } else {
          // Normal sinus rhythm
          drawNormalComplex(x, baseY);
        }
        
        x += beatWidth;
      }
      
      ctx.stroke();
      
      // Increment offset for animation, speed based on heart rate
      offset += scrollSpeed;
      
      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(draw);
    };
    
    // Start the animation
    draw();
    
    // Cleanup function
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [beatInterval, waveformPattern, amplitude, frequency, pWaveHeight, qrsWidth, tWaveHeight]);

  return (
    <div className="waveform-container">
      <canvas 
        ref={canvasRef}
        width={500} 
        height={300} 
        className="bg-black rounded-lg"
      />
    </div>
  );
};

export default WaveformCanvas; 