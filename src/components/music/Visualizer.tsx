'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface VisualizerProps {
  frequencyData: Uint8Array | null;
  isPlaying: boolean;
  activeColor?: string;
}

export default function Visualizer({
  frequencyData,
  isPlaying,
  activeColor = '#a855f7' // purple-500
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [gradients, setGradients] = useState<Record<number, CanvasGradient>>({});
  const [smoothedData, setSmoothedData] = useState<Float32Array | null>(null);
  
  // Initialize smoothed data when frequency data changes
  useEffect(() => {
    if (!frequencyData) return;
    
    const smoothingFactor = 0.3; // Lower = smoother
    let smoothed: Float32Array;
    
    if (!smoothedData || smoothedData.length !== frequencyData.length) {
      smoothed = new Float32Array(frequencyData.length);
      for (let i = 0; i < frequencyData.length; i++) {
        smoothed[i] = frequencyData[i] / 255;
      }
    } else {
      smoothed = new Float32Array(frequencyData.length);
      for (let i = 0; i < frequencyData.length; i++) {
        smoothed[i] = smoothingFactor * (frequencyData[i] / 255) + 
                      (1 - smoothingFactor) * smoothedData[i];
      }
    }
    
    setSmoothedData(smoothed);
  }, [frequencyData, smoothedData]);

  // Setup canvas for high DPI displays
  const setupCanvas = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas dimensions accounting for device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the context
    ctx.scale(dpr, dpr);
    
    // Set CSS dimensions
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  // Draw the visualizer
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get dimensions and calculate bars
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const centerY = height / 2;
    
    // If no data or not playing, show a static visualization
    if (!smoothedData || !isPlaying) {
      const barCount = 64; // Number of bars
      const barWidth = width / barCount;
      
      ctx.fillStyle = 'rgba(100, 100, 120, 0.2)'; // Soft color for inactive state
      
      // Draw static bars for inactive state
      for (let i = 0; i < barCount; i++) {
        // Create a static wave-like shape
        const randomHeight = Math.sin(i * 0.15) * 6 + 3;
        
        // Draw above and below center line
        ctx.fillRect(
          i * barWidth,
          centerY - randomHeight / 2,
          barWidth - 1,
          randomHeight
        );
      }
      
      animationFrameRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }

    // Setup for active visualizer
    const barCount = Math.min(smoothedData.length, 64); // Limit number of bars
    const barWidth = width / barCount;

    // Draw bars based on frequency data
    for (let i = 0; i < barCount; i++) {
      // Calculate height based on audio value (using exponential for better visual results)
      const barHeight = Math.pow(smoothedData[i], 1.5) * (height * 0.8);
      
      // Use cached gradients or create new ones if needed
      if (!gradients[i]) {
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        gradient.addColorStop(0, `${activeColor}80`); // Top color with transparency
        gradient.addColorStop(0.5, activeColor); // Center solid color
        gradient.addColorStop(1, `${activeColor}80`); // Bottom color with transparency
        
        const newGradients = { ...gradients };
        newGradients[i] = gradient;
        setGradients(newGradients);
      }
      
      ctx.fillStyle = gradients[i] || `${activeColor}`;
      
      // Draw symmetrical bars above and below
      ctx.fillRect(
        i * barWidth, 
        centerY - barHeight / 2, 
        barWidth - 1, 
        barHeight
      );
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [smoothedData, isPlaying, activeColor, gradients]);

  // Effect for rendering visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup and start animation
    setupCanvas(canvas, ctx);
    drawVisualizer();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setupCanvas, drawVisualizer]);

  return (
    <div className="relative w-full h-16 overflow-hidden rounded-lg bg-gray-800/50">
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400"
          >
            Música en pausa
          </motion.span>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
} 