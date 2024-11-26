import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WebcamPreviewProps {
  isActive: boolean;
  onError?: (error: string) => void;
}

export const WebcamPreview = ({ isActive, onError }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      if (!isActive) return;
      
      try {
        // 이미 권한을 받았다고 가정하고 시도
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error('카메라 접근 오류:', err);
        setHasPermission(false);
        onError && onError(err as string);
      } finally {
        setIsLoading(false);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onError]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-[300px] h-[300px] mx-auto bg-gray-900 overflow-hidden rounded-lg"
    >
      {/* 로딩 표시 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
          >
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-2" />
              <p className="text-sm">카메라 연결 중...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 비디오 미리보기 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        className={`w-[300px] h-[300px] object-cover ${hasPermission ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 권한 없음 표시 */}
      {!hasPermission && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-4">
          <div>
            <span className="text-3xl mb-2 block">📷</span>
            <h3 className="text-lg font-bold mb-1">카메라 권한이 필요합니다</h3>
            <p className="text-gray-400 text-xs">
              브라우저 설정에서 카메라 권한을 허용해주세요
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 