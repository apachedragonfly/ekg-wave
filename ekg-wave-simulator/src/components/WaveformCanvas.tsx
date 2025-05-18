import React, { useRef, useEffect } from 'react';
import { useEKGSimulator } from '../hooks/useEKGSimulator';

const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Get waveform parameters from our custom hook
  const { beatInterval, waveformPattern, amplitude, frequency } = useEKGSimulator();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    
    // Calculate speed based on heart rate (higher HR = faster scrolling)
    const scrollSpeed = 60 / (beatInterval / 1000); // Pixels per frame

    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set line style
      ctx.strokeStyle = '#00ff00'; // Green color
      ctx.lineWidth = 2;
      
      // Draw EKG wave
      ctx.beginPath();
      
      // Start at the left edge
      ctx.moveTo(0, canvas.height / 2);
      
      // Draw the wave with scrolling effect
      for (let x = 0; x < canvas.width; x++) {
        // Different wave patterns based on the rhythm
        let y;
        if (waveformPattern === 'afib') {
          // Irregular rhythm for AFib
          y = canvas.height / 2 + amplitude * Math.sin((x + offset) * frequency) 
            + Math.random() * 10 - 5;
        } else if (waveformPattern === 'vtach') {
          // Rapid, regular, wide complex for VTach
          y = canvas.height / 2 + amplitude * Math.sin((x + offset) * frequency) * 
            (Math.sin((x + offset) * 0.01) > 0 ? 1 : 0.2);
        } else {
          // Normal sinus rhythm
          y = canvas.height / 2 + amplitude * Math.sin((x + offset) * frequency);
        }
        
        ctx.lineTo(x, y);
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
  }, [beatInterval, waveformPattern, amplitude, frequency]); // Redraw when these change

  return (
    <div className="waveform-container">
      <canvas 
        ref={canvasRef}
        width={500} 
        height={300} 
        className="bg-black"
      />
    </div>
  );
};

export default WaveformCanvas; 