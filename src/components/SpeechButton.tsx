import { motion, AnimatePresence } from 'framer-motion';
import { SiriWaveform } from './SiriWaveform';
import { useEffect } from 'react';

interface SpeechButtonProps {
  isListening: boolean;
  onToggle: () => void;
}

export const SpeechButton = ({ isListening, onToggle }: SpeechButtonProps) => {
  // 햅틱 피드백 추가
  useEffect(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(isListening ? [100] : [50]);
    }
  }, [isListening]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[40vh] md:h-[500px]">
      {/* 배경 효과 */}
      <motion.div
        className="absolute inset-0 animate-gradient rounded-full blur-3xl"
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
          opacity: isListening ? 0.8 : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: isListening ? Infinity : 0,
        }}
      />
      
      {/* 웨이브폼 */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <SiriWaveform isListening={isListening} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 버튼 */}
      <motion.button
        onClick={onToggle}
        className={`
          relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full 
          glass animate-gradient
          shadow-lg flex flex-col items-center justify-center
          transition-all duration-300 group
          hover:shadow-2xl hover:shadow-primary/30
          active:scale-95 touch-none
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isListening 
            ? '0 0 50px rgba(59, 130, 246, 0.5)' 
            : '0 0 20px rgba(59, 130, 246, 0.2)',
        }}
      >
        {/* 내부 링 효과 */}
        <motion.div
          className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
            opacity: isListening ? [0.5, 0.8, 0.5] : 0.5,
          }}
          transition={{
            duration: 2,
            repeat: isListening ? Infinity : 0,
          }}
        />
        
        {/* 버튼 텍스트 */}
        <motion.span 
          className="text-white text-lg md:text-xl font-medium z-10 mb-1 md:mb-2"
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0,
          }}
        >
          {isListening ? '녹음 중' : '눌러서 시작'}
        </motion.span>
        <span className="text-white/70 text-xs md:text-sm z-10">
          {isListening ? '클릭하여 중지' : '음성 인식 시작하기'}
        </span>
      </motion.button>

      {/* 상태 표시 */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className={`text-xs md:text-sm ${
          isListening ? 'text-primary' : 'text-gray-500'
        } dark:text-gray-400`}>
          {isListening ? '음성을 인식하고 있습니다...' : '대기 중'}
        </span>
      </motion.div>
    </div>
  );
};
