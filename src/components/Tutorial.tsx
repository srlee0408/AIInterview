import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 웹캠 미리보기 컴포넌트 (실제 면접과 동일한 UI)
import { WebcamPreview } from './WebcamPreview';
import { SpeechButton } from './SpeechButton';
// 음성 녹음 훅 (실제 면접의 녹음 기능과 동일하게 활용)
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
// 음성 합성 서비스를 ElevenLabs 등에서 사용 (기존의 서비스와 동일)
import { textToSpeech, playAudio } from '../services/elevenlabs';
import { TextDisplay } from './TextDisplay';  // TextDisplay 컴포넌트 추가

interface TutorialProps {
  onComplete: () => void;
}

// 튜토리얼 컴포넌트는 실제 면접 화면과 동일한 UI/UX를 제공합니다.
export const Tutorial = ({ onComplete }: TutorialProps) => {
  // AI 음성 안내 진행 여부
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  // 음성 녹음 관련 훅
  const { text, isListening, startListening, stopListening, resetText } = useSpeechRecognition();
  // 음성 인식 완료 상태 추가
  const [isRecognitionComplete, setIsRecognitionComplete] = useState(true);
  // 음성 인식 처리 상태 추가
  const [isProcessing, setIsProcessing] = useState(false);

  // 컴포넌트 마운트 시, AI 면접관이 연습 안내 음성을 재생합니다.
  useEffect(() => {
    const speakTutorialMessage = async () => {
      setIsAiSpeaking(true);
      try {
        const tutorialMessage = "이것은 연습 과정입니다. 초록색 답변 시작. 버튼을 눌러 답변이 제대로 나오는지 확인해보세요. 답변 완료 후. 빨간색 답변 종료. 버튼을 눌러주세요. 연습이 충분하다면 면접 진행하기 버튼을 눌러 면접을 진행해보세요.";
        const audioData = await textToSpeech(tutorialMessage);
        
        // 오디오 재생이 완료될 때까지 기다림
        const audio = new Audio(URL.createObjectURL(new Blob([audioData])));
        
        audio.addEventListener('ended', () => {
          setIsAiSpeaking(false);
        });

        audio.addEventListener('error', () => {
          console.error("오디오 재생 중 오류 발생");
          setIsAiSpeaking(false);
        });

        await audio.play();
      } catch (error) {
        console.error("튜토리얼 음성 안내 에러:", error);
        setIsAiSpeaking(false);
      }
    };

    speakTutorialMessage();

    // 컴포넌트 언마운트 시 isAiSpeaking 상태 초기화
    return () => {
      setIsAiSpeaking(false);
    };
  }, []);

  // 녹음 토글 함수 수정
  const handleToggleRecording = async () => {
    if (!isListening) {
      resetText();
      await startListening();
    } else {
      // 먼저 처리 중 상태로 변경하여 버튼 비활성화
      setIsProcessing(true);
      // 그 다음 녹음 중지
      await stopListening();
      
      // 음성 인식된 텍스트가 표시되기를 기다린 후 버튼 다시 활성화
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-[100dvh] flex flex-col justify-start px-3 py-4 md:px-4 md:py-6"
    >
      {/* 카메라 미리보기 (실제 면접과 동일) */}
      <div className="w-full max-w-[300px] min-w-[250px] md:max-w-[400px] md:min-w-[300px] h-full flex flex-col relative mx-auto mb-4 md:mb-6">
        <div className="w-full max-w-[250px] min-w-[250px] md:max-w-[300px] md:min-w-[300px] h-full max-h-[250px] min-h-[250px] md:max-h-[300px] md:min-h-[300px] mx-auto relative bg-black rounded-xl overflow-hidden">
          <WebcamPreview 
            isActive={true} 
            onError={(error) => console.error("웹캠 오류:", error)}
          />
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/50 px-2 py-1 md:px-3 md:py-1 rounded-full">
            <p className="text-white text-xs md:text-sm">연습 중</p>
          </div>
        </div>
      </div>

      {/* 튜토리얼 컨텐츠: 면접 응답 환경과 동일한 UI */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-3 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
        {/* AI 면접관 안내 영역 */}
        <div className="mb-4 md:mb-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg flex items-center justify-center space-x-2"
            >
              <motion.div
                animate={{ scale: isAiSpeaking ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: isAiSpeaking ? Infinity : 0 }}
                className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"
              />
              <span>
                {isAiSpeaking 
                  ? <div className="text-base md:text-2xl font-medium break-keep">AI 면접관이 말하는 중...</div> 
                  : <div className="text-center text-2xl md:text-2xl break-keep space-y-1">
                      <p>초록색 답변 시작 버튼을 눌러 답변이 제대로 나오는지 확인해보세요.</p>
                      <p>답변 완료 후 빨간색 답변 종료 버튼을 눌러주세요.</p>
                    </div>
                }
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 답변 버튼 */}
        <div className="flex justify-center mb-3 md:mb-4">
          <SpeechButton 
            isListening={isListening} 
            onToggle={handleToggleRecording}
            isAiSpeaking={isAiSpeaking}
            isAnswering={false}
            disabled={isAiSpeaking || isProcessing}
          />
        </div>

        {/* 답변 텍스트 표시 영역 */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 md:p-4 shadow-sm min-h-[80px] md:min-h-[100px] mb-3 md:mb-4">
          {isProcessing ? (
            <div className="text-gray-500 text-lg animate-pulse">음성 인식 중...</div>
          ) : (
            <TextDisplay text={text} />
          )}
        </div>

        {/* 튜토리얼 완료 버튼: 실제 면접 단계로 전환 */}
        <div className="mt-6">
          <button
            onClick={onComplete}
            disabled={isAiSpeaking}
            className={`w-full py-3 md:py-4 rounded-lg font-medium text-center text-xl md:text-3xl 
              ${isAiSpeaking 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl'
              } 
              text-white shadow-lg transition-all duration-200`}
          >
            면접 진행하기
          </button>
        </div>
      </div>
    </motion.div>
  );
}; 