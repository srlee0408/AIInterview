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
    <div className="relative flex flex-col items-center justify-center w-full h-[20vh] md:h-[250px]">
      {/* 배경 효과 - 더 부드럽고 명확한 색상으로 변경 */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: isListening 
            ? 'linear-gradient(to right, #ff6b6b, #ff8787)' 
            : 'linear-gradient(to right, #40c057, #51cf66)',
          opacity: 0.15
        }}
      />
      
      {/* 메인 버튼 - 더 큰 크기와 명확한 디자인 */}
      <motion.button
        onClick={onToggle}
        disabled={isAiSpeaking || (isAnswering && !isListening)}
        className={`
          relative z-10 w-60 h-40 md:w-60 md:h-40 rounded-2xl 
          flex flex-col items-center justify-center
          border-4 ${isListening ? 'border-red-500' : 'border-green-500'}
          shadow-lg
          ${isListening ? 'bg-red-500' : 'bg-green-500'}
          ${(isAiSpeaking || (isAnswering && !isListening)) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-2xl hover:brightness-110'}
          transition-all duration-300
        `}
        whileTap={{ scale: 0.95 }}
      >
        {/* 아이콘 추가 */}
        <div className="mb-2">
          {isListening ? (
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
        
        {/* 버튼 텍스트 - 더 큰 폰트 크기와 굵은 글씨 */}
        <span className="text-white text-5xl md:text-5xl font-bold">
          {isListening ? '답변 종료' : '답변 시작'}
        </span>
        
        {/* 상태 텍스트 - 더 명확한 안내 */}
        <span className="text-white text-base md:text-lg mt-2">
          {isAiSpeaking ? 'AI면접관이 말하는 중...' :
           (isAnswering && !isListening) ? '답변 전송 중...' :
           (isListening ? '답변 완료 후 버튼을 눌러주세요' : '버튼을 눌러 답변을 해주세요')}
        </span>
      </motion.button>
    </div>
  );
};