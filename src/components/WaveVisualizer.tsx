import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveVisualizerProps {
  isListening: boolean;
}

export const WaveVisualizer = ({ isListening }: WaveVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (isListening) {
      let audioContext: AudioContext;
      let analyser: AnalyserNode;
      let mediaStream: MediaStream;

      const initializeAudio = async () => {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(mediaStream);
          
          source.connect(analyser);
          analyser.fftSize = 256;
          
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;
          
          draw();
        } catch (err) {
          console.error('Error accessing microphone:', err);
        }
      };

      initializeAudio();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening]);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    const width = canvas.width;
    const height = canvas.height;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(34, 34, 34)';
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = dataArray[i] / 2;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(1, '#4f46e5');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isListening ? 1 : 0 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full rounded-lg bg-gray-900"
      />
    </motion.div>
  );
};
