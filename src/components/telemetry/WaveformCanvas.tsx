/**
 * Aegis Health — High-Performance Hospital-Monitor Canvas 2D Waveform Renderer
 * Compliant with PLAN.md Section 7.4
 */

import React, { useEffect, useRef } from 'react';
import { WaveformRingBuffer } from '../../lib/ringBuffer';

interface WaveformCanvasProps {
  ringBuffer: WaveformRingBuffer;
  isPaused?: boolean;
  sampleRateHz?: number;
  windowDurationSeconds?: number;
  color?: string;
  height?: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  ringBuffer,
  isPaused = false,
  sampleRateHz = 250,
  windowDurationSeconds = 8,
  color = '#10b981',
  height = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const totalSamplesToDisplay = sampleRateHz * windowDurationSeconds;

    const render = () => {
      const width = rect.width;
      const h = rect.height;

      // 1. Clear background
      ctx.fillStyle = '#060a1a';
      ctx.fillRect(0, 0, width, h);

      // 2. Draw subtle clinical hospital monitor grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;

      const gridSpacingX = width / 16;
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const gridSpacingY = h / 6;
      for (let y = 0; y < h; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Isoelectric baseline (center)
      const centerY = h * 0.58;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // 3. Fetch recent samples
      const { values, gaps, length } = ringBuffer.getRecent(totalSamplesToDisplay);

      if (length > 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Glowing trace effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        const amplitudeScale = h * 0.35; // Scaling factor for a.u.
        let inGap = false;

        ctx.beginPath();

        for (let i = 0; i < length; i++) {
          const x = (i / (totalSamplesToDisplay - 1)) * width;
          const y = centerY - values[i] * amplitudeScale;

          if (gaps[i] === 1) {
            inGap = true;
            continue;
          }

          if (inGap || i === 0) {
            ctx.moveTo(x, y);
            inGap = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Draw active sweeping telemetry lead head dot
        if (!isPaused && length > 0) {
          const lastIdx = length - 1;
          const headX = (lastIdx / (totalSamplesToDisplay - 1)) * width;
          const headY = centerY - values[lastIdx] * amplitudeScale;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(headX, headY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reset shadow
        ctx.shadowBlur = 0;
      }

      if (!isPaused) {
        animFrameId.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [ringBuffer, isPaused, sampleRateHz, windowDurationSeconds, color, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height }}
      className="block rounded-2xl overflow-hidden"
    />
  );
};

