import { motion, AnimatePresence } from 'framer-motion';
import { SiriWaveform } from './SiriWaveform';
import { useEffect } from 'react';

interface SpeechButtonProps {
  isListening: boolean;
  onToggle: () => void;
  isAiSpeaking: boolean;
  isAnswering: boolean;
  disabled: boolean;
}

export const SpeechButton = ({ isListening, onToggle, isAiSpeaking, isAnswering }: SpeechButtonProps) => {
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
        disabled={isAiSpeaking || (isAnswering && !isListening)}
        className={`
          relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full 
          glass animate-gradient
          shadow-lg flex flex-col items-center justify-center
          transition-all duration-300 group
          ${(isAiSpeaking || (isAnswering && !isListening)) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-primary/30'}
          active:scale-95 touch-none
          ${isListening ? 'bg-red-500' : 'bg-green-500'}
        `}
        whileHover={{ scale: (isAiSpeaking || (isAnswering && !isListening)) ? 1 : 1.05 }}
        whileTap={{ scale: (isAiSpeaking || (isAnswering && !isListening)) ? 1 : 0.95 }}
        animate={{
          boxShadow: isListening 
            ? '0 0 50px rgba(239, 68, 68, 0.5)' 
            : '0 0 20px rgba(34, 197, 94, 0.5)',
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
          {isListening ? '답변 종료' : '답변 시작'}
        </motion.span>
        <span className="text-white/70 text-xs md:text-sm z-10">
          {isAiSpeaking ? 'AI 응답 중...' : 
           (isAnswering && !isListening) ? '답변 진행 중...' :
           (isListening ? '클릭하여 종료' : '클릭하여 시작')}
        </span>
      </motion.button>

      {/* 답변 가능 표시 */}
      {isListening && !isAiSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-1/1 transform -translate-x-1/2 translate-y-full mt-4"
        >
          <div className="px-4 py-2 bg-red-500 text-white rounded-full shadow-lg animate-pulse">
            지금 대답해주세요
          </div>
        </motion.div>
      )}
    </div>
  );
};