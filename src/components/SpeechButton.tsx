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

export const SpeechButton = ({ isListening, onToggle, isAiSpeaking, isAnswering, disabled }: SpeechButtonProps) => {
  useEffect(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(isListening ? [100] : [50]);
    }
  }, [isListening]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[180px] md:min-h-[240px]">
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
        disabled={isAiSpeaking || (isAnswering && !isListening) || disabled}
        className={`
          relative z-10
          w-[90%] max-w-[280px] md:max-w-[360px]
          aspect-[1.6/1]
          rounded-2xl 
          flex flex-col items-center justify-center
          space-y-[2%]
          border-4 
          ${(isAiSpeaking || (isAnswering && !isListening) || disabled)
            ? 'border-gray-400 bg-gray-400'
            : isListening
              ? 'border-red-500 bg-red-500'
              : 'border-green-500 bg-green-500'
          }
          shadow-lg
          ${(isAiSpeaking || (isAnswering && !isListening) || disabled) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-2xl hover:brightness-110'}
          transition-all duration-300
        `}
        whileTap={{ scale: 0.95 }}
      >
        {/* 아이콘 */}
        <div className="w-[15%] aspect-square mb-[2%]">
          {isListening ? (
            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
        
        {/* 버튼 텍스트 */}
        <span className="text-white text-[min(12vw,2.5rem)] font-bold">
          {isListening ? '답변 종료' : '답변 시작'}
        </span>
        
        {/* 상태 텍스트 */}
        <span className="text-white text-[min(6vw,1rem)] px-2 text-center break-keep">
          {isAiSpeaking ? 'AI면접관이 말하는 중...' :
           (isAnswering && !isListening) ? '답변 전송 중...' :
           (isListening ? '답변 완료 후 버튼을 눌러주세요' : 
            disabled ? '답변이 전송되었습니다' :
            '버튼을 눌러 답변을 해주세요'
           )}
        </span>
      </motion.button>
    </div>
  );
};