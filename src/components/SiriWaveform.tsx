import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SiriWaveformProps {
  isListening: boolean;
}

export const SiriWaveform = ({ isListening }: SiriWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const waveCount = 5;
  const waves = useRef<Array<{ amplitude: number; frequency: number; phase: number; color: string }>>([]);

  useEffect(() => {
    if (!waves.current.length) {
      const colors = [
        'rgba(37, 99, 235, 0.2)',  // primary
        'rgba(79, 70, 229, 0.2)',  // secondary
        'rgba(124, 58, 237, 0.2)', // purple
        'rgba(79, 70, 229, 0.2)',  // secondary
        'rgba(37, 99, 235, 0.2)',  // primary
      ];

      for (let i = 0; i < waveCount; i++) {
        waves.current.push({
          amplitude: 0.3 + (i * 0.1),
          frequency: 0.02 - (i * 0.003),
          phase: i * Math.PI / 3,
          color: colors[i]
        });
      }
    }

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.current.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin(x * wave.frequency + wave.phase) * 
            wave.amplitude * 
            canvas.height * 
            (isListening ? 1 : 0.3);

          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        wave.phase += isListening ? 0.05 : 0.02;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full max-w-lg"
      />
    </motion.div>
  );
};
