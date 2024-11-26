import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface CameraCheckProps {
  onComplete: () => void;
}

export const CameraCheck = ({ onComplete }: CameraCheckProps) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error('카메라 접근 오류:', err);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-[100dvh] flex flex-col items-center justify-center px-4 py-6 md:py-12"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 w-full max-w-[500px]">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          카메라 확인
        </h2>
        <p className="text-xs md:text-xl text-gray-500 dark:text-gray-400 text-center mb-6">
          얼굴이 잘 보이도록 카메라를 조정해주세요. <br/>카메라 확인이 완료되면 <span className="text-yellow-400">"카메라 확인 완료"</span> <br/>버튼을 눌러주세요.
        </p>

        {/* 카메라 미리보기 */}
        <div className="w-full aspect-[4/3] relative bg-black rounded-xl overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            style={{
              transform: 'scaleX(-1)',
              WebkitTransform: 'scaleX(-1)'
            }}
          />
        </div>
        
        <button
          onClick={onComplete}
          disabled={!isCameraReady}
          className={`
            w-full py-3 md:py-4 rounded-lg font-medium text-center text-xl md:text-3xl
            transition-all duration-200
            ${isCameraReady 
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          {isCameraReady ? '카메라 확인 완료' : '카메라 연결 중...'}
        </button>
      </div>
    </motion.div>
  );
}; 