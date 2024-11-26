import { useEffect, useRef, memo } from 'react';

interface WebcamPreviewProps {
  isActive: boolean;
  onError: (error: any) => void;
}

export const WebcamPreview = memo(({ isActive, onError }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!isActive || streamRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (mounted && videoRef.current && !videoRef.current.srcObject) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('카메라 접근 오류:', err);
        onError(err);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover mirror"
    />
  );
}, (prevProps, nextProps) => prevProps.isActive === nextProps.isActive);

WebcamPreview.displayName = 'WebcamPreview'; 