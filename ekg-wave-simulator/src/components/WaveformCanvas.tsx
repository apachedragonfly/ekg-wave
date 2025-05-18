import React, { useRef, useEffect } from 'react';
import { useEKGSimulator } from '../hooks/useEKGSimulator';

const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Get waveform parameters from our custom hook
  const {
    beatInterval,
    waveformData,
    waveformPattern,
    amplitude,
    frequency
  } = useEKGSimulator();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Position in waveform data (0 to waveformData.points.length - 1)
    let dataPosition = 0;
    
    // Calculate speed based on heart rate (higher HR = faster scrolling)
    const scrollSpeed = Math.max(1, 10 / (beatInterval / 1000)); // Pixels per frame
    
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

    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid();
      
      // Skip drawing if no waveform data
      if (!waveformData || !waveformData.points || waveformData.points.length === 0) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }
      
      // Set line style for EKG trace
      ctx.strokeStyle = '#00ff00'; // Green color
      ctx.lineWidth = 2;
      
      // Draw EKG waveform
      ctx.beginPath();
      
      // Baseline Y position
      const baseY = canvas.height / 2;
      
      // Normalize voltage values to canvas height
      const scaleY = (voltage: number) => baseY - (voltage * amplitude * canvas.height / 4);
      
      // Start at the left edge
      let x = 0;
      
      // Calculate starting data position (ensuring it stays within bounds)
      const startPos = Math.floor(dataPosition) % waveformData.points.length;
      
      // Draw the wave with scrolling effect
      ctx.moveTo(x, scaleY(waveformData.points[startPos]));
      
      // Number of points to draw (1 point per pixel)
      const pointsToDraw = Math.min(canvas.width, waveformData.points.length);
      
      for (let i = 1; i < pointsToDraw; i++) {
        x++;
        const dataIndex = (startPos + i) % waveformData.points.length;
        const y = scaleY(waveformData.points[dataIndex]);
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Increment data position for animation (scrolling)
      dataPosition += scrollSpeed;
      
      // Loop back to start of data when we reach the end
      if (dataPosition >= waveformData.points.length) {
        dataPosition = 0;
      }
      
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
  }, [beatInterval, waveformData, waveformPattern, amplitude, frequency]);

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