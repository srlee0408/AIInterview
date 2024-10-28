import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface SpeechButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const SpeechButton = ({ isListening, onStart, onStop }: SpeechButtonProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? onStop : onStart}
        className={`
          p-6 rounded-full shadow-lg flex flex-col items-center justify-center
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-primary hover:bg-secondary'}
          transition-colors duration-200
          relative
        `}
        aria-label={isListening ? '음성 인식 중지' : '음성 인식 시작'}
      >
        {isListening ? (
          <StopIcon className="h-8 w-8 text-white" />
        ) : (
          <MicrophoneIcon className="h-8 w-8 text-white" />
        )}
      </motion.button>
      <span className={`text-sm font-medium ${
        isListening ? 'text-red-500' : 'text-primary dark:text-white'
      }`}>
        {isListening ? '눌러서 중지하기' : '눌러서 음성 인식 시작하기'}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isListening 
          ? '음성 인식이 진행 중입니다' 
          : '버튼을 누르면 음성 인식이 시작됩니다'}
      </span>
    </div>
  );
};
