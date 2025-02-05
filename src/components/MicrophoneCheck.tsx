import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MicrophoneCheckProps {
  onComplete: () => void;
}

export const MicrophoneCheck = ({ onComplete }: MicrophoneCheckProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasDetectedSound, setHasDetectedSound] = useState(false);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let animationFrame: number;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
          
          if (average > 30) {
            setHasDetectedSound(true);
          }
          
          animationFrame = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch (err) {
        console.error('마이크 접근 오류:', err);
      }
    };

    if (isRecording) {
      initAudio();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);

  const handleStartTest = () => {
    setIsRecording(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-[100dvh] flex flex-col items-center justify-center px-4 py-6 md:py-12"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 w-full max-w-[500px]">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          마이크 확인
        </h2>
        <p className="text-xs md:text-xl text-gray-500 dark:text-gray-400 text-center mb-6">
          마이크 확인을 위해 <span className="text-yellow-400">"안녕하세요"</span> 라고 말씀해주세요.
        </p>

        {!isRecording ? (
          <button
            onClick={handleStartTest}
            className="w-full py-3 md:py-4 rounded-lg font-medium text-center text-xl md:text-3xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            마이크 테스트 시작
          </button>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                animate={{ width: `${(audioLevel / 255) * 100}%` }}
              />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {hasDetectedSound ? '음성이 감지되었습니다!' : '말씀해주세요...'}
            </p>
            <button
              onClick={onComplete}
              disabled={!hasDetectedSound}
              className={`
                w-full py-3 md:py-4 rounded-lg font-medium text-center text-xl md:text-3xl
                transition-all duration-200
                ${hasDetectedSound 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
              `}
            >
              {hasDetectedSound ? '마이크 확인 완료' : '음성 감지 대기 중...'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 